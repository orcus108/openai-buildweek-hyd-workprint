import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  provider: z.enum(["openrouter", "google"]),
  apiKey: z.string().trim().max(500).optional(),
  draft: z.string().trim().min(1).max(12_000),
  instruction: z.string().trim().min(1).max(1_500),
  platform: z.enum(["x", "linkedin"]),
});

interface CompletionEnvelope {
  choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>;
  error?: { message?: string };
}

function readText(envelope: CompletionEnvelope) {
  const content = envelope.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.map((part) => part.text || "").join("").trim();
  return "";
}

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const apiKey = payload.apiKey || (payload.provider === "openrouter" ? process.env.OPENROUTER_API_KEY : process.env.GOOGLE_AI_STUDIO_API_KEY);
    if (!apiKey) return NextResponse.json({ error: `Add ${payload.provider === "openrouter" ? "an OpenRouter" : "a Google AI Studio"} key in Workprint settings.` }, { status: 400 });

    const isOpenRouter = payload.provider === "openrouter";
    const response = await fetch(isOpenRouter
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(isOpenRouter ? { "X-OpenRouter-Title": "Workprint" } : {}),
      },
      body: JSON.stringify({
        model: isOpenRouter
          ? process.env.OPENROUTER_MODEL || "openai/gpt-5.2"
          : process.env.GOOGLE_AI_MODEL || "gemini-3.5-flash",
        messages: [
          {
            role: "system",
            content: `You edit social posts for Workprint. Return only the revised post, with no preface, labels, quotation marks, or markdown fence. Preserve every factual claim and the builder's natural voice. Never invent metrics, reactions, motivations, or outcomes. Avoid generic inspiration, engagement bait, hashtags, and polished AI-sounding language. Keep paragraph breaks. ${payload.platform === "x" ? "Keep the result within 280 characters unless the instruction explicitly asks otherwise." : "Write for LinkedIn, but stay conversational and concise."}`,
          },
          {
            role: "user",
            content: `Instruction: ${payload.instruction}\n\nCurrent post:\n${payload.draft}`,
          },
        ],
        temperature: 0.55,
        max_completion_tokens: payload.platform === "x" ? 220 : 700,
      }),
      signal: AbortSignal.timeout(45_000),
    });

    const envelope = await response.json() as CompletionEnvelope;
    if (!response.ok) throw new Error(envelope.error?.message || `Provider request failed (${response.status})`);
    const draft = readText(envelope);
    if (!draft) throw new Error("The model returned an empty draft");
    return NextResponse.json({ draft });
  } catch (error) {
    const message = error instanceof z.ZodError ? "The rewrite request was incomplete." : error instanceof Error ? error.message : "Rewrite failed";
    return NextResponse.json({ error: message }, { status: error instanceof z.ZodError ? 400 : 502 });
  }
}
