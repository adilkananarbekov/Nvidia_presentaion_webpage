# NVIDIA — Parallel Computing Changed the World

A one-page web presentation about how the GPU and parallel computing changed computing. It has eleven full-screen sections with GSAP transitions and Three.js scenes, including a rotating 3D model of a GeForce RTX 3090.

**Live:** https://adilkananarbekov.github.io/Nvidia_presentaion_webpage/

> The page is built for laptop and desktop screens. If the browser window is narrower than 1440 px, it shows only a "designed for laptop screens" notice.

## Sections

1. **Intro**: title and a clickable agenda
2. **The Limitation**: sequential vs parallel processing demo
3. **CPU vs GPU**: latency vs throughput
4. **One Core vs Thousands**: CUDA, with the 3D GPU model
5. **Evolution**: a timeline from 1999 to 2024
6. **The Sphere**: parallel rendering on a giant LED display
7. **CPU + GPU**: heterogeneous computing
8. **AI Factories**: DGX systems and use cases
9. **Omniverse**: digital twins
10. **Vision**: long-term strategy
11. **Finale**

## Features

- **One section per step.** A wheel step, key press or swipe moves exactly one section, with a GSAP fade and scale transition.
- **Navigation.** Side dots with labels, a clickable agenda on the first screen, and a progress bar at the top.
- **Loading screen** that also shows the download progress of the 3D model.
- **Five Three.js scenes:**
  - a rotating RTX 3090 model (if the `.glb` fails to load, a simple generated graphics card is shown instead)
  - CPU and GPU chips that move together and merge
  - rows of server racks with blinking LEDs
  - a wireframe city that builds itself (Omniverse section)
  - a fallback 3D sphere for the Sphere section, used only if its GIF does not load
- **3D scenes pause when off-screen.** Each scene renders only while its canvas is visible (IntersectionObserver).
- **Mouse parallax** on text blocks and visuals.
- **Animated demos.** A serial task pipeline next to a 128-node parallel grid, a growing timeline, and an SVG logo that draws itself in the finale.
- **Particle background.** A subtle particle field with faint connecting lines on a 2D canvas.

## Controls

| Action | Input |
| ------ | ----- |
| Next section | Mouse wheel down, `↓`, `Page Down`, `Space`, or swipe up |
| Previous section | Mouse wheel up, `↑`, `Page Up`, or swipe down |
| Jump to a section | Click a dot in the side navigation or an agenda item on the first screen |
| Parallax | Move the mouse |

## Tech stack

- HTML, CSS and vanilla JavaScript: no build step and no `package.json`
- [Three.js](https://threejs.org/) r128 with `GLTFLoader`
- [GSAP](https://gsap.com/) 3.12.5 with `ScrollToPlugin`
- Canvas 2D for the particle background
- Google Fonts: Space Grotesk and Inter
- GitHub Pages, deployed by the GitHub Actions workflow in `.github/workflows/static.yml` on every push to `master`

Three.js and GSAP are loaded from public CDNs (cdnjs and jsDelivr), so the page needs an internet connection.

## Run locally

`GLTFLoader` downloads the model over HTTP, and browsers block this when the page is opened from `file://`. Serve the folder with any static server:

```bash
git clone https://github.com/adilkananarbekov/Nvidia_presentaion_webpage.git
cd Nvidia_presentaion_webpage

npx serve .
# or
python -m http.server 8000
```

Open the address the server prints in a browser window that is at least 1440 px wide.

## Project structure

```
index.html                          all sections and markup
css/styles.css                      design system and layout
js/main.js                          loader, section navigation, parallax, section animations
js/three-scenes.js                  the five Three.js scenes
js/particles.js                     background particle field
assets/nvidia_geforce_rtx_3090.glb  3D model used by the page
presentation_information.md         original concept notes for the presentation
.github/workflows/static.yml        GitHub Pages deployment
```

The copy of `nvidia_geforce_rtx_3090.glb` at the repository root is the same file as the one in `assets/`. The page does not use it.

## Credits

- **3D model:** "Nvidia GeForce RTX 3090" by Sketchfab user `cemgurbuzz`, licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Source page: `sketchfab.com/3d-models/nvidia-geforce-rtx-3090-9b7cd73fefd5435f99f891567f5a9c2e`. The title, author, licence and source are taken from the metadata stored inside `assets/nvidia_geforce_rtx_3090.glb`. The licence allows non-commercial use only.
- **Sphere section image:** an animated GIF loaded at runtime from `i.makeagif.com`. It is not stored in this repository.
- NVIDIA and the product names on the page are trademarks of their owner. This is an independent study project and is not affiliated with or endorsed by NVIDIA.

## Author

Adilkan Anarbekov, web and Flutter developer from Bishkek, Kyrgyzstan.

- Website: https://adilkan.com
- GitHub: https://github.com/adilkananarbekov
- Telegram: [@Adilkan_07](https://t.me/Adilkan_07)
- Email: adilkananarbekov751@gmail.com
