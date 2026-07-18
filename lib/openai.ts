import { createHash } from "node:crypto";

const OPENAI_URL = "https://api.openai.com/v1/responses";

interface ResponseEnvelope {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
}

export async function generateStructured<T>({
  instructions,
  input,
  schemaName,
  schema,
  sessionId,
}: {
  instructions: string;
  input: unknown;
  schemaName: string;
  schema: Record<string, unknown>;
  sessionId?: string;
}): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  const safetyIdentifier = createHash("sha256")
    .update(sessionId || "workprint-local-demo")
    .digest("hex")
    .slice(0, 32);

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6-sol",
        reasoning: { effort: "medium" },
        instructions,
        input,
        max_output_tokens: 8_000,
        safety_identifier: safetyIdentifier,
        text: {
          verbosity: "medium",
          format: {
            type: "json_schema",
            name: schemaName,
            strict: true,
            schema,
          },
        },
      }),
      signal: controller.signal,
    });

    const envelope = (await response.json()) as ResponseEnvelope;
    if (!response.ok) {
      throw new Error(envelope.error?.message || `OpenAI request failed (${response.status})`);
    }

    const outputText = envelope.output_text || envelope.output
      ?.flatMap((item) => item.content || [])
      .find((item) => item.type === "output_text")?.text;

    if (!outputText) throw new Error("The model returned no structured output");
    return JSON.parse(outputText) as T;
  } finally {
    clearTimeout(timeout);
  }
}
