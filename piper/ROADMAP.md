# Piper — the long arc

The goal you named: a personal AI ecosystem that can teach, think, analyze, converse,
and act; that grows into a home server and security brain; that plugs into open hardware
and software; and that answers to you alone. This is the SifarOS vision, and it is a
decade build, not a weekend one. This document is honest about what exists now, what is
near, what is far, and what is not physically real — so the dream is built on truth.

## What exists now (shipped, tested)

- **The mind.** Persona + long-term memory (importance × time-decay) + retrieval over
  your own library (your Arcbook, medicine, Islamic sources) + faith/time awareness,
  reasoned by a local model (Ollama), a Claude amplifier, or an offline floor.
- **The ecosystem skeleton.** A capability registry: drop a file in `caps/`, declare a
  manifest and its tools, and Piper discovers it on launch and can use it. This is the
  socket every future integration plugs into.
- **Action layer (it can do, not only talk).** Shipped capabilities: `web` (search and
  read the live internet) and `system` (inspect the machine; run commands and write
  files when you set `allow_actions`). Read actions run freely; anything that changes the
  machine is off by default and logged when on.
- **Home-server mode.** `service/install.sh` makes Piper an always-on service (systemd or
  launchd) that restarts itself and survives reboot.
- **Reach.** Runs on Mac/Linux/any Python box; reachable from your iPhone over Wi‑Fi or
  Tailscale with a token; installs as a home-screen app.

## Near term (months — clear, buildable next steps)

- **Per-action confirm UI** in the shell: a card that shows the exact command/file before
  it runs, so `allow_actions` can be safe and granular instead of all-or-nothing.
- **More capabilities, the same way:**
  - `calendar` / `tasks` (CalDAV, or local files) — Piper manages your day.
  - `home` via **Home Assistant** — the open-source hub that already speaks to thousands
    of devices (lights, locks, cameras, sensors, thermostats). Piper calls its API; you
    do not integrate each device, Home Assistant does. This is how "connected to hardware"
    actually happens.
  - `files`/`notes`/`journal` capabilities feeding back into memory.
  - **MCP client** — speak the Model Context Protocol and Piper instantly gains every MCP
    server the open-source world ships (this is the real "connected to every app" lever).
- **Biometric unlock = your finger and your face, for real.** WebAuthn / passkeys let
  Touch ID, Face ID, or a YubiKey unlock Piper. This is the legitimate version of
  "controlled by my eyes / my finger."
- **Encrypted-at-rest memory** (the manifesto's master cipher) once you want the lock.

## Long horizon (years — the manifesto's decade)

- **Security brain.** With Home Assistant + cameras + sensors, Piper watches the home:
  motion while away, doors, smoke, water, power — and reasons about it ("a door opened at
  2am and no phone is home"). NVR software (Frigate) does the vision; Piper does the
  judgment.
- **A bigger, fine-tuned model.** As a dedicated inference node arrives, run a larger model
  always-on, and eventually one fine-tuned on your own writing, medicine, and thinking —
  a mind shaped by you alone. The model endpoint is already pluggable; only the hardware
  and the training corpus are the work.
- **Eyes.** Gaze and presence from a webcam (open-source eye-tracking) for hands-free
  control at a workstation. Experimental, but real.
- **The mesh of nodes.** HP box holds data + encryption (the home), Mac amplifies when
  awake, phone is the window — all over Tailscale, exactly as the manifesto lays out.

## The honest limits — what is not a control input

- **Blood and DNA are not control modalities.** Nothing reads your DNA to drive software,
  now or on any near horizon, and anyone claiming otherwise is selling something. What is
  real and worth building: your **health data** (Apple Health, a glucose monitor, sleep,
  labs) becomes *knowledge* Piper reasons over — "your HRV dropped and Step 2 is in three
  weeks, protect sleep." And **biometric authentication** (face, fingerprint) is how you
  prove it is you. So the spirit of "my body controls it" is honored as: your body's data
  informs it, and your body's signature unlocks it.
- **The model is the ceiling.** A 3B local model is fast and private but limited; the hard
  reasoning rides on Claude or a larger node. This trade-off is permanent until the
  hardware grows.
- **Always-on needs an always-on machine.** The phone and Mac are windows; the brain has to
  live on a node that does not sleep.

## How you grow it

You do not wait for a finished product; you add one capability at a time. Each new file in
`caps/` is a new sense or hand. Each book in `knowledge/` is more grounding. Each node on
the mesh is more reach. The system compounds. That is the point of صفر — it begins at zero
and everything is added with intention.
