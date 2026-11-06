// NutriTrack AI function (Supabase Edge Function).
// Keeps your Google Gemini key secret: the app talks to this function, never to Google directly.
// Needs one secret: GEMINI_API_KEY (free from https://aistudio.google.com/apikey).
// Optional secret: GEMINI_MODEL (default below) if Google renames its models.

const MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
const KEY = Deno.env.get("GEMINI_API_KEY") || "";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!KEY) return json({ error: "GEMINI_API_KEY is not set" }, 500);
  try {
    const { system = "", messages = [], image = null, json: wantJson = false } = await req.json();
    // basic limits so nobody can run up your usage
    const msgs = (Array.isArray(messages) ? messages : []).slice(-12).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "").slice(0, 4000) }],
    }));
    if (!msgs.length || msgs[msgs.length - 1].role !== "user") return json({ error: "Last message must be from the user" }, 400);
    while (msgs.length && msgs[0].role !== "user") msgs.shift();
    if (image && typeof image === "string" && image.length < 3_000_000) {
      msgs[msgs.length - 1].parts.unshift({ inline_data: { mime_type: "image/jpeg", data: image } } as never);
    }
    const body = {
      systemInstruction: { parts: [{ text: String(system).slice(0, 6000) }] },
      contents: msgs,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
        ...(wantJson ? { responseMimeType: "application/json" } : {}),
      },
    };
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": KEY },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) return json({ error: data?.error?.message || "Gemini error" }, 502);
    const text = (data?.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || "").join("").trim();
    return json({ text });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
