import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructured } from "@/lib/openai";
import { SAMPLE_ANALYSIS } from "@/lib/sample-data";
import type { AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const requestSchema = z.object({
  projectName: z.string().trim().min(1).max(80),
  sourceText: z.string().trim().min(40).max(120_000),
  screenshots: z.array(z.object({
    name: z.string().max(160),
    dataUrl: z.string().max(8_000_000).refine((value) => /^data:image\/(png|jpeg|webp);base64,/.test(value), "Unsupported image"),
  })).max(3).optional(),
  sessionId: z.string().max(120).optional(),
  demo: z.boolean().optional(),
});

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["project", "timeline", "moments", "evidence"],
  properties: {
    project: {
      type: "object",
      additionalProperties: false,
      required: ["name", "range", "sourceSummary"],
      properties: {
        name: { type: "string" },
        range: { type: "string" },
        sourceSummary: { type: "string" },
      },
    },
    timeline: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "date", "title", "description", "evidenceIds"],
        properties: {
          id: { type: "string" },
          date: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          evidenceIds: { type: "array", items: { type: "string" } },
        },
      },
    },
    moments: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "kind", "label", "title", "summary", "whyItMatters", "tension", "evidenceIds", "questions", "confidence"],
        properties: {
          id: { type: "string" },
          kind: { enum: ["changed_my_mind", "struggled", "shipped", "learned", "before_after", "feedback"] },
          label: { type: "string" },
          title: { type: "string" },
          summary: { type: "string" },
          whyItMatters: { type: "string" },
          tension: { type: "string" },
          evidenceIds: { type: "array", minItems: 1, items: { type: "string" } },
          questions: { type: "array", minItems: 2, maxItems: 2, items: { type: "string" } },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
      },
    },
    evidence: {
      type: "array",
      minItems: 3,
      maxItems: 24,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "kind", "title", "excerpt", "timestamp", "reference", "file", "additions", "deletions"],
        properties: {
          id: { type: "string" },
          kind: { enum: ["commit", "codex", "screenshot", "note"] },
          title: { type: "string" },
          excerpt: { type: "string" },
          timestamp: { type: "string" },
          reference: { type: "string" },
          file: { type: ["string", "null"] },
          additions: { type: ["integer", "null"] },
          deletions: { type: ["integer", "null"] },
        },
      },
    },
  },
} as const;

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    if (payload.demo) return NextResponse.json(SAMPLE_ANALYSIS);

    const result = await generateStructured<AnalysisResult>({
      sessionId: payload.sessionId,
      schemaName: "workprint_analysis",
      schema: analysisSchema,
      instructions: `You are Workprint's story archaeologist. Reconstruct what happened from raw work artifacts, then detect exactly three moments a thoughtful builder could credibly share. Notice before generating. Use only supplied facts. Never invent feelings, lessons, user reactions, metrics, dates, files, or outcomes. Each moment must have a real narrative turn, tension, or consequence. Ask two precise questions that recover the human perspective only the builder can provide. Evidence IDs must resolve to items in the evidence array. Keep language specific, calm, and free of marketing hype.`,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: `Project: ${payload.projectName}\n\nRaw work artifacts:\n${payload.sourceText}` },
          ...(payload.screenshots || []).map((image) => ({ type: "input_image", image_url: image.dataUrl, detail: "low" })),
        ],
      }],
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    const status = error instanceof z.ZodError ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
