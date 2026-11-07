# Abu Taleb Sadim — Animated Portfolio (v1)

A complete responsive, animated personal portfolio prototype built from the supplied reference images. **No Figma account, Node.js, package manager, React installation or internet connection is required** to run this version. The whole site is authored as editable HTML, CSS and vanilla JavaScript.

## How to run

1. Extract the ZIP file. Keep every file and the `assets` folder together.
2. Open `index.html` in Chrome, Edge, Firefox, or another modern browser.
3. Recommended for local development: open a terminal in this directory and run:

   ```bash
   python -m http.server 8000
   ```

   Then open `http://localhost:8000`.

## Included sections

| Section | Features |
|---------|----------|
| Home | Curved staircase menu, typing job title, interactive CTAs and social icons, formal portrait, role badge |
| About | Shared-portrait transition when scrolling from Home to About (desktop), intro, education, career goal |
| Skills | Ten constantly orbiting 3D-style interactive technology spheres, click/hover descriptions, pause control |
| Portfolio | Four project cards: existing VISTA plus GUB Canteen, 3D Rotating Image Gallery and Animated Sparkle Button; verified user-provided GitHub/Drive links and hover effects |
| Experience | Timeline covering the two club roles and leadership training |
| Contact | Name/email/message form, rotating canvas Earth constructed from real low-resolution world polygons, purple orbiting ribbons, drag-to-rotate support, footer |

Site-wide effects: smooth scrolling, active-section menu highlight, reveal-on-scroll, progress bar, glow, reduced-motion support, mobile navigation, responsive sizing.

## Customize your real information before publishing

Edit **`config.js`**. Its five public contact/profile fields intentionally start empty to avoid inventing personal contact details:

```js
window.PORTFOLIO_CONFIG = {
  email: 'YOUR_REAL_EMAIL@example.com',
  github: 'https://github.com/YOUR_USERNAME',
  linkedin: 'https://www.linkedin.com/in/YOUR_PROFILE/',
  facebook: 'https://www.facebook.com/YOUR_PROFILE',
  resumeUrl: 'assets/Your_Resume.pdf',
  vistaRepository: '',
  vistaDemo: ''
};
```

- Put your real PDF in `assets/` and set `resumeUrl` to its path.
- Social icons become active when the corresponding URL/email is configured. Until then they show a helpful note instead of opening an unrelated profile.
- The Contact form validates name/email/message. With a configured recipient, it opens a **pre-filled draft in the visitor's email application**; it does not automatically send an email or claim that it did. If no email is configured, it informs the visitor and attempts to copy their draft. A fully automatic message submission workflow requires a real backend or form service.
- Update actual project names/details in `index.html`, under `<!-- 04 PORTFOLIO -->`. The section now includes your two 2025 frontend projects and GUB Canteen alongside the existing VISTA card. The GUB Canteen repository and detailed tech stack remain unspecified because no verified link/details were included in the uploaded source ZIP.
- Replace `assets/portrait.png` with a high-quality real cut-out portrait if you want better likeness. The current portrait was **cropped/processed from the supplied stylized portfolio design reference** and might not reproduce your exact face.
- To adjust color, open `styles.css` and edit the CSS variables near the beginning (`--purple`, `--bright`, `--bg`, etc.).
- All ten technology labels, icons and descriptions are in `techs` in `script.js`.
- The two Google Drive links provided for each frontend project are labeled **Demo / Media 1** and **Demo / Media 2** because the file types could not be verified; adjust their labels in `index.html` once confirmed.

## Skills covered

C, C++, JavaScript, Python, HTML, CSS, MySQL, JSON, Django, ReactJS.

## Controls

- Scroll or use the links to move between sections.
- Click/hover a Skills planet to show information and pause orbit while examining it.
- Click **Pause orbit / Resume orbit** to control motion.
- Drag the Contact Earth left/right to rotate it.
- On mobile, use the hamburger menu.
- Site honors the operating system/browser **reduced motion** preference.

## File structure

```text
Abu_Taleb_Sadim_Animated_Portfolio/
├── index.html
├── styles.css
├── script.js
├── config.js
├── globe-data.js
├── assets/
│   └── portrait.png
└── README.md
```

## Notes on animation realism

This is a functional front-end prototype. The Skills spheres are **genuinely moving DOM objects** with simulated 3D shading/depth; the Earth is a **Canvas-rendered globe** that reprojects actual world-coastline polygons each frame, and CSS ribbon loops rotate around it. It is not a full photorealistic 3D engine. For physically accurate 3D lighting, shadows, and particle physics, it can later be upgraded to Three.js/React Three Fiber. The current version was chosen to work immediately without dependency installation.

Cartographic Earth polygons: Natural Earth low-resolution public-domain geography.
