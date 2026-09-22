/* Ground-plane navigation around a rectangular furniture footprint. */
window.DeskNavigation = (() => {
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function inside(p, r) {
    return p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom;
  }
  function entry(a, b, r) {
    let low = 0, high = 1;
    for (const [axis, min, max] of [['x', r.left, r.right], ['y', r.top, r.bottom]]) {
      const delta = b[axis] - a[axis];
      if (Math.abs(delta) < 1e-8) {
        if (a[axis] <= min || a[axis] >= max) return null;
      } else {
        const first = (min - a[axis]) / delta, second = (max - a[axis]) / delta;
        low = Math.max(low, Math.min(first, second));
        high = Math.min(high, Math.max(first, second));
      }
    }
    return low < high - 1e-8 && high > 0 && low < 1 ? low : null;
  }
  function outside(p, r, side) {
    if (!inside(p, r)) return { x: p.x, y: p.y };
    return { x: p.x, y: side === 'back' ? r.top - 1 : r.bottom + 1 };
  }
  function constrain(from, to, r, side) {
    const start = outside(from, r, side);
    const t = entry(start, to, r);
    if (t === null) return { x: to.x, y: to.y };
    const safe = Math.max(0, t - .6 / Math.max(1, distance(start, to)));
    return { x: start.x + (to.x - start.x) * safe, y: start.y + (to.y - start.y) * safe };
  }
  function shortest(start, goal, r) {
    const nodes = [start, goal,
      { x: r.left - 2, y: r.top - 2 }, { x: r.right + 2, y: r.top - 2 },
      { x: r.left - 2, y: r.bottom + 2 }, { x: r.right + 2, y: r.bottom + 2 }];
    const costs = nodes.map(() => Infinity), previous = nodes.map(() => -1), visited = new Set();
    costs[0] = 0;
    for (let count = 0; count < nodes.length; count++) {
      let current = -1;
      for (let i = 0; i < nodes.length; i++) if (!visited.has(i) && (current < 0 || costs[i] < costs[current])) current = i;
      if (current < 0 || !Number.isFinite(costs[current])) break;
      if (current === 1) break;
      visited.add(current);
      nodes.forEach((node, i) => {
        if (visited.has(i) || i === current || entry(nodes[current], node, r) !== null) return;
        const cost = costs[current] + distance(nodes[current], node);
        if (cost < costs[i]) { costs[i] = cost; previous[i] = current; }
      });
    }
    if (!Number.isFinite(costs[1])) return [];
    const path = [];
    for (let i = 1; i > 0; i = previous[i]) path.unshift(nodes[i]);
    return path;
  }
  function route(start, target, r, side) {
    const targetSide = target.y < (r.top + r.bottom) / 2 ? 'back' : 'front';
    const goal = outside(target, r, targetSide);
    let path = shortest(start, goal, r);
    // A lifted character remains in front until actually going around an end.
    if (side === 'front' && targetSide === 'back') {
      let best = Infinity;
      for (const x of [r.left - 2, r.right + 2]) {
        const portal = { x, y: r.top - 2 };
        const first = shortest(start, portal, r), second = shortest(portal, goal, r);
        if (!first.length || !second.length) continue;
        const candidate = first.concat(second);
        let cost = 0, last = start;
        for (const point of candidate) { cost += distance(last, point); last = point; }
        if (cost < best) { best = cost; path = candidate; }
      }
    }
    return { path, goal, side: targetSide };
  }
  return { inside, entry, outside, constrain, route };
})();
