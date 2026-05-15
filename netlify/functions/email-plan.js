import { Resend } from "resend";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = Netlify.env.get("RESEND_API_KEY");
  const planPwd = Netlify.env.get("PLAN_PASSWORD");
  const fromAddr = Netlify.env.get("PLAN_FROM_EMAIL") || "Bit by Bit Pedagogy <hello@bitbybitmd.com>";

  if (!apiKey || !planPwd) {
    return new Response(
      JSON.stringify({ error: "Server not configured. Set RESEND_API_KEY and PLAN_PASSWORD." }),
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

  const { to, studentName, planHtml } = body;
  if (!to || !planHtml) {
    return new Response(JSON.stringify({ error: "Missing to or planHtml" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const subject = `Your Bit by Bit Study Blueprint, ${studentName || "Student"}`;
  const html = `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:780px;margin:0 auto;padding:24px;">
<div style="border-bottom:2px solid #00E5A0;padding-bottom:12px;margin-bottom:24px;">
<div style="font-family:'Courier New',monospace;font-size:14px;font-weight:bold;letter-spacing:0.5px;">BIT BY BIT <span style="color:#F5A623;">PEDAGOGY</span></div>
</div>
${planHtml}
<hr style="margin-top:36px;border:none;border-top:1px solid #ddd;">
<p style="font-size:11px;color:#888;font-family:'Courier New',monospace;">Think Mechanism. Pivot Fast. Trust the Discriminator.<br>Bit by Bit Pedagogy. bitbybitmd.com</p>
</body></html>`;

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: fromAddr,
    to: [to],
    subject,
    html,
  });

  if (result.error) {
    return new Response(JSON.stringify({ error: result.error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, id: result.data?.id }), {
    headers: { "Content-Type": "application/json" },
  });
};
