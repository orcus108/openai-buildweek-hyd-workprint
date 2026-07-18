import type { AnalysisResult, StoryDraft } from "./types";

export const SAMPLE_ANALYSIS: AnalysisResult = {
  project: {
    name: "Workprint",
    range: "July 18, 2026",
    sourceSummary: "14 commits, 1 Codex session, 3 screenshots",
  },
  evidence: [
    {
      id: "ev-commit-inbox",
      kind: "commit",
      title: "Replace blank composer with detected moments",
      excerpt:
        "Removed the prompt-first home screen. Added a private inbox that ranks story moments before any writing begins.",
      timestamp: "10:42",
      reference: "8f21c3a",
      file: "components/story-inbox.tsx",
      additions: 284,
      deletions: 119,
    },
    {
      id: "ev-codex-pivot",
      kind: "codex",
      title: "The product should notice before it writes",
      excerpt:
        "A generic post generator makes the user do the hardest work: deciding what mattered. The interface should begin after that decision has been made for them.",
      timestamp: "10:19",
      reference: "Codex session / product architecture",
    },
    {
      id: "ev-commit-proof",
      kind: "commit",
      title: "Attach evidence to every generated claim",
      excerpt:
        "Added claim-level references and an evidence drawer. Facts can now be traced back to the artifact that supports them.",
      timestamp: "12:06",
      reference: "4bc91d8",
      file: "components/story-studio.tsx",
      additions: 163,
      deletions: 27,
    },
    {
      id: "ev-codex-trust",
      kind: "codex",
      title: "Authenticity needs a visible boundary",
      excerpt:
        "The model may infer that a change is narratively interesting. It may not infer what the builder felt or learned. Ask for that missing perspective.",
      timestamp: "11:31",
      reference: "Codex session / trust model",
    },
    {
      id: "ev-commit-fallback",
      kind: "commit",
      title: "Make the full demo work without an API key",
      excerpt:
        "Created a deterministic sample project that runs through the same states as live analysis. Network failure no longer breaks the presentation.",
      timestamp: "13:14",
      reference: "d71a02e",
      file: "lib/sample-data.ts",
      additions: 202,
      deletions: 0,
    },
    {
      id: "ev-note-emotion",
      kind: "note",
      title: "Builder reflection",
      excerpt:
        "I kept assuming distribution began after shipping. Today I realized the raw material for distribution was already being created while I worked.",
      timestamp: "13:28",
      reference: "Voice note transcript",
    },
  ],
  timeline: [
    {
      id: "tl-1",
      date: "09:50",
      title: "Started with a post generator",
      description: "The first concept asked the builder to paste work and request a post.",
      evidenceIds: ["ev-codex-pivot"],
    },
    {
      id: "tl-2",
      date: "10:42",
      title: "Moved the intelligence upstream",
      description: "The blank composer became an inbox of moments the system had already noticed.",
      evidenceIds: ["ev-commit-inbox", "ev-codex-pivot"],
    },
    {
      id: "tl-3",
      date: "12:06",
      title: "Made every claim inspectable",
      description: "The draft gained a proof layer connecting facts to source artifacts.",
      evidenceIds: ["ev-commit-proof", "ev-codex-trust"],
    },
    {
      id: "tl-4",
      date: "13:14",
      title: "Protected the live demo",
      description: "A deterministic path made the product presentable without depending on network state.",
      evidenceIds: ["ev-commit-fallback"],
    },
  ],
  moments: [
    {
      id: "moment-pivot",
      kind: "changed_my_mind",
      label: "You changed your mind",
      title: "The post generator disappeared",
      summary:
        "You began with a writing tool, then realized the valuable act happens before writing: noticing what mattered.",
      whyItMatters:
        "This is a product-level reversal, not a feature change. It turns the user from prompt writer into a person being understood.",
      tension: "Generation was easy. Recognition was scarce.",
      evidenceIds: ["ev-codex-pivot", "ev-commit-inbox"],
      questions: [
        "When did you realize the blank prompt was making the builder do the hardest part?",
        "What can Workprint notice that the person doing the work is too close to see?",
      ],
      confidence: 0.96,
    },
    {
      id: "moment-proof",
      kind: "learned",
      label: "You found the trust boundary",
      title: "The AI can find the story, but not own it",
      summary:
        "You separated observable facts from the builder's private interpretation, then built the interview exactly at that boundary.",
      whyItMatters:
        "Most AI writing products erase authorship. This decision makes the result more human precisely because the model does less.",
      tension: "Inference makes the product useful. Restraint makes it trustworthy.",
      evidenceIds: ["ev-codex-trust", "ev-commit-proof"],
      questions: [
        "What would the product get dangerously wrong if it tried to infer the builder's feelings?",
        "Why is showing the proof part of the product experience rather than a technical detail?",
      ],
      confidence: 0.92,
    },
    {
      id: "moment-craft",
      kind: "shipped",
      label: "Invisible work became the feature",
      title: "A day of complexity became three calm choices",
      summary:
        "You built ingestion, ranking, interviewing, citations, and fallback states so the builder experiences a small, confident inbox.",
      whyItMatters:
        "The contrast between implementation effort and visible simplicity is the kind of craft audiences understand immediately.",
      tension: "The user sees three moments. The system had to understand an entire day.",
      evidenceIds: ["ev-commit-inbox", "ev-commit-proof", "ev-commit-fallback"],
      questions: [
        "Which part took the most work even though the user may never notice it?",
        "What did you deliberately remove to make the final loop feel obvious?",
      ],
      confidence: 0.88,
    },
  ],
};

export function createSampleDraft(
  momentId: string,
  answers: [string, string],
): StoryDraft {
  const moment = SAMPLE_ANALYSIS.moments.find((item) => item.id === momentId) ?? SAMPLE_ANALYSIS.moments[0];
  const firstAnswer = answers[0]?.trim() ||
    "I noticed I was still asking the builder to identify the interesting part, which was the exact problem I wanted to solve.";
  const secondAnswer = answers[1]?.trim() ||
    "The system can recognize a pattern, but the meaning still belongs to the person who lived it.";

  const headlines: Record<string, string> = {
    "moment-pivot": "We deleted the prompt box.",
    "moment-proof": "The AI found the story. Then it stopped.",
    "moment-craft": "The user sees three choices.",
  };

  return {
    headline: headlines[moment.id] || moment.title,
    body: `We started building Workprint as a better way to write build-in-public posts.\n\nThe first version looked familiar: give AI a pile of work, then ask it to turn that pile into content. It looked reasonable. It was also incomplete.\n\n${firstAnswer}\n\nThat changed the product. Workprint now reads the evidence your work already leaves behind, reconstructs the day, and places three moments worth sharing in a private inbox. The moment it surfaced for us was simple: ${moment.title.toLowerCase()}.\n\nThere is a line we will not let the model cross. ${secondAnswer}\n\nIt can notice a change in direction. It can point to the commit where that happened. But it has to ask us why.\n\nThe result is not five generic posts. It is one story that could only belong to the person who did the work.\n\nToday, Workprint used its own creation history to find this one.`,
    channel: "build_in_public",
    claims: [
      {
        id: "claim-1",
        text: "We replaced a blank composer with a private inbox of detected story moments.",
        evidenceIds: ["ev-commit-inbox", "ev-codex-pivot"],
      },
      {
        id: "claim-2",
        text: "Each factual claim in a generated story can be traced to its source artifact.",
        evidenceIds: ["ev-commit-proof"],
      },
      {
        id: "claim-3",
        text: "Workprint asks the builder for meaning instead of fabricating their perspective.",
        evidenceIds: ["ev-codex-trust", "ev-note-emotion"],
      },
    ],
  };
}
