# 🏎️ Velocity Rush

A browser-based 3D arcade racing game built with **Next.js**, **React Three Fiber**, and **custom vehicle physics** — no game engine, no paid assets, no physics middleware. Just Three.js, math, and a desert circuit.

![Tech](https://img.shields.io/badge/Next.js-16-black) ![Tech](https://img.shields.io/badge/React-19-61DAFB) ![Tech](https://img.shields.io/badge/Three.js-R3F-orange) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎮 Play

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and race.

---

## ✨ Features

- **Custom car physics** — hand-built acceleration, braking, drift, and a 6-speed automatic gearbox simulated entirely with vector math (no physics engine)
- **F1-style circuit** — a hand-authored Desert Run track with hairpins, sweepers, a back straight, alternating guard rails and sand-trap kerbs
- **5 AI opponents** — waypoint-following ghost cars racing in a proper starting grid
- **Live race systems** — checkpoint-validated lap tracking, real-time position calculation (1st–6th), best lap timing
- **Full game loop** — main menu → 3-2-1-GO countdown → race → results screen → restart
- **Dynamic HUD** — speedometer with RPM band, gear indicator, lap counter, live minimap with directional car marker
- **Procedural audio** — engine note that pitches through gears, tire screech on hard braking/sliding, countdown beeps — all generated via the Web Audio API, zero audio files
- **Driver assists** — wrong-way and off-track alerts, instant reset-to-checkpoint with `R`
- **Physical feedback** — guard rail collisions slow the car and shake the camera on impact; wheels spin in sync with road speed

---

## 🕹️ Controls

| Key | Action |
|---|---|
| `W` / `↑` | Accelerate |
| `S` / `↓` | Brake / Reverse |
| `A` / `←` | Steer left |
| `D` / `→` | Steer right |
| `Space` | Handbrake |
| `R` | Reset to last checkpoint |
| `C` | Switch camera *(planned)* |

---

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| 3D Rendering | React Three Fiber + Three.js |
| Physics | Custom — no Rapier/Cannon dependency |
| State | Zustand |
| Audio | Web Audio API (procedural, no asset files) |
| Language | TypeScript |

**Why custom physics instead of Rapier?** Early builds used `@react-three/rapier`, but the WASM physics module triggered consistent WebGL context loss on the target development environment (Windows + Chromium-based browsers with limited GPU resources). Rather than fight the engine, the project moved to hand-rolled vector physics — which turned out to give tighter control over the arcade feel anyway. This is a common pattern in real arcade racers, where full rigid-body simulation is often overkill.

---

## 📁 Project Structure

```
app/                    Next.js app router entry
  page.tsx              Main page — menu/HUD/game composition

game/
  cars/                 Player car mesh, physics hook, controller
  cameras/               Chase camera with speed-based zoom and shake
  tracks/                Track geometry, waypoints, checkpoints
  ai/                    Ghost car AI + position tracking
  race/                  Lap manager, countdown, position calculation
  audio/                 Procedural engine sound + SFX

components/
  HUD/                   Speedometer, lap counter, minimap, alerts
  Menus/                 Main menu

store/                  Zustand global game state
types/                  Shared TypeScript interfaces
```

---

## 🏁 How Racing Works

**Track representation.** The circuit is a closed loop of waypoints (`Vector3[]`). Road geometry, guard rails, kerbs, and the AI driving line are all derived from this single array, so the track is defined once and rendered/driven/validated consistently.

**Lap validation.** A car must pass through every checkpoint *in order* before crossing the finish line counts as a completed lap — this prevents lap-skipping via shortcuts.

**Position calculation.** Every car's progress is expressed as a single 0–1 float (current lap + fractional distance along the current track segment). Comparing these values across all cars gives live race position without needing physics-engine collision queries.

**Track boundary collision.** Each frame, the car's distance to the nearest track centerline segment is computed. Exceeding the road's half-width triggers a position correction (pushback toward centerline) and a speed penalty proportional to impact severity — simulating a guard rail hit without rigid-body physics.

---

## 🚧 Roadmap

This is an MVP-scoped build. Documented next steps if continued:

- [ ] Additional tracks (Neon City, Mountain Circuit)
- [ ] Championship mode (multi-race series with cumulative scoring)
- [ ] AI difficulty tiers (Easy / Medium / Hard with distinct racing lines)
- [ ] Cockpit (first-person) camera mode
- [ ] Persistent save system (best times, unlocks via LocalStorage)
- [ ] Mobile touch controls

---

## 📦 Deployment

Deploys cleanly to **Vercel** (zero config — Next.js native):

```bash
npm run build
```

No environment variables, API keys, or paid services required. The entire project runs on free, open-source tooling.

---

## 📄 License

MIT — free to use, modify, and learn from.

---

Built as a portfolio project demonstrating full-stack 3D web development: custom physics simulation, real-time game state management, procedural audio synthesis, and production deployment — all without a traditional game engine.