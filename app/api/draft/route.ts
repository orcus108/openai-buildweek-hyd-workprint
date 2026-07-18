import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructured } from "@/lib/openai";
import { createSampleDraft } from "@/lib/sample-data";
import type { Evidence, StoryDraft, StoryMoment } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const momentSchema = z.object({
  id: z.string().min(1).max(120),
  kind: z.enum(["changed_my_mind", "struggled", "shipped", "learned", "before_after", "feedback"]),
  label: z.string().max(160),
  title: z.string().max(240),
  summary: z.string().max(2000),
  whyItMatters: z.string().max(2000),
  tension: z.string().max(1000),
  evidenceIds: z.array(z.string().max(120)).min(1).max(24),
  questions: z.tuple([z.string().max(1000), z.string().max(1000)]),
  confidence: z.number().min(0).max(1),
});

const evidenceSchema = z.object({
  id: z.string().min(1).max(120),
  kind: z.enum(["commit", "codex", "screenshot", "note"]),
  title: z.string().max(240),
  excerpt: z.string().max(5000),
  timestamp: z.string().max(80),
  reference: z.string().max(240),
  file: z.string().max(500).nullable().optional(),
  additions: z.number().int().nullable().optional(),
  deletions: z.number().int().nullable().optional(),
});

const requestSchema = z.object({
  moment: momentSchema,
  evidence: z.array(evidenceSchema).min(1).max(24),
  answers: z.tuple([z.string().max(4000), z.string().max(4000)]),
  sessionId: z.string().max(120).optional(),
  demo: z.boolean().optional(),
});

const draftSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "body", "channel", "claims"],
  properties: {
    headline: { type: "string" },
    body: { type: "string" },
    channel: { type: "string", enum: ["build_in_public"] },
    claims: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "text", "evidenceIds"],
        properties: {
          id: { type: "string" },
          text: { type: "string" },
          evidenceIds: { type: "array", minItems: 1, items: { type: "string" } },
        },
      },
    },
  },
} as const;

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    if (payload.demo) {
      return NextResponse.json(createSampleDraft(payload.moment.id, payload.answers));
    }

    const result = await generateStructured<StoryDraft>({
      sessionId: payload.sessionId,
      schemaName: "workprint_story",
      schema: draftSchema,
      instructions: `You are Workprint's restrained story editor. Write one excellent build-in-public story, not variants. Base every factual statement on supplied evidence. The builder's answers are the only source for feelings, beliefs, realizations, lessons, and intent. Do not improve their life story or fabricate a reaction. Lead with the most interesting turn. Prefer concrete language and varied short paragraphs. Avoid generic inspiration, hashtags, emojis, engagement bait, inflated claims, and em dashes. The story should sound like a perceptive builder explaining a real decision. Create claim records for material factual statements and cite only valid evidence IDs.`,
      input: JSON.stringify({
        selectedMoment: payload.moment satisfies StoryMoment,
        builderAnswers: payload.answers,
        evidence: payload.evidence satisfies Evidence[],
      }),
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Drafting failed";
    const status = error instanceof z.ZodError ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
