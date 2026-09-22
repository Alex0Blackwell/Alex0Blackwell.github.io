# Alex Blackwell

A white personal website with a 2D character, desk, chair, computer, and lamp. The character is redrawn in SVG from the supplied turnaround and walking reference sheet, with black outlines, rounded limbs, and light gray shading.

## Preview

```sh
python -m http.server 8000
```

Open [localhost:8000](http://localhost:8000). No dependencies, external assets, fonts, installation, or build step. Opening `index.html` directly also works.

## GitHub Pages

Commit and push the files. In **Settings → Pages**, select **Deploy from a branch**, the branch containing these files, and **/ (root)**. Save to publish at `https://alex0blackwell.github.io/`.

`.nojekyll` disables Jekyll processing. Relative asset paths also support hosting in a subdirectory. See [GitHub's publishing source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Interactions

- A transparent SVG layer covers the whole document. Drag objects over the title and throughout the page with a mouse or finger. Blank space permits normal scrolling and clicking.
- Release to drop or throw. Moving the chair carries its occupant; moving the desk carries the items resting on it.
- The character reacts with speech bubbles, retrieves displaced objects, sits down, and resumes typing. Recovery can be interrupted again.
- Drag the character freely over the table. After release, collisions resume and walking routes go around its ends; the character stays in front until reaching the far side. The occupied chair remains blocked by the table.
- The page has no footer, instructional text, or visible animation controls.
- Tab to an object or use **1–5** to select the character, chair, computer, lamp, or desk. **Arrow keys** move, **Space/Enter** lift, **R** restores, and **Escape** releases.
- Hidden tabs stop rendering. Reduced motion suppresses decorative typing, blinking, and bobbing while preserving deliberate interactions and recovery.

## Source

- `index.html`: page content, controls, and SVG artwork.
- `styles.css`: responsive layout and styling.
- `js/doodle.js`: input, lightweight gravity/collisions, animation, and recovery.
- `js/navigation.js`: swept table collisions and walking routes around the furniture footprint.
- `js/character.js`: vector character redrawn from the supplied reference sheet, directional views, eight-pose walk cycle, and typing, wave, pickup, carrying, placing, held, falling, sitting, and happy animations.
- `favicon.svg`: matching doodle favicon.

No 3D renderer, WebGL, canvas, or CDN. Text and static artwork remain visible without JavaScript.

## Browser checks

`tests/check_site.py` uses Python's standard library to connect to Chromium running with `--headless --remote-debugging-port=9223 --remote-allow-origins=*`. With the browser and local server running:

```sh
python tests/check_doodle.py
python tests/check_character.py
python tests/check_navigation.py
```

Checks cover actual mouse/touch input, movement into the title area, recovery, keyboard controls, narrow screens, and reduced motion. Character checks additionally verify all eight walking poses, directional facing, and the pickup/carry/place/happy/sit sequence, and generate a visual pose atlas. Artifacts go in the ignored `tests/artifacts/` directory.
