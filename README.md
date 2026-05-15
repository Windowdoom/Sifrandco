# Bit by Bit Pedagogy — Site + AI Tutor

USMLE Step 1 / CBSE / COMLEX prep site for bitbybitmd.com.

## What's in here

| File | Purpose |
|---|---|
| `index.html` | Main marketing site (redesigned with proof strip, FAQ, lead magnet, founding-rate framing) |
| `chat.html` | `/chat` — AI tutor "Ask Bit", streams from Claude via Netlify function |
| `sampler.html` | `/sampler` — free Bit 20 quiz with email capture (Netlify Forms) |
| `netlify/functions/chat.js` | Serverless backend for the chat agent |
| `netlify.toml` | Netlify build + redirect config |
| `package.json` | Lists `@anthropic-ai/sdk` for the chat function |
| `CONTENT_PLAYBOOK.md` | Marketing playbook: video formats, scripts, hashtags, 30 Master Pivots, email funnel |

## Deploying to Netlify

1. Push this repo to GitHub.
2. In Netlify: **New site from Git** → select the repo.
3. Build settings auto-detect from `netlify.toml`. No build command needed.
4. **Set the env var** (Site settings → Environment variables):
   - `ANTHROPIC_API_KEY` = your key from console.anthropic.com
5. Connect your custom domain `bitbybitmd.com` (Site settings → Domain management).
6. After first deploy, Netlify will register the `sampler-signup` and `contact` forms automatically. Check submissions under the **Forms** tab.

## Local preview

Open `index.html` in a browser to preview the marketing pages. The chat agent only works when deployed (it needs the function endpoint).

For full local testing with functions:
```bash
npm install
npx netlify dev
```

## What you should edit before launch

- **`sampler.html`** — verify all 20 clinical questions/explanations against your own sources. Marked at top of script block.
- **`index.html`** — the proof-strip testimonial is a placeholder ("REPLACE WITH REAL TESTIMONIAL"). Swap in real student quotes once you have them.
- **`netlify/functions/chat.js`** — the `SYSTEM_PROMPT` defines Bit's voice. Tune it as you learn what students ask.
- **Payhip link** `https://payhip.com/b/pbKvH` is hardcoded in three spots. Update if the bundle URL changes.
- **Calendly URL** `https://calendly.com/sifrandcompany` is hardcoded. Update if you change Calendly handle.

## Costs

- **Netlify:** free tier covers everything (125k function invocations/mo, 100 form submissions/mo). Forms upgrade is $19/mo if you exceed 100.
- **Anthropic API:** pay-per-use. Haiku 4.5 is ~$1 per 1M input tokens / $5 per 1M output. A typical chat exchange is ~$0.002. 1,000 conversations ≈ $2.
- **Domain:** ~$12/yr from your registrar.

## Going-live checklist

- [ ] Verify clinical content in `sampler.html`
- [ ] Replace placeholder testimonial in `index.html` proof strip
- [ ] Set `ANTHROPIC_API_KEY` in Netlify env vars
- [ ] Connect `bitbybitmd.com` domain
- [ ] Test the chat agent end-to-end after deploy
- [ ] Submit a test sampler form → check email arrives in Netlify Forms inbox
- [ ] Set up email forwarding from Netlify Forms to your real inbox
- [ ] Read `CONTENT_PLAYBOOK.md` and shoot the first 5 Master Pivot clips
