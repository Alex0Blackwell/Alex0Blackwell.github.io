"""Table collision, routing, and depth checks in the actual browser."""
import time
from check_site import Browser
from check_doodle import state, item, settled


def run():
    b = Browser()
    try:
        for width, height in [(1440, 1000), (390, 844)]:
            b.viewport(width, height, width < 600)
            b.open()
            result = b.evaluate("""(() => {
              const n = DeskNavigation, r = {left:100,right:300,top:200,bottom:260};
              for (const x of [120,280]) {
                const start = {x,y:320}, target = {x,y:150};
                const plan = n.route(start,target,r,'front');
                let previous = start;
                for (const point of plan.path) {
                  if (n.entry(previous,point,r) !== null) return 'Route crosses table';
                  previous = point;
                }
                if (!plan.path.some(p => p.x < r.left || p.x > r.right)) return 'Missing detour';
                const stopped = n.constrain(start,target,r,'front');
                if (stopped.y < r.bottom) return 'Swept collision failed';
              }
              return 'ok';
            })()""")
            assert result == 'ok', result
            # Throwing the occupied chair must obey the same swept boundary.
            s = state(b)
            p = item(s, 'chair')['screen']
            b.drag((p['x'],p['y']), (p['x'],p['y']+160*s['scale']), release=False)
            time.sleep(.2)
            assert item(state(b),'chair')['held']
            b.mouse('mouseReleased',p['x'],p['y']+160*s['scale'])
            time.sleep(.3)
            dropped = state(b)
            assert item(dropped,'character')['position'] == item(dropped,'chair')['position']
            assert item(dropped,'chair')['position'][1] <= dropped['navigation']['barrier']['top']+.1
            settled(b)
            # A held character can cross the table using mouse or touch.
            s = state(b)
            p = item(s, 'character')['screen']
            drag = b.touch_drag if width < 600 else b.drag
            drag((p['x'], p['y']), (p['x'], p['y']+180*s['scale']), release=False)
            time.sleep(.2)
            held = state(b)
            assert item(held, 'character')['held']
            assert item(held, 'character')['position'][1] > held['navigation']['barrier']['bottom']
            assert b.evaluate("getComputedStyle(document.querySelector('#character')).outlineStyle") == 'none'
            if width < 600:
                b.call('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
            else:
                b.mouse('mouseReleased', p['x'], p['y']+180*s['scale'])
            # Once released on the near side, walk around an end to return.
            samples = []
            deadline = time.time()+25
            while time.time() < deadline:
                sample = b.evaluate("""(() => {
                  const s=__deskScene.snapshot();
                  s.order=[...document.querySelector('#world').children].map(e=>e.id);
                  return s;
                })()""")
                samples.append(sample)
                if sample['typing']:
                    break
                time.sleep(.035)
            assert samples[-1]['typing'], samples[-1]
            assert any(v['navigation']['side']=='front' for v in samples)
            assert any(v['navigation']['side']=='back' and not v['typing'] for v in samples)
            for v in samples:
                x,y = item(v,'character')['position']
                r = v['navigation']['barrier']
                assert not (r['left']<x<r['right'] and r['top']<y<r['bottom']),v
                order = v['order']
                front = order.index('character') > order.index('desk-top')
                assert front == (v['navigation']['side']=='front'),v
                assert (order.index('character') > order.index('desk')) == front,v
            for previous,current in zip(samples,samples[1:]):
                if previous['navigation']['side']=='front' and current['navigation']['side']=='back':
                    x,y = item(current,'character')['position']
                    r=current['navigation']['barrier']
                    # Allow a single sampled frame of movement past the corner.
                    assert x < r['left']+15 or x > r['right']-15,current
            print(f'PASS {width}px: free character dragging, no outline, walking around table, chair collisions, recovery',flush=True)
        assert not b.errors(),b.errors()
    finally:
        b.close()


if __name__ == '__main__':
    run()
