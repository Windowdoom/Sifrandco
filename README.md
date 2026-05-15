# Bit by Bit Pedagogy

USMLE Step 1, CBSE, COMLEX prep site for bitbybitmd.com. One unified single-page app with the marketing site, library, free Bit 20 sampler, full Bit 150 NBME-style exam, 400+ tidbit database, diagnostic intake quiz, and the Ask Bit AI tutor.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole site. Marketing sections plus a five-tab Toolkit (Find My Gap, Free Bit 20, Bit 150 Exam, Tidbits, Ask Bit). |
| `netlify/functions/chat.js` | Serverless backend for Ask Bit. Streams Claude Haiku. |
| `netlify.toml` | Build config and `/api/chat` redirect. |
| `package.json` | Lists `@anthropic-ai/sdk`. |
| `CONTENT_PLAYBOOK.md` | 30-day video calendar, hashtag sets, posting schedule, three content pillars, Reddit playbook. |

## Deploying to Netlify

1. Push this repo to GitHub.
2. In Netlify: New site from Git, select the repo. `netlify.toml` does the rest.
3. Site settings, Environment variables, add `ANTHROPIC_API_KEY` from console.anthropic.com.
4. Site settings, Domain management, connect bitbybitmd.com.
5. After first deploy, the `sampler-signup` and `contact` forms appear under Forms.

## Local preview

Open `index.html` in a browser for marketing and toolkit UI. Ask Bit and form submissions only work when deployed.

For full local testing with functions:
```
npm install
npx netlify dev
```

## Before launch

- Verify the 20 sampler questions and the 150 Bit 150 exam questions against your own sources.
- Replace the placeholder testimonial in the proof strip with a real student quote.
- Payhip link `https://payhip.com/b/pbKvH` is hardcoded in several spots. Update if your bundle URL changes.
- Calendly URL `https://calendly.com/sifrandcompany` is hardcoded. Update if you change handles.
- Set `ANTHROPIC_API_KEY` before going live or Ask Bit will return offline messages.

## Costs

- Netlify free tier covers everything here: 125k function invocations and 100 form submissions per month. Forms upgrade is $19/mo if you exceed 100.
- Anthropic API is pay-per-use. Haiku 4.5 costs about $0.002 per chat exchange. 1000 conversations is around $2.
- Domain is around $12/yr from your registrar.

## Launch checklist

- [ ] Verify clinical content in the Bit 20 and Bit 150 question arrays
- [ ] Replace the placeholder testimonial
- [ ] Set `ANTHROPIC_API_KEY` in Netlify
- [ ] Connect the custom domain
- [ ] Test Ask Bit end to end after deploy
- [ ] Submit a test sampler form, confirm Netlify Forms inbox
- [ ] Read CONTENT_PLAYBOOK.md, shoot the first 5 Master Pivot clips
