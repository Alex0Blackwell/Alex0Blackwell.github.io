"""Small, dependency-free browser QA helper for the static site.

Requires an HTTP server at http://127.0.0.1:8000 and a Chromium browser
started with --headless --remote-debugging-port=9223 --remote-allow-origins=*.
Run: python tests/check_site.py --output tests/desktop.png
Import Browser to exercise the actual canvas with mouse or touch input.
"""

import argparse
import base64
import json
import os
import socket
import struct
import time
import urllib.parse
import urllib.request


class WebSocket:
    """The minimal RFC 6455 client needed for the local DevTools protocol."""

    def __init__(self, url):
        parsed = urllib.parse.urlparse(url)
        self.sock = socket.create_connection((parsed.hostname, parsed.port), 15)
        self.sock.settimeout(15)
        self.buffer = b""
        key = base64.b64encode(os.urandom(16)).decode("ascii")
        path = parsed.path + (("?" + parsed.query) if parsed.query else "")
        request = (
            "GET {} HTTP/1.1\r\nHost: {}:{}\r\nUpgrade: websocket\r\n"
            "Connection: Upgrade\r\nSec-WebSocket-Key: {}\r\n"
            "Sec-WebSocket-Version: 13\r\nOrigin: http://localhost\r\n\r\n"
        ).format(path, parsed.hostname, parsed.port, key)
        self.sock.sendall(request.encode("ascii"))
        while b"\r\n\r\n" not in self.buffer:
            self.buffer += self.sock.recv(4096)
        header, self.buffer = self.buffer.split(b"\r\n\r\n", 1)
        if b" 101 " not in header.split(b"\r\n", 1)[0]:
            raise RuntimeError("WebSocket upgrade failed: " + header.decode())

    def _read(self, size):
        while len(self.buffer) < size:
            incoming = self.sock.recv(max(4096, size - len(self.buffer)))
            if not incoming:
                raise ConnectionError("DevTools socket closed")
            self.buffer += incoming
        data, self.buffer = self.buffer[:size], self.buffer[size:]
        return data

    def send(self, text, opcode=1):
        payload = text.encode("utf-8") if isinstance(text, str) else text
        length = len(payload)
        header = bytes([0x80 | opcode])
        if length < 126:
            header += bytes([0x80 | length])
        elif length < 65536:
            header += bytes([0x80 | 126]) + struct.pack("!H", length)
        else:
            header += bytes([0x80 | 127]) + struct.pack("!Q", length)
        mask = os.urandom(4)
        data = bytes(value ^ mask[index % 4] for index, value in enumerate(payload))
        self.sock.sendall(header + mask + data)

    def receive(self):
        chunks = []
        while True:
            first, second = self._read(2)
            opcode = first & 15
            length = second & 127
            if length == 126:
                length = struct.unpack("!H", self._read(2))[0]
            elif length == 127:
                length = struct.unpack("!Q", self._read(8))[0]
            mask = self._read(4) if second & 128 else None
            payload = self._read(length)
            if mask:
                payload = bytes(value ^ mask[index % 4] for index, value in enumerate(payload))
            if opcode == 8:
                raise ConnectionError("DevTools closed the WebSocket")
            if opcode == 9:
                self.send(payload, opcode=10)
                continue
            if opcode in (0, 1):
                chunks.append(payload)
                if first & 128:
                    return b"".join(chunks).decode("utf-8")

    def close(self):
        self.sock.close()


class Browser:
    def __init__(self, port=9223):
        base = "http://127.0.0.1:{}".format(port)
        with urllib.request.urlopen(base + "/json/list", timeout=10) as response:
            targets = json.load(response)
        target = next((item for item in targets if item.get("type") == "page"), None)
        if not target:
            request = urllib.request.Request(base + "/json/new?about:blank", method="PUT")
            with urllib.request.urlopen(request, timeout=10) as response:
                target = json.load(response)
        self.ws = WebSocket(target["webSocketDebuggerUrl"])
        self.sequence = 0
        self.events = []
        self.call("Page.enable")
        self.call("Runtime.enable")
        self.call("Log.enable")

    def call(self, method, params=None):
        self.sequence += 1
        sequence = self.sequence
        self.ws.send(json.dumps({"id": sequence, "method": method, "params": params or {}}))
        while True:
            result = json.loads(self.ws.receive())
            if result.get("id") == sequence:
                if "error" in result:
                    raise RuntimeError("{}: {}".format(method, result["error"]))
                return result.get("result", {})
            self.events.append(result)

    def evaluate(self, expression):
        result = self.call("Runtime.evaluate", {
            "expression": expression, "returnByValue": True, "awaitPromise": True,
            "userGesture": True,
        })
        if "exceptionDetails" in result:
            raise RuntimeError(json.dumps(result["exceptionDetails"]))
        return result.get("result", {}).get("value")

    def viewport(self, width=1440, height=1000, mobile=False, scale=1):
        self.call("Emulation.setDeviceMetricsOverride", {
            "width": width, "height": height, "deviceScaleFactor": scale,
            "mobile": mobile, "screenWidth": width, "screenHeight": height,
        })
        self.call("Emulation.setTouchEmulationEnabled", {"enabled": mobile})

    def capabilities(self):
        return self.evaluate("""(() => {
          const gl = document.createElement('canvas').getContext('webgl2');
          const debug = gl && gl.getExtension('WEBGL_debug_renderer_info');
          const result = {agent:navigator.userAgent,webgl2:!!gl,
            renderer:debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null};
          if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext();
          return result;
        })()""")

    def open(self, url="http://127.0.0.1:8000", wait_scene=True, timeout=30):
        self.events = []
        self.call("Page.navigate", {"url": url})
        deadline = time.time() + timeout
        while time.time() < deadline:
            ready = self.evaluate("document.readyState === 'complete'" + (
                " && !!window.__deskScene" if wait_scene else ""))
            if ready:
                return
            time.sleep(0.15)
        raise TimeoutError("Page did not become ready: " + url)

    def screenshot(self, path):
        result = self.call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
        parent = os.path.dirname(os.path.abspath(path))
        os.makedirs(parent, exist_ok=True)
        with open(path, "wb") as output:
            output.write(base64.b64decode(result["data"]))
        return path

    def mouse(self, kind, x, y, pressed=False):
        params = {"type": kind, "x": x, "y": y, "button": "left" if pressed or kind == "mouseReleased" else "none"}
        if kind in ("mousePressed", "mouseReleased"):
            params["clickCount"] = 1
        params["buttons"] = 1 if pressed else 0
        self.call("Input.dispatchMouseEvent", params)

    def drag(self, start, end, steps=20, duration=0.5, release=True):
        self.mouse("mouseMoved", start[0], start[1])
        self.mouse("mousePressed", start[0], start[1], True)
        for step in range(1, steps + 1):
            amount = step / float(steps)
            self.mouse("mouseMoved", start[0] + (end[0] - start[0]) * amount,
                       start[1] + (end[1] - start[1]) * amount, True)
            time.sleep(duration / steps)
        if release:
            self.mouse("mouseReleased", end[0], end[1])

    def touch_drag(self, start, end, steps=16, duration=0.5, release=True):
        def touch(kind, x, y):
            points = [] if kind == "touchEnd" else [{"x": x, "y": y, "id": 1, "radiusX": 3, "radiusY": 3, "force": 1}]
            self.call("Input.dispatchTouchEvent", {"type": kind, "touchPoints": points})
        touch("touchStart", start[0], start[1])
        for step in range(1, steps + 1):
            amount = step / float(steps)
            touch("touchMove", start[0] + (end[0] - start[0]) * amount,
                  start[1] + (end[1] - start[1]) * amount)
            time.sleep(duration / steps)
        if release:
            touch("touchEnd", end[0], end[1])

    def errors(self):
        self.evaluate("true")  # Drain pending protocol events.
        return [event for event in self.events if
                event.get("method") == "Runtime.exceptionThrown" or
                (event.get("method") == "Log.entryAdded" and
                 event.get("params", {}).get("entry", {}).get("level") == "error")]

    def close(self):
        self.ws.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=9223)
    parser.add_argument("--url", default="http://127.0.0.1:8000")
    parser.add_argument("--width", type=int, default=1440)
    parser.add_argument("--height", type=int, default=1000)
    parser.add_argument("--mobile", action="store_true")
    parser.add_argument("--no-scene", action="store_true")
    parser.add_argument("--output", default="tests/desktop.png")
    parser.add_argument("--evaluate", default="window.__deskScene && window.__deskScene.snapshot()")
    args = parser.parse_args()
    browser = Browser(args.port)
    try:
        browser.viewport(args.width, args.height, args.mobile)
        browser.open(args.url, wait_scene=not args.no_scene)
        time.sleep(1)
        print(json.dumps({"evaluation": browser.evaluate(args.evaluate), "errors": browser.errors()}, indent=2))
        browser.screenshot(args.output)
        print("Screenshot: " + args.output)
    finally:
        browser.close()


if __name__ == "__main__":
    main()
