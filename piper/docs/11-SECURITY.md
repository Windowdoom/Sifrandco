# 11 · Security and sovereignty (honest)

The threat model: a stolen machine, a hostile network, a careless future self. Here is what
is true today and what is the path.

## Today
- **Local by default.** With Ollama, nothing leaves the machine. Only turns routed to Claude
  leave, and only if you set a key.
- **Network token.** The moment Piper is reachable beyond loopback, every request needs a
  secret token (`?k=`). No open, unauthenticated port.
- **Action gating.** Mutating tools are off or confirm-by-default; everything is logged.
- **Least privilege.** Runs as your user, never root; file tools confined to home.
- **Your data is local files.** `data/` (memory, index, tasks, logs) and `knowledge/`. Back
  them up; move them between machines freely.

## The honest gaps and the path
- **Encryption at rest is not yet on in this portable build.** `data/` is plaintext on disk.
  If the machine could be stolen, use full-disk encryption (FileVault on Mac, LUKS on Linux)
  now — that is the strongest, simplest floor. App-level encryption (a passphrase that
  derives a key held only in RAM, the SifarOS master cipher) is the next addition; it needs
  the `cryptography` library, which is the one dependency worth adding for it.
- **Biometric unlock — the real version of "my face / my finger."** OS-level: Face ID/Touch
  ID already unlock the device the data lives on. In-app: WebAuthn/passkeys can make Face ID
  or a fingerprint unlock Piper itself. Real WebAuthn verification needs a crypto library
  (it checks a signature), so it is a deliberate next step, not faked here.
- **"Blood / DNA control" is not a real input.** Nothing reads DNA to drive software. The
  real, valuable version: your **health data** (Apple Health, sleep, labs) becomes knowledge
  Piper reasons over, and your **biometrics authenticate** you. Body informs it; body unlocks
  it. Anyone selling literal DNA-controlled software is selling fiction.

## Practical hardening checklist
- [ ] Turn on full-disk encryption (FileVault / LUKS).
- [ ] Keep `"actions": "confirm"`.
- [ ] Reach Piper only over Tailscale when away, not raw `0.0.0.0` on public Wi-Fi.
- [ ] Keep the Claude key in the `PIPER_CLAUDE_KEY` env var, not in the file, if you share backups.
- [ ] Back up `data/` and `knowledge/` to an encrypted drive.
