const screens = [...document.querySelectorAll("[data-screen]")];
const toast = document.querySelector("#toast");
const postContent = document.querySelector("#post-content");
const postTitle = document.querySelector("#post-title");
const postBody = document.querySelector("#post-body");
const revisionThread = document.querySelector("#revision-thread");
const drawerLayers = [...document.querySelectorAll(".drawer-layer")];
const platformFit = document.querySelector("#platform-fit");
const copyButton = document.querySelector("#copy-button");
const recommendationCopy = document.querySelector("#recommendation-copy");
const personalizeQuestion = document.querySelector("#personalize-question");
const personalizeInput = document.querySelector("#personalize-input");
const personalizeStatus = document.querySelector("#personalize-status");

const posts = {
  prompt: {
    question: "What made you decide to remove the prompt box?",
    twitter: {
      title: "spent most of today deleting a text box lol.",
      body: [
        "workprint used to ask what you wanted to post about. pretty ridiculous for a product that is supposed to notice the interesting stuff for you.",
        "now it opens with 3 moments from my commits + codex sessions.",
      ],
    },
    linkedin: {
      title: "Spent most of today deleting a text box.",
      body: [
        "Workprint used to open with a blank prompt: “What do you want to post about?”",
        "It took me an embarrassingly long time to notice how backwards that was. If you already know what is worth sharing, half the job is done.",
        "So I changed the flow. Workprint now reads commits and Codex sessions, pulls out a few moments that might be worth talking about, and lets you pick one.",
        "Still rough, but this is the first version that feels like the product I had in my head.",
      ],
    },
  },
  boundary: {
    question: "Was there a particular bad draft that made you add evidence?",
    twitter: {
      title: "added a tiny “why is this true?” button to workprint today.",
      body: [
        "click it and you get the commit/session behind each claim in the draft.",
        "mostly built this because ai writing tools are way too good at making made-up details sound completely normal.",
      ],
    },
    linkedin: {
      title: "Added a small evidence view to Workprint today.",
      body: [
        "You can click any factual claim in a draft and see the commit, Codex session, or note behind it.",
        "I mostly built this after seeing a draft confidently include a detail that sounded right but was not actually in the work. That is a pretty dangerous failure mode for a product that is meant to save you time.",
        "Now, if Workprint can see what changed but cannot know why it mattered, it asks instead of guessing.",
        "It is a small part of the UI, but it makes me much more comfortable using the output.",
      ],
    },
  },
  complexity: {
    question: "What finally convinced you to delete the project setup?",
    twitter: {
      title: "deleted basically all of workprint’s onboarding today.",
      body: [
        "before: create a project, describe it, connect sources, start logging updates.",
        "now: it finds github + codex, you click connect, and it starts catching up.",
        "wild how much product design is just admitting the user should not have to do your setup work.",
      ],
    },
    linkedin: {
      title: "I deleted most of Workprint’s onboarding today.",
      body: [
        "The old version asked you to create a project, describe what you were building, connect your tools, and start logging progress.",
        "Every step seemed reasonable while I was building it. Together, they made Workprint feel like another project management tool you had to maintain.",
        "Now it finds GitHub and Codex on the device, you confirm once, and it starts catching up. The next screen already has a few things worth posting.",
        "Much less impressive as an onboarding flow. Much better as a product.",
      ],
    },
  },
};

let activePost = "prompt";
let activePlatform = "twitter";
let recommendedPlatform = "twitter";
let toastTimer;
const personalizationAnswers = {};

function showScreen(name) {
  screens.forEach((screen) => {
    const active = screen.dataset.screen === name;
    screen.hidden = !active;
    screen.classList.toggle("is-entering", active);
  });

  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderPost(key, platform = "twitter") {
  activePost = key;
  activePlatform = platform;
  recommendedPlatform = platform;
  personalizeQuestion.textContent = posts[key].question;
  personalizeInput.value = personalizationAnswers[key] || "";
  personalizeStatus.hidden = true;
  document.querySelector(".revision-disclosure").open = false;
  renderRevisionThread();
  renderPlatformDraft();
  showScreen("post");
}

function renderRevisionThread() {
  revisionThread.innerHTML = "";
  revisionThread.hidden = true;
}

function escapeHTML(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]);
}

function renderPlatformDraft() {
  const draft = posts[activePost][activePlatform];
  const paragraphs = [...draft.body];
  const personalAnswer = personalizationAnswers[activePost];
  if (personalAnswer) {
    if (activePlatform === "twitter") {
      paragraphs.splice(0, paragraphs.length, personalAnswer, draft.body.at(-1));
    } else {
      paragraphs.splice(
        Math.max(1, paragraphs.length - 1),
        0,
        `What made the decision clear was this: ${personalAnswer}`,
      );
    }
  }
  postTitle.textContent = draft.title;
  postBody.innerHTML = paragraphs.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("");
  document.querySelectorAll(".platform-button").forEach((button) => {
    const active = button.dataset.platform === activePlatform;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  recommendationCopy.textContent = recommendedPlatform === "twitter"
    ? "Recommended for X"
    : "Recommended for LinkedIn";

  updatePlatformMeta();
}

function updatePlatformMeta() {
  const text = getDraftText();
  if (activePlatform === "twitter") {
    platformFit.textContent = `${text.length} / 280 characters`;
    platformFit.classList.toggle("is-over", text.length > 280);
    copyButton.innerHTML = '<img class="button-logo button-logo-invert" src="https://cdn.simpleicons.org/x/ffffff" alt="" />Post on X';
  } else {
    platformFit.textContent = `${text.trim().split(/\s+/).length} words`;
    platformFit.classList.remove("is-over");
    copyButton.innerHTML = '<img class="button-logo button-logo-adaptive" src="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/svgs/brands/linkedin.svg" alt="" />Post on LinkedIn';
  }
}

postContent.addEventListener("input", updatePlatformMeta);

document.querySelector("#personalize-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const answer = personalizeInput.value.trim();
  if (!answer) {
    personalizeInput.focus();
    return;
  }
  personalizationAnswers[activePost] = answer;
  renderPlatformDraft();
  personalizeStatus.textContent = "Worked it into the draft.";
  personalizeStatus.hidden = false;
});

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 1800);
}

document.querySelectorAll(".source-row").forEach((row) => {
  row.addEventListener("click", () => {
    const selected = row.getAttribute("aria-pressed") === "true";
    row.setAttribute("aria-pressed", String(!selected));
  });
});

document.querySelector("#connect-button").addEventListener("click", () => {
  const selected = document.querySelectorAll('.source-row[aria-pressed="true"]').length;
  if (!selected) {
    showToast("Choose at least one place to watch.");
    return;
  }
  localStorage.setItem("workprint-connected", "true");
  showScreen("catchup");
  setTimeout(() => showScreen("today"), 1300);
});

document.querySelector("#other-source-button").addEventListener("click", () => {
  showToast("That path stays available, but it won’t interrupt the main flow.");
});

document.querySelectorAll(".moment-row").forEach((row) => {
  row.addEventListener("click", () => renderPost(row.dataset.moment, row.dataset.platform));
});

document.querySelectorAll(".platform-button").forEach((button) => {
  button.addEventListener("click", () => {
    activePlatform = button.dataset.platform;
    renderPlatformDraft();
  });
});

document.querySelector("#back-button").addEventListener("click", () => showScreen("today"));
document.querySelector("#brand-button").addEventListener("click", () => {
  showScreen(localStorage.getItem("workprint-connected") ? "today" : "setup");
});

document.querySelector("#profile-button").addEventListener("click", () => {
  openDrawer("settings-layer");
});

function getDraftText() {
  return postContent.innerText.trim().replace(/\n{3,}/g, "\n\n");
}

document.querySelector("#copy-button").addEventListener("click", async () => {
  const text = getDraftText();
  const destination = activePlatform === "twitter"
    ? `https://x.com/intent/post?text=${encodeURIComponent(text)}`
    : "https://www.linkedin.com/feed/?shareActive=true";

  window.open(destination, "_blank", "noopener,noreferrer");
  try {
    await navigator.clipboard.writeText(text);
    showToast(activePlatform === "twitter" ? "Copied and opened in X." : "Copied. LinkedIn is ready.");
  } catch {
    showToast(`Opened ${activePlatform === "twitter" ? "X" : "LinkedIn"}. Copy the draft if needed.`);
  }
});

document.querySelector("#shorter-button").addEventListener("click", () => {
  const draft = posts[activePost][activePlatform];
  const shorter = draft.body.filter((_, index) => index !== 1).slice(0, 2);
  postBody.innerHTML = shorter.map((paragraph) => `<p>${paragraph}</p>`).join("");
  showToast("Shortened.");
});

document.querySelector("#angle-button").addEventListener("click", () => {
  const alternatives = {
    twitter: {
      prompt: "turns out the prompt box was the problem.",
      boundary: "ai drafts are nicer when you can check where the facts came from.",
      complexity: "today’s progress: deleted most of the onboarding.",
    },
    linkedin: {
      prompt: "The prompt box was making Workprint harder to use.",
      boundary: "I wanted a way to check where Workprint got each detail.",
      complexity: "Most of Workprint’s onboarding is gone now.",
    },
  };
  postTitle.textContent = alternatives[activePlatform][activePost];
  showToast("Here’s a different angle.");
});

document.querySelector("#proof-button").addEventListener("click", () => {
  renderEvidence("direction");
  openDrawer("proof-layer");
});

function addRevisionMessage(role, message) {
  revisionThread.hidden = false;
  const item = document.createElement("div");
  item.className = `revision-message ${role === "You" ? "is-user" : "is-workprint"}`;
  const label = document.createElement("span");
  label.textContent = role;
  const copy = document.createElement("p");
  copy.textContent = message;
  item.append(label, copy);
  revisionThread.append(item);
}

function applyRevision(instruction) {
  const normalized = instruction.toLowerCase();
  if (normalized.includes("short")) {
    const paragraphs = [...postBody.querySelectorAll("p")];
    if (paragraphs.length > 1) paragraphs[paragraphs.length - 1].remove();
    return "Done. I cut the last beat and kept the useful detail.";
  }

  if (normalized.includes("technical") || normalized.includes("commit")) {
    const detail = document.createElement("p");
    detail.textContent = "the change is in feat(inbox): replace composer with ranked story moments.";
    postBody.append(detail);
    return "Added the actual commit so it feels grounded, not promotional.";
  }

  if (normalized.startsWith("add ") || normalized.startsWith("mention ")) {
    const detail = instruction.replace(/^(add|mention)\s+(that\s+)?/i, "");
    const paragraph = document.createElement("p");
    paragraph.textContent = detail;
    postBody.append(paragraph);
    return "Added it in your words. You can edit the line directly if you want.";
  }

  postTitle.textContent = postTitle.textContent
    .replace(/^Spent/, "spent")
    .replace(/\.$/, "");
  return "Made the opening less polished and left the product detail alone.";
}

function runRevision(instruction) {
  if (!instruction) {
    showToast("Tell Workprint what to change.");
    return false;
  }
  addRevisionMessage("You", instruction);
  const reply = applyRevision(instruction);
  updatePlatformMeta();
  setTimeout(() => addRevisionMessage("Workprint", reply), 260);
  return true;
}

document.querySelector("#revision-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#revision-input");
  const instruction = input.value.trim();
  if (runRevision(instruction)) input.value = "";
});

document.querySelectorAll("[data-revision]").forEach((button) => {
  button.addEventListener("click", () => runRevision(button.dataset.revision));
});

const evidence = {
  direction: [
    {
      kind: "Git commit",
      time: "10:42",
      title: "feat(inbox): replace composer with ranked story moments",
      body: "Removed the prompt-first route. The home screen now ranks evidence-backed moments before drafting.",
    },
    {
      kind: "Codex session",
      time: "10:19",
      title: "Cut the decision burden before drafting",
      body: "A blank composer still asks the builder to decide what mattered. Workprint should arrive after that decision.",
    },
    {
      kind: "Product note",
      time: "09:54",
      title: "Open to something useful",
      body: "The shortest path should be app open, choose a detected moment, copy the finished post.",
    },
  ],
  evidence: [
    {
      kind: "Git commit",
      time: "12:06",
      title: "feat(proof): attach source refs to generated claims",
      body: "Added claim-level references so a factual line can open the commit or session that supports it.",
    },
    {
      kind: "Codex session",
      time: "11:31",
      title: "Never infer motivation from a diff",
      body: "A commit can explain what changed. If the story needs the builder’s reason, Workprint has to ask.",
    },
  ],
  boundary: [
    {
      kind: "Git commit",
      time: "14:27",
      title: "refactor(setup): detect local work sources first",
      body: "Removed manual project creation and moved GitHub and Codex detection into the first-run screen.",
    },
    {
      kind: "Codex session",
      time: "13:48",
      title: "The user should not maintain Workprint",
      body: "Project forms and activity logs turn the product into another job. Connect once, then keep up automatically.",
    },
  ],
};

function renderEvidence(key) {
  document.querySelectorAll(".claim-row").forEach((row) => {
    row.classList.toggle("is-active", row.dataset.claim === key);
  });
  document.querySelector("#evidence-list").innerHTML = evidence[key].map((item) => {
    const icon = item.kind === "Git commit"
      ? '<img class="evidence-logo is-monochrome" src="https://cdn.simpleicons.org/github/181717" alt="" />'
      : item.kind === "Codex session"
        ? '<img class="evidence-logo is-monochrome" src="https://cdn.jsdelivr.net/npm/simple-icons@14.15.0/icons/openai.svg" alt="" />'
        : "";
    return `
    <article class="evidence-item">
      <div class="evidence-meta"><span class="evidence-kind">${icon}${item.kind}</span><span>${item.time}</span></div>
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    </article>
  `;
  }).join("");
}

function openDrawer(id) {
  drawerLayers.forEach((layer) => { layer.hidden = layer.id !== id; });
  document.body.style.overflow = "hidden";
  document.querySelector(`#${id} .close-button`).focus();
}

function closeDrawers() {
  drawerLayers.forEach((layer) => { layer.hidden = true; });
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-close-drawer]").forEach((button) => {
  button.addEventListener("click", closeDrawers);
});

document.querySelectorAll(".claim-row").forEach((row) => {
  row.addEventListener("click", () => renderEvidence(row.dataset.claim));
});

document.querySelector("#recent-button").addEventListener("click", () => showScreen("today"));

document.querySelectorAll(".provider-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".provider-button").forEach((providerButton) => {
      const active = providerButton === button;
      providerButton.classList.toggle("is-active", active);
      providerButton.setAttribute("aria-pressed", String(active));
    });
    localStorage.setItem("workprint-ai-provider", button.dataset.provider);
  });
});

document.querySelector("#save-key").addEventListener("click", () => {
  const key = document.querySelector("#api-key").value.trim();
  if (!key) {
    showToast("Paste a demo key first.");
    return;
  }
  localStorage.setItem("workprint-demo-key", key);
  document.querySelector("#api-key").value = "";
  document.querySelector("#api-key").placeholder = "Demo key saved";
  showToast("Saved in this browser.");
});

const savedProvider = localStorage.getItem("workprint-ai-provider") || "openrouter";
document.querySelectorAll(".provider-button").forEach((button) => {
  const active = button.dataset.provider === savedProvider;
  button.classList.toggle("is-active", active);
  button.setAttribute("aria-pressed", String(active));
});
if (localStorage.getItem("workprint-demo-key")) {
  document.querySelector("#api-key").placeholder = "Demo key saved";
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawers();
});

if (new URLSearchParams(window.location.search).has("reset")) {
  localStorage.removeItem("workprint-connected");
}

const query = new URLSearchParams(window.location.search);
if (query.has("empty")) {
  localStorage.setItem("workprint-connected", "true");
  showScreen("quiet");
} else {
  showScreen(localStorage.getItem("workprint-connected") ? "today" : "setup");
}
