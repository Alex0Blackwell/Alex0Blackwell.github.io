/* A small SVG hand; mouse-only and transparent to all page interactions. */
window.createDoodleCursor = function createDoodleCursor() {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const cursor = document.createElement('div');
  cursor.id = 'sketch-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = `<div class="cursor-motion"><svg viewBox="0 0 64 68" width="48" height="51" focusable="false">
    <g class="cursor-pose" data-pose="open">
      <path class="hand-fill" d="M20 58L18 48Q11 40 8 32Q6 28 9 26Q12 24 15 29L20 35L14 16Q13 12 16 11Q19 10 21 15L25 28L23 9Q23 5 26 5Q30 5 30 9L32 27L35 11Q36 7 39 8Q42 9 41 13L39 30L45 20Q47 17 50 19Q53 21 51 25L46 39Q44 47 39 50L38 59Z"/>
      <path class="hand-shade" d="M45 23L41 39Q39 48 34 50L34 58L38 58L39 50Q44 46 46 39L51 24Q52 21 50 20Z"/>
    </g>
    <g class="cursor-pose" data-pose="hover">
      <path class="hand-fill" d="M20 58L18 48Q12 43 9 36Q7 31 10 29Q13 27 16 31L20 36L16 24Q14 18 18 17Q22 16 24 22L27 30L25 18Q24 12 28 12Q32 12 33 18L34 29L36 20Q37 15 41 17Q44 18 42 23L40 33L45 27Q48 23 51 26Q53 28 50 33L46 41Q44 48 39 51L38 59Z"/>
      <path class="hand-shade" d="M48 27L41 41Q39 48 34 51L34 58L38 58L39 51Q44 48 46 41L50 33Q53 28 51 27Z"/>
    </g>
    <g class="cursor-pose" data-pose="closed">
      <path class="hand-fill" d="M20 57L19 49Q12 46 10 41L8 34Q7 28 12 27L12 23Q13 19 17 20L22 23L23 18Q25 15 29 18L33 20Q36 16 40 20L44 24Q48 22 51 27L52 38Q51 46 42 50L41 58Z"/>
      <path class="hand-shade" d="M48 26L48 38Q46 46 38 48L37 57L41 57L42 50Q51 46 52 38L51 28Z"/>
    </g>
    <g class="cursor-pose" data-pose="point">
      <path class="hand-fill" d="M22 58L21 49Q15 44 12 37Q10 33 13 31Q16 29 20 34L23 38L21 10Q21 5 25 5Q29 5 29 10L30 29Q34 25 38 29Q43 26 46 31Q51 29 53 34L53 42Q51 49 43 52L42 59Z"/>
      <path class="hand-shade" d="M49 33L49 42Q47 48 39 50L38 58L42 58L43 52Q51 49 53 42L53 35Q52 32 49 33Z"/>
    </g>
  </svg></div>`;
  document.body.append(cursor);
  const motion = cursor.firstElementChild;
  let active = false, x = 0, y = 0, pose = '', lastPoke = null, animation = null;
  const hide = () => {
    active = false;
    cursor.classList.remove('visible');
    document.documentElement.classList.remove('sketch-cursor-active');
  };
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches) { hide(); return; }
    x = event.clientX; y = event.clientY;
    active = true;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    cursor.classList.add('visible');
    document.documentElement.classList.add('sketch-cursor-active');
  }, { passive: true });
  window.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') hide(); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  finePointer.addEventListener('change', hide);
  return {
    update({ dragging, pressing, pokeTime }) {
      if (!active) return;
      const target = document.elementFromPoint(x, y);
      const hovered = target?.closest('[data-body]')?.dataset.body;
      const overLink = !!target?.closest('a[href]');
      const next = dragging ? 'closed' : pressing || pokeTime !== null || hovered === 'character' || overLink ? 'point' : hovered ? 'hover' : 'open';
      if (next !== pose) {
        pose = next;
        cursor.dataset.pose = pose;
        if (!reducedMotion.matches) {
          animation?.cancel();
          animation = motion.animate([{ transform: 'scale(.9) rotate(-5deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 130, easing: 'ease-out' });
        }
      }
      if (pokeTime !== null && pokeTime !== lastPoke) {
        lastPoke = pokeTime;
        if (!reducedMotion.matches) {
          animation?.cancel();
          animation = motion.animate([{ transform: 'translateY(-3px)' }, { transform: 'translateY(3px)', offset: .3 }, { transform: 'translateY(0)' }], { duration: 190 });
        }
      }
    },
  };
};
