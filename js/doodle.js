/* An SVG doodle with a whole page to get distracted in. No dependencies. */
(() => {
  'use strict';
  const world = document.querySelector('#world');
  const speech = document.querySelector('#speech');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const ids = ['desk', 'chair', 'character', 'computer', 'lamp'];
  const bodies = Object.fromEntries(ids.map(id => [id, {
    id, element: document.getElementById(id), x: 0, y: 0,
    home: { x: 0, y: 0 }, vx: 0, vy: 0, angle: 0, spin: 0,
    dirty: false, sleeping: true, held: false,
  }]));
  const { desk, chair, character, computer, lamp } = bodies;
  const deskTop = document.querySelector('#desk-top');
  const lampHead = document.querySelector('#lamp-head');
  const actor = window.createDoodleCharacter(character.element);
  const handCursor = window.createDoodleCursor();
  // Reuse the animated forearms above the keyboard without lifting the body
  // or legs out from behind the desk.
  const typingHands = document.createElementNS(world.namespaceURI, 'g');
  typingHands.id = 'typing-hands';
  typingHands.setAttribute('class', 'object ink');
  typingHands.setAttribute('data-body', 'character');
  typingHands.setAttribute('aria-hidden', 'true');
  typingHands.innerHTML = '<defs><mask id="far-typing-arm-mask" maskUnits="userSpaceOnUse" x="-150" y="-200" width="300" height="220" mask-type="luminance"><rect x="-150" y="-200" width="300" height="220" fill="white" stroke="none"/><path fill="black" stroke="black" stroke-width="2.8"/></mask></defs><g><use href="#arm-far" mask="url(#far-typing-arm-mask)"/><use href="#arm-near"/></g>';
  const farArmMask = typingHands.querySelector('mask path');
  const characterTorso = character.element.querySelector('#torso');
  const handPose = typingHands.querySelector(':scope > g');
  const characterRig = character.element.querySelector('#character-rig');
  const characterBody = character.element.querySelector('#character-body');
  const carryingArm = document.createElementNS(world.namespaceURI, 'g');
  carryingArm.id = 'carrying-arm';
  carryingArm.setAttribute('class', 'object ink');
  carryingArm.setAttribute('data-body', 'character');
  carryingArm.setAttribute('aria-hidden', 'true');
  carryingArm.innerHTML = '<g><use href="#arm-near"/></g>';
  const carryingArmPose = carryingArm.firstElementChild;
  const farArm = character.element.querySelector('#arm-far');
  const carryingFarArm = document.createElementNS(world.namespaceURI, 'g');
  carryingFarArm.id = 'carrying-far-arm';
  carryingFarArm.setAttribute('class', 'object ink');
  carryingFarArm.setAttribute('data-body', 'character');
  carryingFarArm.setAttribute('aria-hidden', 'true');
  const carryingFarPose = document.createElementNS(world.namespaceURI, 'g');
  carryingFarArm.append(carryingFarPose);
  const impact = document.createElementNS(world.namespaceURI, 'g');
  impact.id = 'poke-impact';
  impact.setAttribute('aria-hidden', 'true');
  impact.setAttribute('pointer-events', 'none');
  impact.setAttribute('hidden', '');
  impact.innerHTML = '<g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><circle r="4"/><path d="M0-9V-14M0 9V14M-9 0H-14M9 0H14M-7-7-10-10M7 7 10 10M7-7 10-10M-7 7-10 10"/></g>';
  const locomotion = { distance: 0, facing: 'left' };
  const navigation = { side: 'back', path: [] };
  const nav = window.DeskNavigation;
  let layerOrder = '';
  let greetingUntil = 0, seatedAt = -10;
  const quotes = {
    character: ["Hey, cut that out!", "I'm working here!", 'I am not a desktop shortcut.'],
    chair: ['I was sitting there.', 'This is not a standing desk.', 'Wheee. Okay, that’s enough.'],
    computer: ['Hey! I hadn’t saved that.', 'My tabs are in there!', 'That is load-bearing code.'],
    lamp: ['There goes my bright idea.', 'A little dark for debugging.', 'I need that to see my bugs.'],
    desk: ['The whole desk? Really?', 'So… we’re moving offices?', 'That’s my entire workspace.'],
  };
  const quoteIndex = {};
  let width = 1440, height = 900, scale = 1;
  let time = 0, lastFrame = performance.now(), lastSpeech = -Infinity, speechUntil = 0;
  let interactions = 0, selected = 'character';
  let drag = null, mission = null, attached = true, frameId = 0;
  let press = null, poke = null;
  let state = 'typing', idleHello = false;
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const mix = (a, b, t) => a + (b - a) * t;
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function transform(body) {
    const value = `translate(${body.x.toFixed(2)} ${body.y.toFixed(2)}) rotate(${(body.angle * 180 / Math.PI).toFixed(2)}) scale(${scale})`;
    body.element.setAttribute('transform', value);
    if (body === desk) deskTop.setAttribute('transform', value);
  }

  function layers() {
    // Compare ground/contact positions, rather than the tops of the drawings.
    // Clean desktop props share the desk's depth while resting on its surface.
    const depth = body => body === desk ? body.y + 74 * scale
      : [computer, lamp].includes(body) && !body.dirty && !body.held ? desk.y + 74 * scale
      : body.y;
    const order = [chair, character, desk, computer, lamp]
      .sort((a, b) => depth(a) - depth(b))
      .flatMap(body => body === desk ? [body.element, deskTop] : [body.element]);
    if (mission?.phase === 'carry' || mission?.phase === 'place') {
      const element = mission.body.element;
      order.splice(order.indexOf(element), 1);
      order.splice(order.indexOf(character.element) + 1, 0, element);
      if (mission.body === desk) { order.splice(order.indexOf(deskTop), 1); order.splice(order.indexOf(element) + 1, 0, deskTop); }
    }
    order.splice(order.indexOf(computer.element) + 1, 0, typingHands);
    const carryingFurniture = ['carry', 'place'].includes(mission?.phase) && [desk, chair].includes(mission?.body);
    const armBehind = carryingFurniture ? (mission.body === desk ? deskTop : chair.element) : character.element;
    order.splice(order.indexOf(armBehind) + 1, 0, carryingArm);
    order.splice(order.indexOf(chair.element), 0, carryingFarArm);
    // Props stay above the complete table even when the table is lifted.
    for (const element of [lamp.element, computer.element]) {
      if (order.indexOf(element) < order.indexOf(deskTop)) {
        order.splice(order.indexOf(element), 1);
        order.splice(order.indexOf(deskTop) + 1, 0, element);
      }
    }
    if (mission?.phase === 'carry' && locomotion.facing === 'back') {
      const carried = mission.body === desk
        ? [deskTop, ...[computer, lamp].filter(body => !body.held
          && Math.abs(body.x - desk.x) < 190 * scale
          && Math.abs(body.y - (desk.y - 103 * scale)) < 20 * scale).map(body => body.element)]
        : [mission.body.element];
      const frontmost = carried.reduce((front, element) => order.indexOf(element) > order.indexOf(front) ? element : front);
      if (order.indexOf(character.element) < order.indexOf(frontmost)) {
        order.splice(order.indexOf(character.element), 1);
        order.splice(order.indexOf(frontmost) + 1, 0, character.element);
      }
    }
    order.push(impact);
    const key = order.map(element => element.id).join(',');
    if (key === layerOrder) return;
    order.forEach(element => world.append(element));
    layerOrder = key;
  }

  function deskBarrier() {
    // Ground footprint, expanded by the character's body width. The chair is
    // just behind this band; its seated pose can still reach the keyboard.
    const tilt = Math.abs(Math.sin(desk.angle)) * 185 * scale;
    return { left: desk.x - 226 * scale, right: desk.x + 226 * scale,
      top: desk.y + 8 * scale - tilt, bottom: desk.y + 74 * scale + tilt };
  }

  function updateDepth() {
    if (character.held) return;
    const r = deskBarrier();
    if (character.y > r.bottom) navigation.side = 'front';
    else if ((character.x <= r.left || character.x >= r.right) && character.y <= r.top) navigation.side = 'back';
  }

  function blockCharacter(from, body = character) {
    const safe = nav.constrain(from, body, deskBarrier(), navigation.side);
    if (distance(safe, body) > .01) {
      body.x = safe.x; body.y = safe.y;
      body.vx = body.vy = body.spin = 0;
      body.sleeping = true;
    }
  }

  function layout() {
    endDrag();
    const oldWidth = width, oldHeight = height;
    width = document.documentElement.clientWidth;
    height = document.querySelector('main').offsetHeight;
    scale = Math.min(1.05, (width - 30) / 430);
    world.setAttribute('viewBox', `0 0 ${width} ${height}`);
    world.style.height = `${height}px`;
    const introBottom = document.querySelector('.intro').getBoundingClientRect().bottom + scrollY;
    const floor = (introBottom + height) / 2 + 115 * scale - (width <= 600 ? 0 : 70);
    const center = width / 2 - 15 * scale;
    const workspaceX = center + 44 * scale;
    const homes = {
      desk: [center, floor], chair: [workspaceX + 86 * scale, floor],
      character: [workspaceX + 86 * scale, floor],
      computer: [workspaceX - 85 * scale, floor - 105 * scale],
      lamp: [workspaceX - 186 * scale, floor - 102 * scale],
    };
    for (const body of Object.values(bodies)) {
      body.home = { x: homes[body.id][0], y: homes[body.id][1] };
      if (!body.dirty && !mission) Object.assign(body, body.home);
      else { body.x *= width / oldWidth; body.y *= height / oldHeight; }
      body.bounds = body.element.getBBox();
      if (body === character) body.bounds = actor.bounds;
      transform(body);
    }
    if (mission) {
      if (['carry', 'place'].includes(mission.phase)) mission.body.sleeping = false;
      mission = null;
      character.dirty = true;
    }
    render();
  }

  function say(message) {
    if (time - lastSpeech < 12) return false;
    speech.textContent = message;
    lastSpeech = time;
    speechUntil = time + 5;
    speech.classList.add('visible');
    positionSpeech();
    return true;
  }

  function positionSpeech() {
    if (!speechUntil) return;
    const half = Math.min(width / 2 - 8, speech.offsetWidth / 2 + 8);
    speech.style.left = `${clamp(character.x, half, width - half)}px`;
    speech.style.top = `${clamp(character.y - 344 * scale, 50, height - 40)}px`;
  }

  function disturb(body, talk = true) {
    greetingUntil = 0;
    // Moving an unrelated object must not interrupt the current job.
    if (mission && (body === character || mission.body === body)) {
      if (['carry', 'place'].includes(mission.phase)) {
        mission.body.sleeping = false;
        mission.body.vx = mission.body.vy = 0;
      }
      mission = null;
      navigation.path = [];
    }
    body.dirty = true;
    body.sleeping = false;
    interactions++;
    if (body === character) { attached = false; navigation.side = 'front'; }
    if (body === chair && attached) character.dirty = true;
    state = mission ? 'recovering' : attached ? 'typing' : 'interrupted';
    if (talk) {
      const index = quoteIndex[body.id] || 0;
      if (say(quotes[body.id][index % quotes[body.id].length])) quoteIndex[body.id] = index + 1;
    }
    layers();
  }

  function beginDrag(event, body) {
    if (drag || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    selected = body.id;
    disturb(body);
    body.held = true;
    body.vx = body.vy = body.spin = 0;
    const grabX = event.pageX - body.x, grabY = event.pageY - body.y;
    const c = Math.cos(body.angle), s = Math.sin(body.angle);
    drag = {
      body, id: event.pointerId, ox: grabX, oy: grabY,
      localX: grabX * c + grabY * s, localY: -grabX * s + grabY * c,
      x: body.x, y: body.y, lastX: body.x, lastY: body.y,
      vx: 0, vy: 0, stamp: performance.now(),
    };
    body.element.classList.add('dragging');
    world.setPointerCapture(event.pointerId);
    layers();
  }

  function endDrag(event) {
    if (press && (!event || event.pointerId === press.id)) {
      const released = press;
      press = null;
      if (event?.type === 'pointerup') pokeCharacter(event.pageX, event.pageY);
      if (world.hasPointerCapture(released.id)) world.releasePointerCapture(released.id);
      return;
    }
    if (!drag || (event && event.pointerId !== drag.id)) return;
    const released = drag;
    drag = null;
    const body = released.body;
    body.held = false;
    body.sleeping = false;
    body.element.classList.remove('dragging');
    const recent = performance.now() - released.stamp < 130;
    body.vx = recent ? released.vx * .55 : 0;
    body.vy = recent ? released.vy * .55 : 0;
    body.spin = body === desk ? 0 : body.vx * .0017;
    if (world.hasPointerCapture(released.id)) world.releasePointerCapture(released.id);
    layers();
  }

  world.addEventListener('pointerdown', event => {
    const id = event.target.closest('[data-body]')?.dataset.body;
    if (press || drag) return;
    if (id === 'character' && event.isPrimary && event.button === 0) {
      event.preventDefault();
      selected = id;
      press = { id: event.pointerId, x: event.pageX, y: event.pageY, threshold: event.pointerType === 'touch' ? 10 : 6 };
      world.setPointerCapture(event.pointerId);
      return;
    }
    if (bodies[id]) beginDrag(event, bodies[id]);
  });
  function pokeCharacter(x, y) {
    const local = new DOMPoint(x - scrollX, y - scrollY).matrixTransform(character.element.getScreenCTM().inverse());
    const head = local.y < -170;
    const dx = -local.x, dy = (head ? -242 : -115) - local.y;
    const length = Math.hypot(dx, dy) || 1;
    poke = { x, y, started: time, dx: length > 1 ? dx / length : 1, dy: dy / length, head };
    interactions++;
    greetingUntil = 0;
    say('Hey! That tickles.');
  }
  world.addEventListener('touchstart', event => {
    if (event.target.closest('[data-body]')) event.preventDefault();
  }, { passive: false });
  window.addEventListener('touchmove', event => {
    if (drag || press) event.preventDefault();
  }, { passive: false });
  window.addEventListener('pointermove', event => {
    if (press && event.pointerId === press.id) {
      event.preventDefault();
      if (Math.hypot(event.pageX - press.x, event.pageY - press.y) < press.threshold) return;
      const start = press;
      press = null;
      poke = null;
      beginDrag({ isPrimary: true, button: 0, pointerId: start.id, pageX: start.x, pageY: start.y, preventDefault() {} }, character);
    }
    if (!drag || event.pointerId !== drag.id) return;
    event.preventDefault();
    const now = performance.now();
    const dt = Math.max(.016, (now - drag.stamp) / 1000);
    // Constrain the artwork, not its origin: grabbing the head should let it
    // follow the pointer all the way to the footer, even with its feet off-page.
    const box = drag.body.bounds;
    const margin = 16 * scale;
    drag.x = clamp(event.pageX - drag.ox, -(box.x + box.width) * scale + margin, width - box.x * scale - margin);
    drag.y = clamp(event.pageY - drag.oy, -(box.y + box.height) * scale + margin, height - box.y * scale - margin);
    drag.vx = clamp((drag.x - drag.lastX) / dt, -1100, 1100);
    drag.vy = clamp((drag.y - drag.lastY) / dt, -1100, 1100);
    drag.lastX = drag.x;
    drag.lastY = drag.y;
    drag.stamp = now;
  }, { passive: false });
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  world.addEventListener('lostpointercapture', endDrag);
  window.addEventListener('blur', () => endDrag());

  function shiftContents(dx, dy) {
    for (const body of [computer, lamp]) {
      if (body.held || mission?.body === body) continue;
      const wasOnDesk = !body.dirty || (Math.abs(body.x - (desk.x - dx)) < 190 * scale && Math.abs(body.y - (desk.y - dy - 103 * scale)) < 20 * scale);
      if (wasOnDesk) {
        body.x += dx;
        body.y += dy;
        body.dirty = true;
        body.sleeping = true;
      }
    }
  }

  function extents(body) {
    const box = body.bounds;
    const c = Math.cos(body.angle), s = Math.sin(body.angle);
    let bottom = -Infinity, left = Infinity, right = -Infinity;
    for (const x of [box.x, box.x + box.width]) {
      for (const y of [box.y, box.y + box.height]) {
        bottom = Math.max(bottom, (x * s + y * c) * scale);
        left = Math.min(left, (x * c - y * s) * scale);
        right = Math.max(right, (x * c - y * s) * scale);
      }
    }
    return { bottom, left, right };
  }

  function physics(body, dt) {
    if ([computer, lamp].includes(body) && !body.held && (mission?.body !== body || mission.phase === 'approach')) {
      const bottom = body.y + extents(body).bottom;
      const supported = Math.abs(body.x - desk.x) < 170 * scale && Math.abs(desk.angle) < .12
        && Math.abs(bottom - (desk.y - 100 * scale)) < 12 * scale;
      if (!supported && bottom < height - 21) {
        body.sleeping = false;
        body.dirty = true;
      }
    }
    if (body.held || body.sleeping || (mission?.body === body && mission.phase !== 'approach') || (body === character && (attached || mission))) return;
    const oldX = body.x, oldY = body.y;
    const oldBottom = oldY + extents(body).bottom;
    body.vy += 1250 * scale * dt;
    body.x += body.vx * dt;
    body.y += body.vy * dt;
    body.angle = clamp(body.angle + body.spin * dt, body === desk ? -.14 : -1.4, body === desk ? .14 : 1.4);
    body.spin *= Math.exp(-2 * dt);
    const bounds = extents(body);
    let floor = height - 20;
    if (body === computer || body === lamp) {
      const shelf = desk.y - 100 * scale;
      if (Math.abs(body.x - desk.x) < 170 * scale && oldBottom <= shelf + 8 * scale && Math.abs(desk.angle) < .12) floor = shelf;
    }
    if (body.y + bounds.bottom >= floor) {
      body.y = floor - bounds.bottom;
      body.vy = body.vy > 70 ? -body.vy * .19 : 0;
      body.vx *= Math.exp(-8 * dt);
      body.spin *= Math.exp(-7 * dt);
      if (Math.abs(body.vx) < 3 && body.vy === 0 && Math.abs(body.spin) < .04) {
        body.sleeping = true;
        body.vx = body.vy = 0;
      }
    }
    const minX = Math.min(width / 2, -bounds.left + 4);
    const maxX = Math.max(width / 2, width - bounds.right - 4);
    if (body.x < minX || body.x > maxX) {
      body.x = clamp(body.x, minX, maxX);
      body.vx *= -.25;
    }
    if (body === desk) shiftContents(body.x - oldX, body.y - oldY);
    if (body === character) blockCharacter({ x: oldX, y: oldY }, body);
  }

  function pushNeighbors(body, dt) {
    if (![computer, lamp, chair].includes(body)) return;
    for (const other of [computer, lamp, chair]) {
      if (body === other || other.held || mission?.body === other) continue;
      const dx = other.x - body.x, dy = other.y - body.y;
      const separation = (body === computer || other === computer ? 65 : 34) * scale;
      if (Math.abs(dy) < 45 * scale && Math.abs(dx) < separation && Math.abs(dx) > 1) {
        other.x += Math.sign(dx) * Math.min(15, (separation - Math.abs(dx)) * dt * 10);
        other.vx += Math.sign(dx) * 70 * dt;
        other.spin += Math.sign(dx) * dt;
        other.dirty = true;
        other.sleeping = false;
      }
    }
  }

  function approach(body, home = false, facing = 'left') {
    const position = home ? body.home : body;
    const horizontal = body === desk ? 190 : body === chair ? 65 : 78;
    return {
      x: clamp(position.x + (facing === 'right' ? -horizontal : horizontal) * scale, 68 * scale, width - 70 * scale),
      y: clamp(position.y + ([computer, lamp].includes(body) ? 105 * scale : 0), 330 * scale, height - 18),
    };
  }

  function walkTo(target, dt, speed = 230) {
    updateDepth();
    const movingDesk = mission?.body === desk && ['carry', 'place'].includes(mission.phase);
    const barrier = deskBarrier();
    if (!movingDesk && nav.inside(character, barrier)) Object.assign(character, nav.outside(character, barrier, navigation.side));
    const plan = movingDesk ? { path: [target], goal: target, side: navigation.side }
      : nav.route(character, target, barrier, navigation.side);
    navigation.path = plan.path;
    const next = plan.path.find(point => distance(character, point) > .5) || plan.goal;
    const remaining = distance(character, next);
    const dx = next.x - character.x, dy = next.y - character.y;
    if (remaining > 3) {
      locomotion.facing = Math.abs(dy) > Math.abs(dx) * 1.6 ? (dy < 0 ? 'back' : 'front') : (dx < 0 ? 'left' : 'right');
    }
    const fraction = remaining > 0 ? Math.min(1, speed * scale * dt / remaining) : 1;
    locomotion.distance += remaining * fraction / scale;
    character.x = mix(character.x, next.x, fraction);
    character.y = mix(character.y, next.y, fraction);
    character.angle *= Math.exp(-12 * dt);
    updateDepth();
    return distance(character, plan.goal) < 2 && (movingDesk || navigation.side === plan.side);
  }

  function restore(body) {
    Object.assign(body, body.home);
    body.angle = body.spin = body.vx = body.vy = 0;
    body.dirty = body.held = false;
    body.sleeping = true;
  }

  function recover(dt) {
    if (character.held || (attached && (chair.held || !chair.sleeping))) return;
    // A desktop item cannot be delivered until its supporting table is ready.
    // If the table is moved mid-delivery, release the item and restore it first.
    if ((desk.dirty || desk.held) && [computer, lamp].includes(mission?.body)) {
      mission.body.sleeping = false;
      mission.body.dirty = true;
      mission.body.vx = mission.body.vy = mission.body.spin = 0;
      mission = null;
    }
    if (!mission) {
      const body = [desk, computer, lamp, chair].find(item => item.dirty && !item.held
        && (!([computer, lamp].includes(item)) || (!desk.dirty && !desk.held)));
      if (!body && (desk.dirty || desk.held)) return;
      if (!body && !character.dirty) { state = 'typing'; return; }
      if (!body && chair.held) return;
      attached = false;
      character.sleeping = true;
      character.dirty = true;
      mission = { body: body || character, phase: body ? 'approach' : 'return', elapsed: 0 };
      state = 'recovering';
    }
    const task = mission;
    task.elapsed += dt;
    if (task.phase === 'approach') {
      task.pickupFacing = task.body.home.x > task.body.x ? 'right' : 'left';
      if (walkTo(approach(task.body, false, task.pickupFacing), dt)) {
        locomotion.facing = task.pickupFacing;
        task.phase = 'pickup';
        task.elapsed = 0;
        task.body.sleeping = true;
        task.body.vx = task.body.vy = task.body.spin = 0;
      }
    } else if (task.phase === 'pickup') {
      if (task.elapsed > .25) {
        task.phase = 'carry';
        task.deliveryFacing = task.pickupFacing;
        task.elapsed = 0;
        say(task.body === computer ? 'Let’s get you back on the desk.' : 'Right. Back where you belong.');
        layers();
      }
    } else if (task.phase === 'carry') {
      const arrived = walkTo(approach(task.body, true, task.deliveryFacing), dt, task.body === desk ? 180 : 210);
      const oldX = task.body.x, oldY = task.body.y;
      const offsetX = task.body === desk ? 190 : task.body === chair ? 65 : 78;
      const offsetY = [computer, lamp].includes(task.body) ? 105 : 0;
      const facing = locomotion.facing;
      const side = facing === 'left' ? -1 : facing === 'right' ? 1 : 0;
      const depth = facing === 'back' ? -12 : facing === 'front' ? 12 : 0;
      task.body.x = mix(task.body.x, character.x + side * offsetX * scale, 1 - Math.exp(-12 * dt));
      task.body.y = mix(task.body.y, character.y + (depth - offsetY) * scale, 1 - Math.exp(-12 * dt));
      task.body.angle *= Math.exp(-10 * dt);
      if (task.body === desk) shiftContents(task.body.x - oldX, task.body.y - oldY);
      if (arrived) {
        task.phase = 'place';
        locomotion.facing = task.deliveryFacing;
        task.elapsed = 0;
        task.start = { x: task.body.x, y: task.body.y };
      }
    } else if (task.phase === 'place') {
      const progress = clamp(task.elapsed / .45, 0, 1);
      const smooth = progress * progress * (3 - 2 * progress);
      const oldX = task.body.x, oldY = task.body.y;
      task.body.x = mix(task.start.x, task.body.home.x, smooth);
      task.body.y = mix(task.start.y, task.body.home.y, smooth) - Math.sin(progress * Math.PI) * 12 * scale;
      if (task.body === desk) shiftContents(task.body.x - oldX, task.body.y - oldY);
      if (progress === 1) {
        restore(task.body);
        mission = [desk, computer, lamp, chair].some(body => body.dirty)
          ? null : { body: character, phase: Math.random() < .5 ? 'happy' : 'return', elapsed: 0 };
        layers();
      }
    } else if (task.phase === 'happy') {
      if (task.elapsed > .65) { task.phase = 'return'; task.elapsed = 0; }
    } else if (task.phase === 'return') {
      if (chair.dirty || chair.held) { mission = null; return; }
      if (walkTo(character.home, dt)) {
        restore(character);
        attached = true;
        navigation.side = 'back';
        navigation.path = [];
        seatedAt = time;
        mission = null;
        state = 'typing';
        say(['Now, where was I?', 'Okay. Back to work.', 'Just one more line.'][interactions % 3]);
        layers();
      }
    }
  }

  function animateCharacter() {
    const typing = attached && !mission && !chair.held && !chair.dirty;
    const walking = !!mission && ['approach', 'carry', 'return'].includes(mission.phase);
    let pose = attached ? 'seated' : character.dirty && character.sleeping && !mission ? 'ground-sitting' : 'neutral';
    if (typing) pose = time - seatedAt < .4 ? 'sitting-down' : 'typing';
    if (typing && time < greetingUntil && !reduceMotion.matches) pose = 'wave';
    if (walking) pose = 'walking';
    if (mission?.phase === 'pickup') pose = 'pickup';
    if (mission?.phase === 'carry') pose = 'carrying';
    if (mission?.phase === 'place') pose = 'placing';
    if (mission?.phase === 'happy') pose = 'happy';
    if (!attached && !mission && character.dirty && !character.sleeping) pose = 'falling';
    if (character.held || (attached && (chair.held || !chair.sleeping))) pose = 'held';
    const light = new DOMPoint(69, -123).matrixTransform(lampHead.getCTM());
    actor.animate(time, {
      light,
      poke: poke ? { ...poke, age: time - poke.started } : null,
      carriedObject: mission?.body.id,
      pose, facing: locomotion.facing, distance: locomotion.distance,
      moving: walking, seated: attached, reducedMotion: reduceMotion.matches,
      progress: mission ? mission.elapsed / (mission.phase === 'pickup' ? .25 : .45) : (time - seatedAt) / .4,
    });
    typingHands.toggleAttribute('hidden', !typing);
    typingHands.setAttribute('transform', character.element.getAttribute('transform'));
    handPose.setAttribute('transform', `${characterRig.getAttribute('transform')} ${characterBody.getAttribute('transform')}`);
    farArmMask.setAttribute('d', characterTorso.getAttribute('d'));
    carryingArm.toggleAttribute('hidden', !(['carrying', 'placing'].includes(pose) && [desk, chair].includes(mission?.body)) || (pose === 'carrying' && locomotion.facing === 'back'));
    carryingArm.setAttribute('transform', character.element.getAttribute('transform'));
    carryingArmPose.setAttribute('transform', handPose.getAttribute('transform'));
    const carryingChair = ['carrying', 'placing'].includes(pose) && mission?.body === chair;
    if (carryingChair && farArm.parentNode !== carryingFarPose) carryingFarPose.append(farArm);
    else if (!carryingChair && farArm.parentNode === carryingFarPose) characterBody.insertBefore(farArm, characterTorso);
    carryingFarArm.setAttribute('transform', character.element.getAttribute('transform'));
    carryingFarPose.setAttribute('transform', handPose.getAttribute('transform'));
    world.dataset.typing = String(pose === 'typing');
  }

  function render() {
    updateDepth();
    layers();
    for (const body of Object.values(bodies)) transform(body);
    animateCharacter();
    if (poke && time - poke.started >= .55) poke = null;
    impact.toggleAttribute('hidden', !poke);
    handCursor.update({ dragging: !!drag, pressing: !!press, pokeTime: poke?.started ?? null });
    if (poke) {
      const progress = (time - poke.started) / .55;
      impact.setAttribute('transform', `translate(${poke.x} ${poke.y}) scale(${scale * (1 + progress * .3)})`);
      impact.setAttribute('opacity', String(1 - progress));
    }
    positionSpeech();
  }

  function update(dt) {
    time += dt;
    if (drag) {
      const body = drag.body, oldX = body.x, oldY = body.y;
      const moving = performance.now() - drag.stamp < 100;
      body.angle = mix(body.angle, moving ? clamp(drag.vx * (body === desk ? .0001 : .0005), -.42, .42) : 0, 1 - Math.exp(-7 * dt));
      // Rotate around the grabbed point so the object stays under the pointer.
      const c = Math.cos(body.angle), s = Math.sin(body.angle);
      const targetX = drag.x + drag.ox - (drag.localX * c - drag.localY * s);
      const targetY = drag.y + drag.oy - (drag.localX * s + drag.localY * c);
      body.x = mix(body.x, targetX, 1 - Math.exp(-35 * dt));
      body.y = mix(body.y, targetY, 1 - Math.exp(-35 * dt));
      // Picking up the character lifts them over furniture; walking and drops
      // still use the table boundary once the pointer releases them.
      if (body === chair && attached) blockCharacter({ x: oldX, y: oldY }, body);
      if (body === desk) shiftContents(body.x - oldX, body.y - oldY);
      pushNeighbors(body, dt);
    }
    for (const body of Object.values(bodies)) physics(body, dt);
    if (attached) {
      character.x = chair.x;
      character.y = chair.y;
      character.angle = chair.angle;
    }
    recover(dt);
    updateDepth();
    if (speechUntil && time > speechUntil) { speech.classList.remove('visible'); speechUntil = 0; }
    if (!idleHello && time > 3 && interactions === 0) {
      idleHello = true;
      greetingUntil = time + 1.1;
      say('Just one more line…');
    }
  }

  function frame(now) {
    frameId = 0;
    if (document.hidden) return;
    let remaining = clamp((now - lastFrame) / 1000, 0, .1);
    lastFrame = now;
    while (remaining > 0) { const dt = Math.min(remaining, 1 / 60); update(dt); remaining -= dt; }
    render();
    frameId = requestAnimationFrame(frame);
  }

  function reset() {
    endDrag();
    poke = null;
    mission = null;
    for (const body of Object.values(bodies)) restore(body);
    attached = true;
    state = 'typing';
    greetingUntil = 0;
    seatedAt = -10;
    locomotion.facing = 'left';
    navigation.side = 'back';
    navigation.path = [];
    actor.reset(time);
    layers();
    say('Much better. Thank you.');
    render();
  }

  function nudge(id, direction = 'lift') {
    const body = bodies[id];
    if (!body) return;
    disturb(body);
    const oldX = body.x, oldY = body.y;
    if (direction === 'left') body.x -= 45 * scale;
    else if (direction === 'right') body.x += 45 * scale;
    else if (direction === 'down') body.y += 30 * scale;
    else { body.y -= 40 * scale; body.vy = -210 * scale; }
    if (body === desk) shiftContents(body.x - oldX, body.y - oldY);
    if (body === character || (body === chair && attached)) blockCharacter({ x: oldX, y: oldY }, body);
    render();
  }

  document.addEventListener('visibilitychange', () => {
    endDrag();
    if (document.hidden) { cancelAnimationFrame(frameId); frameId = 0; }
    else { lastFrame = performance.now(); if (!frameId) frameId = requestAnimationFrame(frame); }
  });
  new ResizeObserver(layout).observe(document.querySelector('main'));

  function project(id) {
    const body = bodies[id];
    if (!body) return null;
    const anchors = { character: [0, -245], chair: [46, -120], computer: [-15, -78], lamp: [-5, -89], desk: [-166, -50] };
    const [x, y] = anchors[id];
    const c = Math.cos(body.angle), s = Math.sin(body.angle);
    return { x: body.x + (x * c - y * s) * scale - scrollX, y: body.y + (x * s + y * c) * scale - scrollY };
  }
  window.__deskScene = {
    project, reset, nudge,
    snapshot: () => ({ ready: true, mode: '2d', state, time, selected, interactionCount: interactions,
      typing: world.dataset.typing === 'true', character: actor.snapshot(), bounds: { width, height }, scale,
      navigation: { side: navigation.side, barrier: deskBarrier(), path: navigation.path.map(point => ({ ...point })) },
      mission: mission ? { id: mission.body.id, phase: mission.phase } : null,
      objects: Object.values(bodies).map(body => ({ id: body.id, position: [body.x, body.y], home: [body.home.x, body.home.y], dirty: body.dirty, held: body.held, angle: body.angle, screen: project(body.id) })),
    }),
  };
  layout();
  lastFrame = performance.now();
  frameId = requestAnimationFrame(frame);
})();
