/* Vector poses redrawn from the supplied character / eight-frame walk sheet.
   Local feet sit at y=0; the head is centered at (0,-242). */
window.createDoodleCharacter = function createDoodleCharacter(root) {
  const NS = 'http://www.w3.org/2000/svg';
  const element = (tag, attributes, parent) => {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    parent.append(node);
    return node;
  };
  root.replaceChildren();
  const defs = element('defs', {}, root);
  const shadowMask = name => {
    const id = `${root.id}-${name}-lighting`;
    const mask = element('mask', { id, maskUnits: 'userSpaceOnUse', x: -200, y: -400, width: 400, height: 500, 'mask-type': 'luminance' }, defs);
    element('rect', { x: -200, y: -400, width: 400, height: 500, fill: '#fff', stroke: 'none' }, mask);
    const cutout = element('path', { fill: '#000', stroke: 'none' }, mask);
    return { id, cutout };
  };
  const headMask = shadowMask('head'), bodyMask = shadowMask('body');
  const rig = element('g', { id: 'character-rig', 'stroke-width': 2.8 }, root);
  const body = element('g', { id: 'character-body' }, rig);
  const limb = (id, width, parent = body) => {
    const group = element('g', { id, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
    const outline = element('path', { stroke: '#252525', 'stroke-width': width + 5.6 }, group);
    const fill = element('path', { stroke: '#fff', 'stroke-width': width }, group);
    return { group, outline, fill };
  };
  const farLeg = limb('leg-far', 18);
  const nearLeg = limb('leg-near', 19);
  const farArm = limb('arm-far', 13);
  const torso = element('path', { id: 'torso', fill: '#fff' }, body);
  const bodyShade = element('path', { id: 'body-shade', fill: '#e7e7e7', stroke: 'none', mask: `url(#${bodyMask.id})` }, body);
  const nearArm = limb('arm-near', 14);
  const head = element('g', { id: 'head' }, rig);
  const outline = 'M0-325C48-326 82-290 82-244C84-197 50-160 2-160C-45-158-82-193-82-240C-84-286-49-324 0-325Z';
  element('path', { d: outline, fill: '#fff' }, head);
  element('path', {
    id: 'head-shade', d: outline,
    fill: '#e5e5e5', stroke: 'none', mask: `url(#${headMask.id})`,
  }, head);
  element('path', { d: outline, fill: 'none' }, head);
  const eyes = element('g', { id: 'eyes', fill: '#242424', stroke: 'none' }, head);
  const eyeLeft = element('ellipse', { id: 'eye-left', cx: -37, cy: -232, rx: 3.9, ry: 4.2 }, eyes);
  const eyeRight = element('ellipse', { id: 'eye-right', cx: 37, cy: -232, rx: 3.9, ry: 4.2 }, eyes);

  // Contact, recoil, passing, high point; then the opposite leg. Foot travel is
  // driven by distance covered, so a stopped character cannot walk in place.
  const gait = [
    { n: [39, 0], f: [-37, -2], nk: [18, -40], fk: [-21, -39], arm: -24, bob: 0 },
    { n: [23, 0], f: [-34, -13], nk: [7, -38], fk: [-28, -45], arm: -17, bob: 2 },
    { n: [0, 0], f: [-22, -29], nk: [-4, -39], fk: [-29, -53], arm: 0, bob: 0 },
    { n: [-23, 0], f: [15, -14], nk: [-14, -40], fk: [-4, -49], arm: 18, bob: -3 },
    { n: [-37, -2], f: [39, 0], nk: [-21, -39], fk: [18, -40], arm: 24, bob: 0 },
    { n: [-34, -13], f: [23, 0], nk: [-28, -45], fk: [7, -38], arm: 17, bob: 2 },
    { n: [-22, -29], f: [0, 0], nk: [-29, -53], fk: [-4, -39], arm: 0, bob: 0 },
    { n: [15, -14], f: [-23, 0], nk: [-4, -49], fk: [-14, -40], arm: -18, bob: -3 },
  ];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  let current = null, lastTime = null, displayedPose = 'typing';

  function posePoints(name, time, options) {
    const moving = !options.reducedMotion;
    const t = moving ? time : 0;
    const p = {
      // Shoulders, elbows, hands and hips, knees, feet. Smooth rounded strokes
      // give the same mitten hands and soft shoe-less feet as the sheet.
      fa: [-24, -146, -43, -117, -44, -93],
      na: [24, -146, 43, -117, 44, -93],
      fl: [-17, -79, -19, -43, -18, -11],
      nl: [17, -79, 19, -43, 18, -11],
      bob: 0, tilt: 0, lean: 0, side: 0, rigY: 0,
      eyeX: [-37, 37], eyeA: [1, 1], gaze: 0,
    };
    let facing = options.facing || 'front';
    if (['typing', 'seated', 'pickup', 'carrying', 'placing', 'sitting-down'].includes(name)) facing = 'left';
    if (['held', 'falling', 'happy', 'wave', 'neutral', 'ground-sitting'].includes(name)) facing = 'front';
    p.side = facing === 'left' || facing === 'right' ? 1 : 0;
    if (p.side) {
      p.eyeX = facing === 'left' ? [-53, -53] : [53, 53];
      p.eyeA = [1, 0];
      p.fa = [-9, -145, -16, -114, -13, -96];
      p.na = [9, -146, 20, -116, 14, -96];
    } else if (facing === 'back') p.eyeA = [0, 0];

    if (name === 'walking' || (name === 'carrying' && options.moving)) {
      const cycle = moving ? (options.distance || 0) / 160 * 8 : 0;
      const frame = Math.floor(cycle) % 8, blend = cycle - Math.floor(cycle);
      const a = gait[frame], b = gait[(frame + 1) % 8];
      const dir = facing === 'left' ? -1 : 1;
      const pair = key => a[key].map((value, i) => lerp(value, b[key][i], blend));
      const n = pair('n'), f = pair('f'), nk = pair('nk'), fk = pair('fk');
      const spread = p.side ? 1 : .55;
      p.nl = [8, -78, nk[0] * dir * spread, nk[1], n[0] * dir * spread, n[1] - 11];
      p.fl = [-8, -78, fk[0] * dir * spread, fk[1], f[0] * dir * spread, f[1] - 11];
      const swing = lerp(a.arm, b.arm, blend) * dir;
      p.na = [14, -147, 16 + swing * .7, -123, 13 + swing, -102];
      p.fa = [-11, -146, -15 - swing * .65, -123, -12 - swing, -102];
      if (!p.side) {
        p.na = [29, -147, 43, -122, 42, -100 + swing * .35];
        p.fa = [-29, -147, -43, -122, -42, -100 - swing * .35];
      }
      p.bob = lerp(a.bob, b.bob, blend);
      p.tilt = dir * 1.2;
      root.dataset.walkFrame = String(frame + 1);
    } else delete root.dataset.walkFrame;

    if (['typing', 'seated', 'sitting-down'].includes(name)) {
      p.fl = [-14, -86, -39, -63, -43, -24];
      p.nl = [14, -85, -10, -59, -12, -18];
      const tap = name === 'typing' && moving ? Math.sin(Math.floor(time * 18) / 18 * 20) * 2.2 : 0;
      p.fa = [-13, -146, -39, -122, -91, -117 + tap];
      p.na = [11, -144, -11, -111, -91, -111 - tap];
      p.tilt = -3;
      p.bob = moving ? Math.sin(time * 1.5) * .5 : 0;
      if (name === 'sitting-down') p.bob += Math.sin(clamp(options.progress || 0, 0, 1) * Math.PI) * 3;
    }
    if (['pickup', 'carrying', 'placing'].includes(name)) {
      const bend = name === 'carrying' ? 0 : Math.sin(clamp(options.progress || 0, 0, 1) * Math.PI);
      p.fa = [-12, -146, -37, -118 + bend * 12, -69, -108 + bend * 16];
      p.na = [12, -144, -15, -100 + bend * 10, -72, -95 + bend * 16];
      p.lean = -bend * 5;
      p.bob += bend * 7;
      p.tilt = -4 - bend * 5;
    }
    if (name === 'held') {
      const sway = moving ? Math.sin(t * 5) : 0;
      p.fa = [-29, -147, -68, -165, -88, -188 + sway * 6];
      p.na = [29, -147, 67, -171, 88, -192 - sway * 6];
      p.fl = [-17, -78, -23 + sway * 4, -44, -27 + sway * 9, -9];
      p.nl = [17, -78, 18 - sway * 4, -44, 20 - sway * 8, -7];
      p.tilt = -4;
    }
    if (name === 'falling') {
      p.fa = [-29, -147, -56, -146, -75, -157];
      p.na = [29, -147, 57, -144, 76, -155];
      p.fl = [-17, -78, -33, -42, -31, -15];
      p.nl = [17, -78, 35, -49, 30, -16];
      p.tilt = 2;
    }
    if (name === 'ground-sitting') {
      p.rigY = 40;
      p.fl = [-17, -80, -49, -36, -18, -49];
      p.nl = [17, -80, 49, -36, 18, -49];
      p.fa = [-27, -146, -44, -113, -18, -97];
      p.na = [27, -146, 42, -114, 13, -99];
      p.tilt = -5;
    }
    if (name === 'wave' || name === 'happy') {
      const wave = moving ? Math.sin(t * 13) * 11 : 0;
      p.na = [29, -147, 63, -165, 81 + wave * .4, -195 + wave];
      p.tilt = 5;
      if (options.seated) {
        p.fl = [-17, -86, -36, -57, -35, -23];
        p.nl = [17, -85, -8, -53, -9, -17];
      }
      if (name === 'happy') {
        p.fa = [-29, -147, -65, -166, -85, -189 - wave * .5];
        p.nl = [17, -78, 37, -53, 43, -36];
        p.bob = moving ? -Math.abs(Math.sin(time * 6)) * 3 : 0;
      }
    }
    p.facing = facing;
    return p;
  }

  function drawLimb(part, points, foot = false, bob = 0) {
    const [x, y, kx, ky, ex, ey] = points;
    const d = `M${x},${y + bob}Q${kx},${ky} ${ex},${ey}${foot ? `q${ex < x ? -3 : 3},2 ${ex < x ? -5 : 5},1` : ''}`;
    part.outline.setAttribute('d', d);
    part.fill.setAttribute('d', d);
  }

  function animate(time, options = {}) {
    const name = options.pose || 'typing';
    const target = posePoints(name, time, options);
    const dt = lastTime === null ? 1 / 60 : clamp(time - lastTime, 0, .1);
    lastTime = time;
    const blend = options.instant || options.reducedMotion || !current ? 1 : 1 - Math.exp(-22 * dt);
    if (!current) current = structuredClone(target);
    for (const key of ['fa', 'na', 'fl', 'nl', 'eyeX', 'eyeA']) {
      current[key] = current[key].map((value, i) => lerp(value, target[key][i], blend));
    }
    for (const key of ['bob', 'tilt', 'lean', 'side', 'rigY']) current[key] = lerp(current[key], target[key], blend);
    const p = current;
    rig.setAttribute('transform', `translate(0 ${p.rigY})`);
    if (root.dataset.facing !== target.facing) {
      if (target.facing === 'back') body.insertBefore(nearArm.group, torso);
      else body.append(nearArm.group);
    }
    if (root.dataset.pose !== name) {
      // Both hands rest in front of the belly in the sheet's folded-leg pose.
      if (name === 'ground-sitting') body.insertBefore(farArm.group, nearArm.group);
      else body.insertBefore(farArm.group, torso);
    }
    const w = lerp(45, 34, p.side), shoulder = lerp(30, 20, p.side);
    torso.setAttribute('d', `M${-shoulder},${-161 + p.bob}Q${-w - 5},${-126 + p.bob} ${-w},${-91 + p.bob}Q${-w + 1},${-76 + p.bob} -18,${-76 + p.bob}Q0,${-73 + p.bob} 18,${-76 + p.bob}Q${w},${-74 + p.bob} ${w},${-91 + p.bob}Q${w + 1},${-129 + p.bob} ${shoulder},${-161 + p.bob}Z`);
    bodyShade.setAttribute('d', torso.getAttribute('d'));
    body.setAttribute('transform', `rotate(${p.lean} 0 -80)`);
    drawLimb(farLeg, p.fl, true, p.bob);
    drawLimb(nearLeg, p.nl, true, p.bob);
    drawLimb(farArm, p.fa, false, p.bob);
    drawLimb(nearArm, p.na, false, p.bob);
    // The arm group transform also makes the alternating keystrokes inspectable.
    nearArm.group.setAttribute('transform', `translate(0 ${name === 'typing' && !options.reducedMotion ? Math.sin(time * 18) * .5 : 0})`);
    farArm.group.setAttribute('transform', 'translate(0 0)');
    head.setAttribute('transform', `translate(0 ${p.bob}) rotate(${p.tilt} 0 -242)`);
    // Subtract a silhouette shifted toward the bulb, leaving a soft grey rim
    // on the opposite side. Local transforms include body lean and head tilt.
    for (const [part, mask, shape, centerY, depth] of [
      [head, headMask, outline, -242, 13],
      [body, bodyMask, torso.getAttribute('d'), -119 + p.bob, 7],
    ]) {
      const matrix = options.light && part.getCTM();
      const light = matrix
        ? new DOMPoint(options.light.x, options.light.y).matrixTransform(matrix.inverse())
        : { x: -250, y: -300 };
      const dx = light.x, dy = light.y - centerY;
      const length = Math.max(1, Math.hypot(dx, dy));
      mask.cutout.setAttribute('d', shape);
      mask.cutout.setAttribute('transform', `translate(${dx / length * depth} ${dy / length * depth})`);
    }
    const blink = !options.reducedMotion && time % 5.2 > 5.04;
    [eyeLeft, eyeRight].forEach((eye, index) => {
      eye.setAttribute('cx', p.eyeX[index]);
      eye.setAttribute('cy', '-232');
      eye.setAttribute('opacity', p.eyeA[index]);
      eye.setAttribute('ry', blink ? '.65' : '4.2');
    });
    root.dataset.pose = name;
    root.dataset.facing = target.facing;
    displayedPose = name;
  }
  animate(0, { pose: 'typing', instant: true });
  return {
    animate,
    reset: time => { current = null; lastTime = null; animate(time, { pose: 'typing', instant: true }); },
    bounds: { x: -113, y: -341, width: 226, height: 344 },
    snapshot: () => ({ pose: displayedPose, facing: root.dataset.facing, walkFrame: Number(root.dataset.walkFrame) || null }),
  };
};
