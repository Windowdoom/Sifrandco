# THE WARD

**A Clinical Decision Simulator** — by WindowDoom

149 medical cases. Three game modes. Real consequences.

## Play

- **Web:** open `index.html` in any modern browser. No build step. No server. Runs offline.
- **Mobile:** the page is installable as a PWA — "Add to Home Screen" on Android / iOS.
- **CrazyGames / itch.io:** the entire game is a single self-contained HTML file. Zip the file and submit.

## Features

### Three game modes
- **⚡ Quick Play** — 5 random cases, ~10 minutes, ends with a shareable score card
- **📅 Daily Challenge** — 3 seeded cases, the same for every player on a given day, with a persistent daily streak
- **📖 Campaign** — full story mode: 5 chapters from MS-4 to Attending, mentor / rival NPCs, relationship system

### 149 high-yield cases
Authored across emergency medicine, internal medicine, surgery, OB/GYN, pediatrics, neurology, psychiatry, immunology, endocrinology, toxicology, and medical ethics. Each case has branching choices with clinical pearls — best, suboptimal, and harmful outcomes.

### Recurring NPC roster
Five recurring colleagues with distinct personalities and 0–100 relationship meters that shift based on what each NPC values:
- **Dr. Anita Patel** — mentor, internist
- **Nurse Elena Rivera** — charge nurse
- **Dr. Marcus Vance** — trauma surgeon, rival
- **Dr. Adaeze Okafor** — pediatrics
- **Sarah Kim, MS-3** — your student (chapter 4+)

### Career chart
Clerkship grades (Honors → Marginal) per specialty, faculty letters of recommendation whose strength scales with your relationships, and academic publications unlocked at case-count milestones.

### Hospital floor map
Walk between Emergency, ICU, Med Floor, Surgical, Pediatrics, OB/GYN, Psychiatry, and Outpatient Clinic. Patients are routed to the appropriate floor.

### Avatar customization
Gender, six skin tones, eight hair colors, six scrub colors, four accessories. Persistent across runs. Patient sprites also generated procedurally and reflect clinical status (sick, critical, on oxygen).

### Polish
- Live ECG canvas + 5-channel vitals monitor with abnormal-value blinking
- Web Audio API synthesised SFX (no audio files)
- Confetti, screen shake, streak banners, mega-streak labels (IN THE ZONE → ON FIRE → UNSTOPPABLE → GODLIKE)
- First-time guided tutorial
- Pause menu
- Code Blue random events with 30-second timers
- Settings (volume, difficulty, tutorial replay, save erase)

### Shareable score card
After every Quick Play and Daily Challenge run, the game renders a 1080×1080 PNG with grade, stats, and branding. Three actions: Download, Copy Text, native Web Share (mobile).

## Controls

| Key | Action |
|-----|--------|
| Click patient | Open chart |
| `1` `2` `3` `4` | Pick the corresponding action |
| `Enter` | Dismiss outcome overlay |
| `E` | End shift |
| `Esc` | Close chart / open pause menu |
| `P` | Pause |

## Tech

- Vanilla HTML / CSS / JavaScript
- Single file (`index.html`, ~460KB)
- No build step, no dependencies, no backend
- Web Audio API for SFX
- Canvas API for ECG and share card rendering
- localStorage for save data
- PWA manifest for installability

## Submitting to game portals

The whole game is one file. To package:

```bash
zip the-ward-v1.zip index.html
```

Then upload to:
- **CrazyGames** — [developer.crazygames.com](https://developer.crazygames.com)
- **itch.io** — [itch.io/game/new](https://itch.io/game/new)
- **Newgrounds** — [newgrounds.com/projects/games/](https://newgrounds.com/projects/games/)
- **Poki**, **Kongregate**, **Y8** — accept HTML5 zips

The game declares 16:9 + responsive scaling and works in iframes.

## Disclaimer

The clinical scenarios are dramatised for entertainment and learning. Nothing in this simulation constitutes medical advice. Always consult licensed practitioners for actual care.

## Credits

Design, code, and clinical content: **WindowDoom**.

© WindowDoom · v1.0
