"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  GitBranch,
  GithubLogo,
  LinkedinLogo,
  NotePencil,
  OpenAiLogo,
  X,
  XLogo,
} from "@phosphor-icons/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { SAMPLE_ANALYSIS } from "@/lib/sample-data";

type Screen = "setup" | "projects" | "catching-up" | "inbox" | "post";
type Platform = "x" | "linkedin";
type Provider = "openrouter" | "google";

interface Claim {
  id: string;
  text: string;
  evidenceIds: string[];
}

interface Moment {
  id: string;
  title: string;
  summary: string;
  recommended: Platform;
  question: string;
  drafts: Record<Platform, string>;
  alternateOpenings: Record<Platform, string>;
  claims: Claim[];
}

interface RevisionMessage {
  role: "You" | "Workprint";
  text: string;
}

interface Project {
  id: string;
  name: string;
  repo: string;
  description: string;
  activity: string;
  branch: string;
}

const PROJECTS: Project[] = [
  { id: "friday", name: "Friday", repo: "orcus108/friday", description: "Local macOS assistant that can see, listen, and act.", activity: "Updated 34 minutes ago", branch: "main" },
  { id: "workprint", name: "Workprint", repo: "orcus108/openai-buildweek-hyd-workprint", description: "A story inbox for builders.", activity: "Updated just now", branch: "main" },
  { id: "sakhi", name: "Sakhi", repo: "orcus108/sakhi", description: "AI companion for India's ASHA health workers.", activity: "Updated 12 June", branch: "main" },
];

const MOMENTS: Moment[] = [
  {
    id: "moment-pivot",
    title: "The story inbox replaced the blank composer.",
    summary: "A commit, a Codex session, and a product note all point to the same change.",
    recommended: "x",
    question: "What made you decide to remove the prompt box?",
    drafts: {
      x: "spent most of today deleting a text box lol.\n\nworkprint used to ask what you wanted to post about. pretty ridiculous for a product that is supposed to notice the interesting stuff for you.\n\nnow it opens with 3 moments from my commits + codex sessions.",
      linkedin: "Spent most of today deleting a text box.\n\nWorkprint used to open with a blank prompt: ‘What do you want to post about?’\n\nIt took me an embarrassingly long time to notice how backwards that was. If you already know what is worth sharing, half the job is done.\n\nSo I changed the flow. Workprint now reads commits and Codex sessions, pulls out a few moments that might be worth talking about, and lets you pick one.\n\nStill rough, but this is the first version that feels like the product I had in my head.",
    },
    alternateOpenings: {
      x: "turns out the prompt box was the problem.",
      linkedin: "The most important thing I removed from Workprint this week was its starting point.",
    },
    claims: [
      { id: "claim-pivot", text: "The story inbox replaced the blank composer.", evidenceIds: ["ev-commit-inbox", "ev-codex-pivot"] },
      { id: "claim-proof", text: "Generated claims can be traced back to their source.", evidenceIds: ["ev-commit-proof"] },
      { id: "claim-boundary", text: "Workprint asks instead of inventing the builder’s perspective.", evidenceIds: ["ev-codex-trust"] },
    ],
  },
  {
    id: "moment-proof",
    title: "Evidence now survives every rewrite.",
    summary: "Generated claims can be traced back to the work that produced them.",
    recommended: "linkedin",
    question: "Was there a particular bad draft that made you add evidence?",
    drafts: {
      x: "added a tiny ‘why is this true?’ button to workprint today.\n\nclick it and you get the commit/session behind each claim in the draft.\n\nmostly built this because ai writing tools are way too good at making made-up details sound completely normal.",
      linkedin: "Added a small evidence view to Workprint today.\n\nYou can click any factual claim in a draft and see the commit, Codex session, or note behind it.\n\nI mostly built this after seeing a draft confidently include a detail that sounded right but was not actually in the work. That is a dangerous failure mode for a product that is meant to save you time.\n\nNow, if Workprint can see what changed but cannot know why it mattered, it asks instead of guessing.\n\nIt is a small part of the UI, but it makes me much more comfortable using the output.",
    },
    alternateOpenings: {
      x: "ai drafts are nicer when you can check where the facts came from.",
      linkedin: "The feature that made me trust Workprint was not the writing. It was the receipts.",
    },
    claims: [
      { id: "claim-evidence", text: "Every factual claim keeps its evidence.", evidenceIds: ["ev-commit-proof", "ev-codex-trust"] },
      { id: "claim-artifacts", text: "Evidence can come from commits, sessions, screenshots, or notes.", evidenceIds: ["ev-commit-inbox", "ev-note-emotion"] },
    ],
  },
  {
    id: "moment-craft",
    title: "The onboarding lost three screens.",
    summary: "GitHub and Codex are detected once. After that, Workprint stays out of the way.",
    recommended: "x",
    question: "What finally convinced you to delete the project setup?",
    drafts: {
      x: "deleted basically all of workprint’s onboarding today.\n\nbefore: create a project, describe it, connect sources, start logging updates.\n\nnow: it finds github + codex, you click connect, and it starts catching up.\n\nwild how much product design is just admitting the user should not have to do your setup work.",
      linkedin: "I deleted most of Workprint’s onboarding today.\n\nThe old version asked you to create a project, describe what you were building, connect your tools, and start logging progress.\n\nEvery step seemed reasonable while I was building it. Together, they made Workprint feel like another project management tool you had to maintain.\n\nNow it finds GitHub and Codex on the device, you confirm once, and it starts catching up. The next screen already has a few things worth posting.\n\nMuch less impressive as an onboarding flow. Much better as a product.",
    },
    alternateOpenings: {
      x: "today’s progress: deleted most of the onboarding.",
      linkedin: "The best onboarding change I made was removing most of the onboarding.",
    },
    claims: [
      { id: "claim-setup", text: "The onboarding no longer needs project setup or manual logs.", evidenceIds: ["ev-commit-inbox", "ev-codex-pivot"] },
      { id: "claim-fallback", text: "The complete demo can run without an API key.", evidenceIds: ["ev-commit-fallback"] },
    ],
  },
];

function WorkprintMark() {
  return (
    <span className="wp-mark" aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

function Header({ onHome, onProfile }: { onHome: () => void; onProfile: () => void }) {
  return (
    <header className="wp-header">
      <button className="wp-brand" type="button" onClick={onHome} aria-label="Open Workprint home">
        <WorkprintMark />
        <span>workprint</span>
      </button>
      <button className="wp-profile" type="button" onClick={onProfile} aria-label="Open profile and settings" title="Profile and settings">V</button>
    </header>
  );
}

function Setup({ selected, onToggle, onContinue }: { selected: Record<string, boolean>; onToggle: (source: string) => void; onContinue: () => void }) {
  return (
    <main className="wp-screen wp-setup">
      <section className="wp-setup-copy">
        <span className="wp-signal-rule" aria-hidden="true" />
        <h1>Your next post is already in your work.</h1>
        <p>Workprint finds it for you.</p>
      </section>

      <section className="wp-source-picker" aria-label="Work sources found">
        <div className="wp-source-intro">
          <strong>Ready to connect</strong>
          <span>Both were found on this device.</span>
        </div>
        <button className="wp-source-row" type="button" aria-pressed={selected.github} onClick={() => onToggle("github")}>
          <span className="wp-source-icon"><GithubLogo size={20} weight="fill" /></span>
          <span><strong>GitHub</strong><small>Commits and pull requests</small></span>
          <Check size={17} weight="bold" className="wp-check" />
        </button>
        <button className="wp-source-row" type="button" aria-pressed={selected.codex} onClick={() => onToggle("codex")}>
          <span className="wp-source-icon"><OpenAiLogo size={20} /></span>
          <span><strong>Codex</strong><small>Sessions and decisions</small></span>
          <Check size={17} weight="bold" className="wp-check" />
        </button>
        <button className="wp-primary wp-connect" type="button" onClick={onContinue} disabled={!selected.github && !selected.codex}>
          Connect and continue <ArrowRight size={15} weight="bold" />
        </button>
        <button className="wp-text-button" type="button">Use something else</button>
      </section>
    </main>
  );
}

function ProjectPicker({ onSelect }: { onSelect: (project: Project) => void }) {
  return (
    <main className="wp-screen wp-projects">
      <section className="wp-project-heading">
        <span className="wp-github-connected"><GithubLogo size={16} weight="fill" /> GitHub connected</span>
        <h1>What are you working on?</h1>
        <p>Found three recent repositories.</p>
      </section>
      <section className="wp-project-list" aria-label="Recent GitHub repositories">
        {PROJECTS.map((project) => (
          <button type="button" className="wp-project-row" key={project.id} onClick={() => onSelect(project)}>
            <span className="wp-repo-icon"><GithubLogo size={21} weight="fill" /></span>
            <span className="wp-project-copy">
              <span><strong>{project.name}</strong><small>{project.repo}</small></span>
              <p>{project.description}</p>
              <span className="wp-project-meta"><span><GitBranch size={13} /> {project.branch}</span><span>{project.activity}</span></span>
            </span>
            <ArrowRight size={17} weight="bold" />
          </button>
        ))}
      </section>
    </main>
  );
}

function CatchingUp({ project }: { project: Project | null }) {
  return (
    <main className="wp-screen wp-catching">
      <section>
        <span className="wp-scan" aria-hidden="true"><i /><i /><i /></span>
        <h1>Got it. I’m catching up.</h1>
        <p>Looking through {project?.name || "today’s work"}.</p>
      </section>
    </main>
  );
}

function Inbox({ onOpen }: { onOpen: (moment: Moment) => void }) {
  return (
    <main className="wp-screen wp-inbox">
      <div className="wp-inbox-heading">
        <span className="wp-signal-rule" aria-hidden="true" />
        <h1>Things worth sharing.</h1>
      </div>
      <section className="wp-moment-grid" aria-label="Drafts ready today">
        {MOMENTS.map((moment, index) => (
          <button className="wp-moment" type="button" key={moment.id} onClick={() => onOpen(moment)}>
            <span className="wp-moment-index" aria-hidden="true">0{index + 1}</span>
            <span className="wp-moment-copy">
              <strong>{moment.title}</strong>
              <small>{moment.summary}</small>
            </span>
            <span className="wp-open-draft">Open draft <ArrowRight size={14} weight="bold" /></span>
          </button>
        ))}
      </section>
    </main>
  );
}

function PlatformIcon({ platform, size = 16 }: { platform: Platform; size?: number }) {
  return platform === "x" ? <XLogo size={size} /> : <LinkedinLogo size={size} weight="fill" />;
}

function PostScreen({
  moment,
  platform,
  draft,
  editorVersion,
  answer,
  answerStatus,
  messages,
  isRewriting,
  onBack,
  onPlatform,
  onDraftInput,
  onPost,
  onProof,
  onAnswer,
  onUseAnswer,
  onShorten,
  onAngle,
  onRevision,
}: {
  moment: Moment;
  platform: Platform;
  draft: string;
  editorVersion: number;
  answer: string;
  answerStatus: string;
  messages: RevisionMessage[];
  isRewriting: boolean;
  onBack: () => void;
  onPlatform: (platform: Platform) => void;
  onDraftInput: (value: string) => void;
  onPost: () => void;
  onProof: () => void;
  onAnswer: (value: string) => void;
  onUseAnswer: () => void;
  onShorten: () => void;
  onAngle: () => void;
  onRevision: (prompt: string) => void;
}) {
  const [revisionInput, setRevisionInput] = useState("");
  const sourceCount = useMemo(() => new Set(moment.claims.flatMap((claim) => claim.evidenceIds)).size, [moment]);
  const metric = platform === "x" ? `${draft.length} / 280 characters` : `${draft.trim().split(/\s+/).length} words`;

  function submitRevision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!revisionInput.trim()) return;
    onRevision(revisionInput.trim());
    setRevisionInput("");
  }

  return (
    <main className="wp-screen wp-post-screen">
      <div className="wp-post-toolbar">
        <button className="wp-back" type="button" onClick={onBack}><ArrowLeft size={14} /> Things worth sharing</button>
        <button className="wp-primary" type="button" onClick={onPost}><PlatformIcon platform={platform} /> Post on {platform === "x" ? "X" : "LinkedIn"}</button>
      </div>

      <article className="wp-post-editor">
        <div className="wp-platform-bar" aria-label="Choose social platform">
          <span>Recommended for {moment.recommended === "x" ? "X" : "LinkedIn"}</span>
          <div className="wp-platform-switch">
            <button className={platform === "x" ? "is-active" : ""} type="button" aria-label="X (formerly Twitter)" aria-pressed={platform === "x"} onClick={() => onPlatform("x")}><XLogo size={17} /></button>
            <button className={platform === "linkedin" ? "is-active" : ""} type="button" aria-label="LinkedIn" aria-pressed={platform === "linkedin"} onClick={() => onPlatform("linkedin")}><LinkedinLogo size={17} weight="fill" /></button>
          </div>
          <span className={platform === "x" && draft.length > 280 ? "is-over" : ""}>{metric}</span>
        </div>

        <section className="wp-draft-paper">
          <div className="wp-draft-meta"><span>Draft</span><button type="button" onClick={onProof}>{sourceCount} sources</button></div>
          <div
            key={editorVersion}
            className="wp-post-content"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-label="Edit the post"
            aria-multiline="true"
            spellCheck
            onInput={(event) => onDraftInput(event.currentTarget.innerText.replace(/\n{3,}/g, "\n\n"))}
          >{draft}</div>
        </section>

        <section className="wp-personalize" aria-labelledby="personalize-title">
          <div className="wp-personalize-heading">
            <div><strong id="personalize-title">Make it yours</strong><span>· Optional</span></div>
            <p>{moment.question}</p>
          </div>
          <div className="wp-personalize-form">
            <label className="wp-sr-only" htmlFor="personal-answer">Answer the optional personalization question</label>
            <input id="personal-answer" value={answer} onChange={(event) => onAnswer(event.target.value)} placeholder="A sentence is enough" />
            <button className="wp-secondary" type="button" onClick={onUseAnswer}>Use it</button>
          </div>
          {answerStatus && <p className="wp-answer-status" aria-live="polite">{answerStatus}</p>}

          <div className="wp-edit-tools">
            <button type="button" onClick={onShorten}>Shorten</button><span>·</span>
            <button type="button" onClick={onAngle}>Try another angle</button><span>·</span>
            <details>
              <summary>Ask Workprint…</summary>
              <div className="wp-revision-inner">
                <div className="wp-revision-shortcuts">
                  <button type="button" disabled={isRewriting} onClick={() => onRevision("Make it more casual")}>More casual</button>
                  <button type="button" disabled={isRewriting} onClick={() => onRevision("Add the technical detail")}>More technical</button>
                </div>
                {messages.length > 0 && <div className="wp-revision-thread">{messages.map((message, index) => <div className={message.role === "You" ? "is-user" : "is-workprint"} key={`${message.role}-${index}`}><span>{message.role}</span><p>{message.text}</p></div>)}</div>}
                <form className="wp-revision-form" onSubmit={submitRevision}>
                  <label htmlFor="revision-input">Tell Workprint what to change</label>
                  <div><input id="revision-input" value={revisionInput} disabled={isRewriting} onChange={(event) => setRevisionInput(event.target.value)} placeholder="Mention that I almost shipped the old flow" /><button className="wp-primary" type="submit" disabled={isRewriting}>{isRewriting ? "Rewriting…" : "Rewrite"}</button></div>
                </form>
              </div>
            </details>
          </div>
        </section>
      </article>
    </main>
  );
}

function ProofDrawer({ moment, onClose }: { moment: Moment; onClose: () => void }) {
  const [activeClaim, setActiveClaim] = useState(moment.claims[0]?.id ?? "");
  const claim = moment.claims.find((item) => item.id === activeClaim) ?? moment.claims[0];
  const evidence = SAMPLE_ANALYSIS.evidence.filter((item) => claim?.evidenceIds.includes(item.id));

  return (
    <div className="wp-drawer-layer" role="presentation">
      <button className="wp-drawer-backdrop" type="button" onClick={onClose} aria-label="Close proof" />
      <aside className="wp-drawer" role="dialog" aria-modal="true" aria-labelledby="proof-title">
        <header><div><h2 id="proof-title">Why this is true</h2><p>The work behind the factual claims.</p></div><button className="wp-close" type="button" onClick={onClose} aria-label="Close proof"><X size={18} /></button></header>
        <div className="wp-claim-list">{moment.claims.map((item) => <button className={item.id === activeClaim ? "is-active" : ""} type="button" key={item.id} onClick={() => setActiveClaim(item.id)}><strong>{item.text}</strong><span>{item.evidenceIds.length} sources</span></button>)}</div>
        <div className="wp-evidence-list">{evidence.map((item) => <article key={item.id}><div><span>{item.kind === "commit" ? <GithubLogo size={13} weight="fill" /> : item.kind === "codex" ? <OpenAiLogo size={13} /> : <NotePencil size={13} />} {item.kind === "commit" ? "Git commit" : item.kind === "codex" ? "Codex session" : "Product note"}</span><span>{item.timestamp}</span></div><h3>{item.title}</h3><p>{item.excerpt}</p></article>)}</div>
      </aside>
    </div>
  );
}

function SettingsDrawer({ provider, apiKey, onProvider, onKey, onClose }: { provider: Provider; apiKey: string; onProvider: (provider: Provider) => void; onKey: (key: string) => void; onClose: () => void }) {
  return (
    <div className="wp-drawer-layer" role="presentation">
      <button className="wp-drawer-backdrop" type="button" onClick={onClose} aria-label="Close settings" />
      <aside className="wp-drawer" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header><div><h2 id="settings-title">What Workprint watches</h2><p>Connect it once. Change it whenever you need.</p></div><button className="wp-close" type="button" onClick={onClose} aria-label="Close settings"><X size={18} /></button></header>
        <div className="wp-connection-list"><div><span className="wp-source-icon"><GithubLogo size={20} weight="fill" /></span><span><strong>GitHub</strong><small>Connected</small></span><Check size={16} className="wp-check" weight="bold" /></div><div><span className="wp-source-icon"><OpenAiLogo size={20} /></span><span><strong>Codex</strong><small>Connected</small></span><Check size={16} className="wp-check" weight="bold" /></div></div>
        <section className="wp-ai-settings"><strong>AI for this demo</strong><p>Use either provider. The key stays in this browser.</p><div className="wp-provider-switch"><button className={provider === "openrouter" ? "is-active" : ""} type="button" onClick={() => onProvider("openrouter")}>OpenRouter</button><button className={provider === "google" ? "is-active" : ""} type="button" onClick={() => onProvider("google")}>Google AI Studio</button></div><label><span>{provider === "openrouter" ? "OpenRouter" : "Google AI Studio"} API key</span><input type="password" value={apiKey} onChange={(event) => onKey(event.target.value)} placeholder="Paste a demo key" /></label></section>
        <button className="wp-primary wp-done" type="button" onClick={onClose}>Done</button>
      </aside>
    </div>
  );
}

export function WorkprintApp() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [connected, setConnected] = useState(false);
  const [sources, setSources] = useState({ github: true, codex: true });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [platform, setPlatform] = useState<Platform>("x");
  const [draft, setDraft] = useState("");
  const [editorVersion, setEditorVersion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answerStatus, setAnswerStatus] = useState("");
  const [messages, setMessages] = useState<RevisionMessage[]>([]);
  const [isRewriting, setIsRewriting] = useState(false);
  const [proofOpen, setProofOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [provider, setProvider] = useState<Provider>("openrouter");
  const [apiKey, setApiKey] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedProvider = window.localStorage.getItem("workprint-ai-provider");
      const initialProvider: Provider = savedProvider === "google" ? "google" : "openrouter";
      setProvider(initialProvider);
      setApiKey(window.localStorage.getItem(`workprint-${initialProvider}-key`) ?? "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function replaceDraft(value: string) {
    setDraft(value.replace(/\n{3,}/g, "\n\n"));
    setEditorVersion((version) => version + 1);
  }

  function goHome() {
    setScreen(connected ? selectedProject ? "inbox" : "projects" : "setup");
  }

  function connect() {
    setConnected(true);
    setScreen("projects");
  }

  function selectProject(project: Project) {
    setSelectedProject(project);
    setScreen("catching-up");
    window.setTimeout(() => setScreen("inbox"), 1250);
  }

  function openMoment(moment: Moment) {
    setSelectedMoment(moment);
    setPlatform(moment.recommended);
    setAnswer("");
    setAnswerStatus("");
    setMessages([]);
    replaceDraft(moment.drafts[moment.recommended]);
    setScreen("post");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function switchPlatform(nextPlatform: Platform) {
    if (!selectedMoment) return;
    setPlatform(nextPlatform);
    setAnswerStatus("");
    replaceDraft(selectedMoment.drafts[nextPlatform]);
  }

  function useAnswer() {
    if (!selectedMoment || !answer.trim()) return;
    const paragraphs = selectedMoment.drafts[platform].split(/\n\n+/);
    const next = platform === "x"
      ? [paragraphs[0], answer.trim(), paragraphs.at(-1) ?? ""].join("\n\n")
      : [...paragraphs.slice(0, -1), `What made the decision clear was this: ${answer.trim()}`, paragraphs.at(-1) ?? ""].join("\n\n");
    replaceDraft(next);
    setAnswerStatus("Worked it into the draft.");
  }

  function shorten() {
    const paragraphs = draft.split(/\n\n+/).filter(Boolean);
    if (paragraphs.length <= 2) return;
    replaceDraft([paragraphs[0], paragraphs.at(-1) ?? ""].join("\n\n"));
    showToast("Shortened.");
  }

  function anotherAngle() {
    if (!selectedMoment) return;
    const paragraphs = draft.split(/\n\n+/).filter(Boolean);
    paragraphs[0] = selectedMoment.alternateOpenings[platform];
    replaceDraft(paragraphs.join("\n\n"));
    showToast("Tried another angle.");
  }

  async function revise(prompt: string) {
    if (isRewriting) return;
    setMessages((current) => [...current, { role: "You", text: prompt }]);
    setIsRewriting(true);
    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey: apiKey || undefined, draft, instruction: prompt, platform }),
      });
      const result = await response.json() as { draft?: string; error?: string };
      if (!response.ok || !result.draft) throw new Error(result.error || "Workprint could not rewrite that draft.");
      replaceDraft(result.draft);
      setMessages((current) => [...current, { role: "Workprint", text: "Done. I kept the facts and worked that into the draft." }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Workprint could not reach the model.";
      setMessages((current) => [...current, { role: "Workprint", text: message }]);
      if (message.toLowerCase().includes("key")) setSettingsOpen(true);
    } finally {
      setIsRewriting(false);
    }
  }

  async function postDraft() {
    const destination = platform === "x" ? `https://x.com/intent/post?text=${encodeURIComponent(draft)}` : "https://www.linkedin.com/feed/?shareActive=true";
    window.open(destination, "_blank", "noopener,noreferrer");
    try {
      await navigator.clipboard.writeText(draft);
      showToast(platform === "x" ? "Copied and opened in X." : "Copied. LinkedIn is ready.");
    } catch {
      showToast(`Opened ${platform === "x" ? "X" : "LinkedIn"}.`);
    }
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function updateProvider(nextProvider: Provider) {
    setProvider(nextProvider);
    window.localStorage.setItem("workprint-ai-provider", nextProvider);
    setApiKey(window.localStorage.getItem(`workprint-${nextProvider}-key`) ?? "");
  }

  function updateKey(value: string) {
    setApiKey(value);
    window.localStorage.setItem(`workprint-${provider}-key`, value);
  }

  return (
    <div className="wp-app">
      <Header onHome={goHome} onProfile={() => setSettingsOpen(true)} />
      {screen === "setup" && <Setup selected={sources} onToggle={(source) => setSources((current) => ({ ...current, [source]: !current[source as keyof typeof current] }))} onContinue={connect} />}
      {screen === "projects" && <ProjectPicker onSelect={selectProject} />}
      {screen === "catching-up" && <CatchingUp project={selectedProject} />}
      {screen === "inbox" && <Inbox onOpen={openMoment} />}
      {screen === "post" && selectedMoment && <PostScreen moment={selectedMoment} platform={platform} draft={draft} editorVersion={editorVersion} answer={answer} answerStatus={answerStatus} messages={messages} isRewriting={isRewriting} onBack={() => setScreen("inbox")} onPlatform={switchPlatform} onDraftInput={setDraft} onPost={() => void postDraft()} onProof={() => setProofOpen(true)} onAnswer={setAnswer} onUseAnswer={useAnswer} onShorten={shorten} onAngle={anotherAngle} onRevision={(prompt) => void revise(prompt)} />}
      {proofOpen && selectedMoment && <ProofDrawer moment={selectedMoment} onClose={() => setProofOpen(false)} />}
      {settingsOpen && <SettingsDrawer provider={provider} apiKey={apiKey} onProvider={updateProvider} onKey={updateKey} onClose={() => setSettingsOpen(false)} />}
      {toast && <div className="wp-toast" role="status">{toast}</div>}
    </div>
  );
}
