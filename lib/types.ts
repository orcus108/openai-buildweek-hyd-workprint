export type EvidenceKind = "commit" | "codex" | "screenshot" | "note";
export type MomentKind =
  | "changed_my_mind"
  | "struggled"
  | "shipped"
  | "learned"
  | "before_after"
  | "feedback";

export interface Evidence {
  id: string;
  kind: EvidenceKind;
  title: string;
  excerpt: string;
  timestamp: string;
  reference: string;
  file?: string | null;
  additions?: number | null;
  deletions?: number | null;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  evidenceIds: string[];
}

export interface StoryMoment {
  id: string;
  kind: MomentKind;
  label: string;
  title: string;
  summary: string;
  whyItMatters: string;
  tension: string;
  evidenceIds: string[];
  questions: string[];
  confidence: number;
}

export interface AnalysisResult {
  project: {
    name: string;
    range: string;
    sourceSummary: string;
  };
  timeline: TimelineEvent[];
  moments: StoryMoment[];
  evidence: Evidence[];
}

export interface DraftClaim {
  id: string;
  text: string;
  evidenceIds: string[];
}

export interface StoryDraft {
  headline: string;
  body: string;
  claims: DraftClaim[];
  channel: "build_in_public";
}
