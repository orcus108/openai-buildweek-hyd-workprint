"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Code,
  Copy,
  DownloadSimple,
  FileText,
  GitBranch,
  Image as ImageIcon,
  LockSimple,
  NotePencil,
  Paperclip,
  ShieldCheck,
  Stack,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChangeEvent, useEffect, useId, useRef, useState } from "react";
import { SAMPLE_ANALYSIS, createSampleDraft } from "@/lib/sample-data";
import type { AnalysisResult, Evidence, StoryDraft, StoryMoment } from "@/lib/types";

type Stage = "welcome" | "source" | "analyzing" | "inbox" | "reflect" | "drafting" | "studio";
interface SourceFile { name: string; type: "text" | "image"; content: string; size: string }

const SAMPLE_SOURCE = `commit 8f21c3a
Author: Vedant
Date: Jul 18 10:42

Replace blank composer with detected moments

Removed prompt-first home screen and added a private inbox that ranks story moments before writing.

Codex session 10:19
A generic post generator makes the user do the hardest work: deciding what mattered. The interface should begin after that decision has been made for them.

commit 4bc91d8
Date: Jul 18 12:06

Attach evidence to every generated claim

Added claim-level references and an evidence drawer.

Codex session 11:31
The model may infer that a change is interesting. It may not infer what the builder felt or learned. Ask for that missing perspective.`;

const stageLabels: Partial<Record<Stage, string>> = {
  source: "Add work",
  analyzing: "Analyzing",
  inbox: "Story Inbox",
  reflect: "Reflection",
  drafting: "Writing",
  studio: "Story Studio",
};

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-7 place-items-center rounded-[8px] bg-[var(--text)] text-[var(--background)]">
        <Stack size={14} weight="fill" />
      </span>
      <span className="text-sm font-semibold tracking-[-0.02em]">Workprint</span>
    </div>
  );
}

function Header({ stage, project, onReset }: { stage: Stage; project?: string; onReset: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <button onClick={onReset} aria-label="Return to Workprint home" className="rounded-[8px]">
          <Brand />
        </button>
        {stage !== "welcome" && (
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs md:flex">
            <span className="font-medium">{project || "Untitled"}</span>
            <span className="text-[var(--text-tertiary)]">/</span>
            <span className="text-[var(--text-secondary)]">{stageLabels[stage]}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
          <LockSimple size={13} />
          <span className="hidden sm:inline">Private</span>
        </div>
      </div>
    </header>
  );
}

function Welcome({ onDemo, onStart }: { onDemo: () => void; onStart: () => void }) {
  const reduce = useReducedMotion();
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-56px)] max-w-3xl items-center px-5 py-16">
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <h1 className="max-w-2xl text-[clamp(2.75rem,7vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.055em]">
          Find the story in your work.
        </h1>
        <p className="mt-6 max-w-lg text-[17px] leading-7 text-[var(--text-secondary)]">
          Workprint notices what mattered, asks for your perspective, and shows the evidence behind every claim.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button className="button-primary" onClick={onStart}>Add your work <ArrowRight size={14} weight="bold" /></button>
          <button className="button-ghost" onClick={onDemo}>Try the Workprint demo</button>
        </div>
      </motion.section>
    </main>
  );
}

function SourceSetup({
  projectName, setProjectName, sourceText, setSourceText, files, setFiles, onAnalyze, onDemo,
}: {
  projectName: string;
  setProjectName: (value: string) => void;
  sourceText: string;
  setSourceText: (value: string) => void;
  files: SourceFile[];
  setFiles: (files: SourceFile[]) => void;
  onAnalyze: () => void;
  onDemo: () => void;
}) {
  const textInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const ready = projectName.trim().length > 0 && (sourceText.trim().length >= 40 || files.some((file) => file.type === "image"));

  async function addFiles(event: ChangeEvent<HTMLInputElement>, kind: "text" | "image") {
    const picked = Array.from(event.target.files || []).slice(0, kind === "image" ? 3 : 4);
    const next = await Promise.all(picked.map(async (file) => ({
      name: file.name,
      type: kind,
      content: await readFile(file, kind === "image"),
      size: formatBytes(file.size),
    } satisfies SourceFile)));
    setFiles([...files, ...next].slice(0, 6));
    if (kind === "text") setSourceText([sourceText, ...next.map((file) => file.content)].filter(Boolean).join("\n\n"));
    event.target.value = "";
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <div className="mb-9">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-4xl">Add your work</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Paste a Git or Codex export. You can also attach notes and screenshots.</p>
      </div>

      <section className="space-y-6">
        <div>
          <label className="mb-2 block text-[13px] font-medium" htmlFor="project-name">Project name</label>
          <input id="project-name" className="field" value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Workprint" />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[13px] font-medium" htmlFor="source-text">Work history</label>
            <button className="text-xs text-[var(--text-secondary)] hover:text-[var(--text)]" onClick={() => { setProjectName("Workprint"); setSourceText(SAMPLE_SOURCE); }}>Use example text</button>
          </div>
          <textarea
            id="source-text"
            className="field min-h-64 resize-y font-mono text-[12px] leading-6"
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            placeholder={"Paste git log --stat, a Codex export, release notes, or work notes."}
          />
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium">Attachments</p>
          <div className="flex flex-wrap gap-2">
            <button className="button-secondary" onClick={() => textInput.current?.click()}><FileText size={14} /> Add files</button>
            <button className="button-secondary" onClick={() => imageInput.current?.click()}><ImageIcon size={14} /> Add screenshots</button>
            <input ref={textInput} className="sr-only" type="file" multiple accept=".txt,.md,.json,.log,.patch,.diff" onChange={(event) => void addFiles(event, "text")} />
            <input ref={imageInput} className="sr-only" type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={(event) => void addFiles(event, "image")} />
          </div>
          {files.length > 0 && (
            <div className="mt-3 divide-y divide-[var(--border)] rounded-[10px] border border-[var(--border)]">
              {files.map((file, index) => (
                <div key={`${file.name}-${file.size}`} className="flex items-center gap-3 px-3 py-2.5">
                  {file.type === "image" ? <ImageIcon size={15} className="text-[var(--text-tertiary)]" /> : <Code size={15} className="text-[var(--text-tertiary)]" />}
                  <span className="min-w-0 flex-1 truncate text-xs">{file.name}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">{file.size}</span>
                  <button onClick={() => setFiles(files.filter((_, item) => item !== index))} aria-label={`Remove ${file.name}`} className="text-[var(--text-tertiary)] hover:text-[var(--text)]"><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]"><LockSimple size={13} /> Nothing is published without approval.</div>
          <button className="button-primary" disabled={!ready} onClick={onAnalyze}>Find story moments <ArrowRight size={14} weight="bold" /></button>
        </div>
        <button className="mx-auto block text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]" onClick={onDemo}>Or continue with the demo project</button>
      </section>
    </main>
  );
}

function AnalysisLoader({ project }: { project: string }) {
  const [step, setStep] = useState(0);
  const steps = ["Reconstructing the timeline", "Finding meaningful changes", "Checking the evidence"];

  useEffect(() => {
    const interval = setInterval(() => setStep((current) => Math.min(current + 1, 2)), 850);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-56px)] max-w-xl items-center px-5 py-16">
      <section className="w-full">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">Reading {project || "your work"}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">This usually takes a few seconds.</p>
        </div>
        <div className="space-y-4">
          {steps.map((label, index) => (
            <div key={label} className={`flex items-center gap-3 text-sm transition-opacity ${index <= step ? "opacity-100" : "opacity-35"}`}>
              <span className={`grid size-5 place-items-center rounded-full border ${index < step ? "border-[var(--text)] bg-[var(--text)] text-[var(--background)]" : "border-[var(--border-strong)]"}`}>
                {index < step ? <Check size={11} weight="bold" /> : index === step ? <span className="size-1.5 animate-pulse rounded-full bg-[var(--text)]" /> : null}
              </span>
              {label}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function SourceIcon({ kind, size = 14 }: { kind: Evidence["kind"]; size?: number }) {
  if (kind === "commit") return <GitBranch size={size} />;
  if (kind === "codex") return <Code size={size} />;
  if (kind === "screenshot") return <ImageIcon size={size} />;
  return <NotePencil size={size} />;
}

function Inbox({ analysis, onSelect, onTimeline }: { analysis: AnalysisResult; onSelect: (moment: StoryMoment) => void; onTimeline: () => void }) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-4xl">You did enough today.</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">We found three moments worth sharing.</p>
        </div>
        <button className="button-secondary self-start" onClick={onTimeline}><Clock size={14} /> Timeline</button>
      </div>

      <section className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {analysis.moments.map((moment, index) => {
          const sources = analysis.evidence.filter((item) => moment.evidenceIds.includes(item.id));
          return (
            <motion.button
              key={moment.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.22 }}
              className="group grid w-full gap-4 py-6 text-left transition-colors hover:bg-[var(--surface-subtle)] sm:grid-cols-[minmax(0,1fr)_auto] sm:px-4"
              onClick={() => onSelect(moment)}
            >
              <div>
                <p className="mb-2 text-[11px] font-medium text-[var(--text-tertiary)]">{moment.label}</p>
                <h2 className="text-xl font-semibold tracking-[-0.025em]">{moment.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{moment.summary}</p>
                <p className="mt-3 text-xs font-medium text-[var(--text)]">{moment.tension}</p>
              </div>
              <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end sm:justify-center">
                <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]"><Paperclip size={12} /> {sources.length} {sources.length === 1 ? "source" : "sources"}</span>
                <ArrowRight size={16} className="text-[var(--text-tertiary)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--text)]" />
              </div>
            </motion.button>
          );
        })}
      </section>
      <p className="mt-6 text-center text-xs text-[var(--text-tertiary)]">Choose the moment you want to tell.</p>
    </main>
  );
}

function Reflection({ moment, answers, setAnswers, onBack, onDraft }: { moment: StoryMoment; answers: [string, string]; setAnswers: (answers: [string, string]) => void; onBack: () => void; onDraft: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(answers[0] ? 1 : 0);
  const currentAnswer = answers[questionIndex];
  const canContinue = currentAnswer.trim().length >= 8;

  function updateAnswer(value: string) {
    const next: [string, string] = [...answers];
    next[questionIndex] = value;
    setAnswers(next);
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 md:py-14">
      <button className="button-ghost -ml-3 mb-8" onClick={onBack}><ArrowLeft size={14} /> Story Inbox</button>
      <section>
        <div className="mb-10 border-b border-[var(--border)] pb-6">
          <p className="text-[11px] font-medium text-[var(--text-tertiary)]">{moment.label}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] md:text-3xl">{moment.title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{moment.whyItMatters}</p>
        </div>

        <div className="mb-5 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
          <span>Question {questionIndex + 1} of 2</span>
          <span>Workprint will not invent your perspective.</span>
        </div>
        <label className="block text-xl font-medium leading-8 tracking-[-0.02em]" htmlFor="reflection-answer">
          {moment.questions[questionIndex]}
        </label>
        <textarea
          id="reflection-answer"
          autoFocus
          className="field mt-5 min-h-44 resize-y text-[15px] leading-7"
          value={currentAnswer}
          onChange={(event) => updateAnswer(event.target.value)}
          placeholder="Answer in your own words"
        />
        <div className="mt-5 flex items-center justify-between">
          {questionIndex === 1 ? <button className="button-ghost -ml-3" onClick={() => setQuestionIndex(0)}><ArrowLeft size={14} /> Previous</button> : <span />}
          {questionIndex === 0 ? (
            <button className="button-primary" disabled={!canContinue} onClick={() => setQuestionIndex(1)}>Next question <ArrowRight size={14} /></button>
          ) : (
            <button className="button-primary" disabled={!canContinue || answers[0].trim().length < 8} onClick={onDraft}>Build the story <ArrowRight size={14} /></button>
          )}
        </div>
      </section>
    </main>
  );
}

function DraftLoader({ moment }: { moment: StoryMoment }) {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-56px)] max-w-xl items-center px-5 py-16">
      <section className="w-full">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-[9px] bg-[var(--surface-subtle)]"><NotePencil size={15} /></span>
          <span className="text-sm font-medium">Writing your story</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">Finding the clearest version.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Using “{moment.title}” and your answers, then checking each factual claim.</p>
        <div className="mt-8 h-1 overflow-hidden rounded-full bg-[var(--surface-hover)]">
          <motion.div className="h-full w-1/3 bg-[var(--text)]" animate={{ x: ["-100%", "300%"] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} />
        </div>
      </section>
    </main>
  );
}

function EvidenceItem({ evidence }: { evidence: Evidence }) {
  return (
    <article className="border-b border-[var(--border)] py-4 last:border-0">
      <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
        <span className="flex items-center gap-1.5"><SourceIcon kind={evidence.kind} size={12} /> {evidence.kind}</span>
        <span>{evidence.timestamp}</span>
      </div>
      <h3 className="mt-2 text-[13px] font-medium leading-5">{evidence.title}</h3>
      <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{evidence.excerpt}</p>
      <p className="mt-2 font-mono text-[9px] text-[var(--text-tertiary)]">{evidence.reference}</p>
    </article>
  );
}

function ProofDrawer({ draft, analysis, onClose }: { draft: StoryDraft; analysis: AnalysisResult; onClose: () => void }) {
  const [activeClaim, setActiveClaim] = useState(draft.claims[0]?.id || "");
  const active = draft.claims.find((claim) => claim.id === activeClaim);
  const evidence = analysis.evidence.filter((item) => active?.evidenceIds.includes(item.id));

  return (
    <motion.div className="fixed inset-0 z-50 bg-black/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Story proof"
        className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-float)] md:p-6"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-7 flex items-center justify-between">
          <div><h2 className="text-base font-semibold">Proof</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">Evidence behind the factual claims.</p></div>
          <button className="icon-button" onClick={onClose} aria-label="Close proof"><X size={15} /></button>
        </div>
        <div className="space-y-2">
          {draft.claims.map((claim) => (
            <button key={claim.id} className={`w-full rounded-[10px] border p-3 text-left text-xs leading-5 ${activeClaim === claim.id ? "border-[var(--text)] bg-[var(--surface-subtle)]" : "border-[var(--border)] hover:bg-[var(--surface-subtle)]"}`} onClick={() => setActiveClaim(claim.id)}>
              {claim.text}
              <span className="mt-1.5 block text-[10px] text-[var(--text-tertiary)]">{claim.evidenceIds.length} {claim.evidenceIds.length === 1 ? "source" : "sources"}</span>
            </button>
          ))}
        </div>
        <div className="mt-6 border-t border-[var(--border)]">
          {evidence.map((item) => <EvidenceItem key={item.id} evidence={item} />)}
        </div>
      </motion.aside>
    </motion.div>
  );
}

function Studio({ draft, setDraft, analysis, onBack }: { draft: StoryDraft; setDraft: (draft: StoryDraft) => void; analysis: AnalysisResult; onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const [proofOpen, setProofOpen] = useState(false);
  const sourceCount = new Set(draft.claims.flatMap((claim) => claim.evidenceIds)).size;
  const wordCount = draft.body.trim().split(/\s+/).filter(Boolean).length;

  async function copyStory() {
    await navigator.clipboard.writeText(`${draft.headline}\n\n${draft.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function exportStory() {
    const proof = draft.claims.map((claim) => `- ${claim.text}\n  Evidence: ${claim.evidenceIds.join(", ")}`).join("\n");
    const blob = new Blob([`# ${draft.headline}\n\n${draft.body}\n\n## Proof\n\n${proof}\n`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${analysis.project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-story.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 md:py-10">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-3">
        <button className="button-ghost -ml-3" onClick={onBack}><ArrowLeft size={14} /> Reflection</button>
        <div className="flex items-center gap-2">
          <button className="button-secondary" onClick={() => setProofOpen(true)}><ShieldCheck size={14} /> Proof ({sourceCount})</button>
          <button className="icon-button" onClick={exportStory} aria-label="Export story"><DownloadSimple size={15} /></button>
          <button className="button-primary" onClick={() => void copyStory()}>{copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}</button>
        </div>
      </div>

      <section className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
          <span>Story Studio</span>
          <span>{wordCount} words</span>
        </div>
        <input
          aria-label="Story headline"
          className="mb-7 w-full border-0 bg-transparent text-3xl font-semibold tracking-[-0.045em] outline-none md:text-4xl"
          value={draft.headline}
          onChange={(event) => setDraft({ ...draft, headline: event.target.value })}
        />
        <textarea
          aria-label="Story body"
          className="min-h-[620px] w-full resize-none border-0 bg-transparent text-[15px] leading-8 text-[var(--text)] outline-none"
          value={draft.body}
          onChange={(event) => setDraft({ ...draft, body: event.target.value })}
        />
      </section>
      <AnimatePresence>{proofOpen && <ProofDrawer draft={draft} analysis={analysis} onClose={() => setProofOpen(false)} />}</AnimatePresence>
    </main>
  );
}

function TimelineDrawer({ analysis, onClose }: { analysis: AnalysisResult; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 bg-black/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside role="dialog" aria-modal="true" aria-label="Private timeline" className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-float)] md:p-6" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} onClick={(event) => event.stopPropagation()}>
        <div className="mb-8 flex items-start justify-between">
          <div><h2 className="text-base font-semibold">Timeline</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">{analysis.project.sourceSummary}</p></div>
          <button className="icon-button" onClick={onClose} aria-label="Close timeline"><X size={15} /></button>
        </div>
        <div className="space-y-7">
          {analysis.timeline.map((event) => {
            const sources = analysis.evidence.filter((item) => event.evidenceIds.includes(item.id));
            return (
              <article key={event.id}>
                <p className="text-[10px] text-[var(--text-tertiary)]">{event.date}</p>
                <h3 className="mt-1.5 text-sm font-medium">{event.title}</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{event.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sources.map((source) => <span key={source.id} className="flex items-center gap-1.5 rounded-[8px] bg-[var(--surface-subtle)] px-2 py-1 text-[10px] text-[var(--text-secondary)]"><SourceIcon kind={source.kind} size={11} /> {source.title}</span>)}
                </div>
              </article>
            );
          })}
        </div>
      </motion.aside>
    </motion.div>
  );
}

function ErrorNotice({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] p-4 shadow-[var(--shadow-float)]" role="alert">
      <X className="mt-0.5 shrink-0 text-[var(--danger)]" size={15} />
      <div className="flex-1"><p className="text-xs font-medium">Workprint could not finish that step.</p><p className="mt-1 text-[11px] leading-5 text-[var(--text-secondary)]">{message}</p></div>
      <button className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text)]" onClick={onClose}>Dismiss</button>
    </div>
  );
}

export function WorkprintApp() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [projectName, setProjectName] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<StoryMoment | null>(null);
  const [answers, setAnswers] = useState<[string, string]>(["", ""]);
  const [draft, setDraft] = useState<StoryDraft | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = `workprint-${useId().replace(/[^a-z0-9]/gi, "")}`;

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, [stage]);

  function reset() {
    setStage("welcome"); setProjectName(""); setSourceText(""); setFiles([]); setAnalysis(null); setSelectedMoment(null); setAnswers(["", ""]); setDraft(null); setDemoMode(false); setError(null);
  }

  async function runDemo() {
    setDemoMode(true); setProjectName("Workprint"); setSourceText(SAMPLE_SOURCE); setStage("analyzing");
    await wait(2600); setAnalysis(SAMPLE_ANALYSIS); setStage("inbox");
  }

  async function analyze() {
    setStage("analyzing"); setError(null);
    try {
      const screenshots = files.filter((file) => file.type === "image").map((file) => ({ name: file.name, dataUrl: file.content }));
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectName, sourceText, screenshots, sessionId }) });
      const result = await response.json() as AnalysisResult & { error?: string };
      if (!response.ok) throw new Error(result.error || "The analysis request failed");
      setAnalysis(result); setStage("inbox");
    } catch (caught) {
      setStage("source"); setError(caught instanceof Error ? caught.message : "Unknown analysis error");
    }
  }

  function chooseMoment(moment: StoryMoment) { setSelectedMoment(moment); setAnswers(["", ""]); setStage("reflect"); }

  async function buildDraft() {
    if (!analysis || !selectedMoment) return;
    setStage("drafting"); setError(null);
    try {
      if (demoMode) {
        await wait(2300); setDraft(createSampleDraft(selectedMoment.id, answers)); setStage("studio"); return;
      }
      const relevantEvidence = analysis.evidence.filter((item) => selectedMoment.evidenceIds.includes(item.id));
      const response = await fetch("/api/draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ moment: selectedMoment, evidence: relevantEvidence, answers, sessionId }) });
      const result = await response.json() as StoryDraft & { error?: string };
      if (!response.ok) throw new Error(result.error || "The drafting request failed");
      setDraft(result); setStage("studio");
    } catch (caught) {
      setStage("reflect"); setError(caught instanceof Error ? caught.message : "Unknown drafting error");
    }
  }

  return (
    <div className="app-shell">
      <Header stage={stage} project={analysis?.project.name || projectName} onReset={reset} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}>
          {stage === "welcome" && <Welcome onDemo={() => void runDemo()} onStart={() => setStage("source")} />}
          {stage === "source" && <SourceSetup projectName={projectName} setProjectName={setProjectName} sourceText={sourceText} setSourceText={setSourceText} files={files} setFiles={setFiles} onAnalyze={() => void analyze()} onDemo={() => void runDemo()} />}
          {stage === "analyzing" && <AnalysisLoader project={projectName} />}
          {stage === "inbox" && analysis && <Inbox analysis={analysis} onSelect={chooseMoment} onTimeline={() => setTimelineOpen(true)} />}
          {stage === "reflect" && selectedMoment && <Reflection moment={selectedMoment} answers={answers} setAnswers={setAnswers} onBack={() => setStage("inbox")} onDraft={() => void buildDraft()} />}
          {stage === "drafting" && selectedMoment && <DraftLoader moment={selectedMoment} />}
          {stage === "studio" && draft && analysis && <Studio draft={draft} setDraft={setDraft} analysis={analysis} onBack={() => setStage("reflect")} />}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>{timelineOpen && analysis && <TimelineDrawer analysis={analysis} onClose={() => setTimelineOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{error && <ErrorNotice message={error} onClose={() => setError(null)} />}</AnimatePresence>
    </div>
  );
}

function wait(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function readFile(file: File, dataUrl: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    if (dataUrl) reader.readAsDataURL(file); else reader.readAsText(file);
  });
}
