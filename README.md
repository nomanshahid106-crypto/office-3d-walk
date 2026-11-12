# Office 3D — Walk Around

A 3D office built with **Three.js** where a character can freely walk around.

## Features
- Full office: 6 work desks with monitors, keyboards & office chairs, meeting table, sofa area, whiteboard, bookshelf, plants, windows & ceiling lights
- Animated man: procedural walk cycle (swinging arms & legs, body bob), idle breathing animation
- Free walking with collision detection (walls, desks, tables, plants)
- Third-person follow camera + First-person view toggle
- Real-time shadows, ACES tone mapping, fog

## Controls
| Key | Action |
|---|---|
| W / ↑ | Walk forward |
| S / ↓ | Walk backward |
| A / D or ← / → | Turn left / right |
| Shift | Run |
| Mouse drag | Orbit camera |
| Scroll | Zoom |
| V | Toggle Third / First person |
| Touch joystick | Mobile walking |

## Tech
- Three.js 0.160 via CDN import map (no build step)
- Vanilla JS + CSS, served as static site on Vercel

## Run locally
```bash
npx serve .
# or
python3 -m http.server 8000
```
Open http://localhost:8000
