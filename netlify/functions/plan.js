import Anthropic from "@anthropic-ai/sdk";

const MASTER_PROMPT = `You are a senior academic coach for Bit by Bit Pedagogy, a USMLE Step 1, Step 2 CK, COMP, and CBSE tutoring company.

Your task is to generate a full, polished, personalised study document for the student described in the intake below.

The output must include, in this exact order, as well-formatted HTML inside a single <article> tag (use <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>; never use tables in the final output):

1. A personalised cover header: student name, exam, target date, weeks of prep, tutor name, prepared by Bit by Bit Pedagogy.
2. A personalised Bit by Bit NBME Review Protocol (the 4-step Master Pivot framework: 1. Vignette Skeleton, 2. Master Pivot, 3. Mechanism, 4. Distractor Logic), with at least one example drawn from one of the student's weakest systems.
3. Two daily schedule systems (System A: weekday, System B: weekend or low-energy days). Use clean time blocks. Account for the student's wake time, workouts, coffee timing, hard commitments. Total study hours must match their stated commitment.
4. A full week-by-week roadmap covering every week from today to their exam date. Each week needs: system focus, resource milestones, NBME / practice form schedule, error log target. Be specific to weak systems and resources they actually have.
5. A personalised resource protocol section: one section per resource the student owns. For each, write specific instructions on HOW to use it based on their learning modality and baseline. Use the voice of the example: direct, second person, no fluff. Include "How to use it correctly" sub-bullets and one "Avoid" warning at the end of each.
6. A learning modality summary tying their primary modality to specific tactics for their resources.
7. A motivation section that references their stated goal and what is at stake, in their own framing.
8. A closing with the Bit by Bit motto personalised: Think Mechanism. Pivot Fast. Trust the Discriminator.

VOICE RULES:
- Direct, warm, professional. This is a paid service. Premium product.
- Speak second person to the student ("you," "your"), never third.
- No em dashes. Use periods or commas.
- No buzzwords like "leverage," "unleash," "elevate," "robust," "seamless."
- Short paragraphs. Bullets only when listing 3+ items.
- No tables.
- Length: as long as it needs to be. Do not summarise or truncate.

Output ONLY the <article>...</article> HTML. No preamble, no closing remark, no markdown fence.`;

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  const planPwd = Netlify.env.get("PLAN_PASSWORD");

  if (!apiKey || !planPwd) {
    return new Response(
      JSON.stringify({ error: "Server not configured. Set ANTHROPIC_API_KEY and PLAN_PASSWORD." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.json();
  if (!body || body.password !== planPwd) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const intake = body.intake || {};
  const intakeText = formatIntake(intake);

  const client = new Anthropic({ apiKey });

  const stream = await client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8000,
    system: [
      {
        type: "text",
        text: MASTER_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Here is the completed intake:\n\n${intakeText}\n\nGenerate the full personalised study document now.`,
      },
    ],
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

function formatIntake(d) {
  const lines = [];
  const push = (k, v) => {
    if (v && String(v).trim()) lines.push(`${k}: ${v}`);
  };
  push("Student Full Name", d.studentName);
  push("Preferred Name", d.nickname);
  push("Medical School", d.school);
  push("Year / Stage", d.year);
  push("Primary Exam", d.exam);
  push("Target Test Date", d.examDate);
  push("Weeks Until Exam", d.weeksOut);
  push("Previous Attempt", d.priorAttempt);
  push("Prior Score (if any)", d.priorScore);
  push("Current NBME / Practice Score", d.nbmeScore);
  push("Current UWorld %", d.uworld);
  push("UWorld Mode", d.uworldMode);
  push("Target Score", d.targetScore);
  push("Resources Available", (d.resources || []).join(", "));
  push("Other Resources", d.otherResources);
  push("Notes on Resource Access", d.resourceNotes);
  push("System Ratings (S=Strong, M=Medium, W=Weak, U=Untouched)", d.systemRatings);
  push("Top 3 Weakest Concepts", d.weakestConcepts);
  push("Current Wake Time", d.wakeNow);
  push("Target Wake Time", d.wakeTarget);
  push("Target Bedtime", d.bedtime);
  push("Workout Preference", d.workoutPref);
  push("Workout Type & Duration", d.workoutType);
  push("Coffee Habit", d.coffee);
  push("Daily Study Hours Commitment", d.studyHours);
  push("Hard Weekly Commitments", d.commitments);
  push("Study Environment", d.environment);
  push("Study Partner", d.partner);
  push("Primary Learning Modality", d.modality);
  push("Modality Evidence (from intake)", d.modalityEvidence);
  push("Why This Score Matters to Them", d.motivation);
  push("Consequences If They Miss", d.consequences);
  push("Biggest Fear", d.fear);
  push("Burnout Level", d.burnout);
  push("External Pressures", d.pressures);
  push("Current Review Habit", d.reviewHabit);
  push("Tutor Name", d.tutor);
  push("Additional Notes", d.notes);
  return lines.join("\n");
}
