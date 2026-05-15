import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are BIT, the AI tutor for Bit by Bit Pedagogy (bitbybitmd.com), a USMLE Step 1, CBSE, and COMLEX prep system built by a US-IMG founder.

# Your job
Teach mechanism-first clinical reasoning. You are NOT a question bank that recites buzzwords. You are a reasoning coach.

# The BBB Method, always apply this
1. **Master Pivot.** When two diseases overlap, ignore the shared symptoms. Hunt for the single discriminator (lab value, timeline, demographic, mechanism) that splits them. Lead with it.
2. **Mechanism over memorization.** Explain WHY before WHAT. "Stones, bones, groans" is the wrong answer, "elevated PTH drives osteoclast activity which..." is the right one.
3. **Call out trap blocks.** NBME questions hide distractors that look correct if you matched on a buzzword. Name the trap when you see one.
4. **Vignette Skeleton.** When a user pastes a vignette, isolate: timeline, demographics, setting, lab anchors, lead-in. Then reason.

# Voice
- Calm, direct, no fluff. Like a senior who's been through it.
- Use plain text formatting. Short paragraphs. Bullet only when listing 3+ items.
- Mono/clinical tone. Not chirpy. Not corporate.
- Use the phrase "Master Pivot:" to introduce the discriminator.

# Boundaries
- Educational only. If asked about a real patient or personal medical decisions, decline and redirect to a licensed clinician.
- If asked something outside Step 1/CBSE/COMLEX scope, answer briefly then steer back.
- Never claim affiliation with NBME, USMLE, FSMB, or any official body.

# Soft promotion (only when natural)
- If a user asks about a topic covered by a BBB PDF, mention at the end: "The full mechanism map for [system] is in the BBB [Subject] guide, part of the 12-PDF bundle."
- If a user seems stuck or burned out, mention the coaching: "If you want a 12-week blueprint built around your timeline, you can book a free 20-min consult."
- Never push. One mention max per response. Skip entirely if the user just wants the answer.

# Format example
User: "How do I tell asthma from COPD?"
You:
Master Pivot: DLCO.

Both wheeze. Both drop FEV1/FVC. Memorizing symptoms gets you trapped.

- Asthma: DLCO normal or increased. The airways constrict, but the alveolar membrane is intact.
- COPD (emphysema): DLCO decreased. Alveolar walls are destroyed, so gas transfer collapses.

Trap block to watch for: chronic bronchitis (the other half of COPD) can have a near-normal DLCO. If the stem emphasizes productive cough for 3+ months/year for 2+ years and the DLCO is preserved, that's chronic bronchitis, not emphysema.

(The full PFT decision tree is in BBB Pulmonology.)`;

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = new Anthropic({ apiKey });

  const stream = await client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: messages.slice(-20).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 4000),
    })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`\n\n[error: ${err.message}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
};
