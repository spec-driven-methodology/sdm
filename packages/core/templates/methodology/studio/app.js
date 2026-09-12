const VIEW_SCHEMA = "sdm.studio.view/v1";
const ACTION_SCHEMA = "sdm.studio.action/v1";

const els = {
  loadView: document.getElementById("load-view"),
  workView: document.getElementById("work-view"),
  workTitle: document.getElementById("work-title"),
  workLead: document.getElementById("work-lead"),
  loadError: document.getElementById("load-error"),
  dropzone: document.getElementById("dropzone"),
  fileInput: document.getElementById("file-input"),
  btnDemo: document.getElementById("btn-demo"),
  btnBridge: document.getElementById("btn-bridge"),
  bridgeStatus: document.getElementById("bridge-status"),
  actionHint: document.getElementById("action-hint"),
  phaseClarifications: document.getElementById("phase-clarifications"),
  clarificationsRoot: document.getElementById("clarifications-root"),
  btnClarificationsNext: document.getElementById("btn-clarifications-next"),
  phasePlan: document.getElementById("phase-plan"),
  planRoot: document.getElementById("plan-root"),
  btnConfirm: document.getElementById("btn-confirm"),
  btnReject: document.getElementById("btn-reject"),
  phaseCoverage: document.getElementById("phase-coverage"),
  coverageTitle: document.getElementById("coverage-title"),
  coverageSummary: document.getElementById("coverage-summary"),
  coverageSkills: document.getElementById("coverage-skills"),
  coverageSuggestions: document.getElementById("coverage-suggestions"),
  coverageLevers: document.getElementById("coverage-levers"),
  phaseExport: document.getElementById("phase-export"),
  exportTitle: document.getElementById("export-title"),
  exportRoot: document.getElementById("export-root"),
  btnExport: document.getElementById("btn-export"),
  handoffPanel: document.getElementById("handoff-panel"),
  handoffHint: document.getElementById("handoff-hint"),
  linkPlayer: document.getElementById("link-player"),
  linkExports: document.getElementById("link-exports"),
  actionPanel: document.getElementById("action-panel"),
  actionJson: document.getElementById("action-json"),
  btnDownloadAction: document.getElementById("btn-download-action"),
  crumbs: document.getElementById("crumbs"),
  crumbCurrent: document.getElementById("crumb-current"),
  navHome: document.getElementById("nav-home"),
  crumbHome: document.getElementById("crumb-home"),
};

/** @type {any} */
let currentView = null;
/** @type {Record<string, string>} */
let clarificationValues = {};
/** @type {any} */
let lastAction = null;
/** @type {boolean} */
let bridgeAvailable = false;
/** @type {Record<string, unknown>} */
let exportValues = {};
/** @type {any} */
let exportPhase = null;
/** @type {any} */
let coveragePhase = null;

const STATUS_LABELS = {
  missing: "не покрыто",
  thin: "слабо покрыто",
  ok: "покрыто",
};

function statusLabel(status) {
  return STATUS_LABELS[status] || String(status);
}

function showError(msg) {
  els.loadError.hidden = !msg;
  els.loadError.textContent = msg || "";
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function goHome() {
  currentView = null;
  lastAction = null;
  clarificationValues = {};
  exportValues = {};
  exportPhase = null;
  coveragePhase = null;
  els.workView.hidden = true;
  els.loadView.hidden = false;
  els.crumbs.hidden = true;
  els.actionPanel.hidden = true;
  if (els.phaseExport) els.phaseExport.hidden = true;
  if (els.phaseCoverage) els.phaseCoverage.hidden = true;
  if (els.handoffPanel) els.handoffPanel.hidden = true;
  showError("");
}

function setWorking(title) {
  els.loadView.hidden = true;
  els.workView.hidden = false;
  els.crumbs.hidden = false;
  els.crumbCurrent.textContent = title || "Студия";
  els.workTitle.textContent = title || "Студия";
}

/**
 * @param {any} doc
 */
function assertViewDoc(doc) {
  if (!doc || typeof doc !== "object") {
    throw new Error("Ожидался JSON-объект view");
  }
  if (doc.schemaVersion !== VIEW_SCHEMA) {
    throw new Error(
      `Неподдерживаемая schemaVersion: ${doc.schemaVersion ?? "(нет)"}. Ожидается ${VIEW_SCHEMA}`,
    );
  }
  if (!Array.isArray(doc.phases)) {
    throw new Error("В view отсутствует phases[]");
  }
}

/**
 * @param {any} doc
 */
function loadViewDoc(doc) {
  assertViewDoc(doc);
  currentView = doc;
  clarificationValues = {};
  lastAction = null;
  els.actionPanel.hidden = true;
  setWorking(doc.title || "План");
  els.workLead.textContent = doc.id ? `id: ${doc.id}` : "";

  const clar = doc.phases.find((p) => p.kind === "clarifications");
  const plan = doc.phases.find((p) => p.kind === "plan");
  exportPhase = doc.phases.find((p) => p.kind === "export-form") || null;
  coveragePhase = doc.phases.find((p) => p.kind === "coverage") || null;

  if (els.handoffPanel) els.handoffPanel.hidden = false;
  updatePlayerLinks();

  if (clar) {
    renderClarifications(clar);
    els.phaseClarifications.hidden = false;
    els.phasePlan.hidden = true;
    if (els.phaseExport) els.phaseExport.hidden = true;
    if (els.phaseCoverage) els.phaseCoverage.hidden = true;
  } else if (plan) {
    els.phaseClarifications.hidden = true;
    renderPlan(plan);
    els.phasePlan.hidden = false;
    showCoverageIfAny();
    showExportFormIfAny();
  } else if (coveragePhase) {
    els.phaseClarifications.hidden = true;
    els.phasePlan.hidden = true;
    showCoverageIfAny();
    showExportFormIfAny();
  } else if (exportPhase) {
    els.phaseClarifications.hidden = true;
    els.phasePlan.hidden = true;
    if (els.phaseCoverage) els.phaseCoverage.hidden = true;
    showExportFormIfAny();
  } else {
    throw new Error(
      "В view нет фаз clarifications, plan, coverage или export-form",
    );
  }
}

function showCoverageIfAny() {
  if (!coveragePhase || !els.phaseCoverage) return;
  renderCoverage(coveragePhase);
  els.phaseCoverage.hidden = false;
}

/**
 * @param {any} phase
 */
function renderCoverage(phase) {
  if (els.coverageTitle) {
    els.coverageTitle.textContent = phase.title || "Покрытие";
  }
  const summary = phase.summary || {};
  const missing = Number(summary.missing || 0);
  const thin = Number(summary.thin || 0);
  const ok = Number(summary.ok || 0);
  if (els.coverageSummary) {
    const gapPart =
      missing + thin > 0
        ? `Пробелы: не покрыто ${missing}, слабо покрыто ${thin}`
        : "Пробелов нет";
    els.coverageSummary.textContent = `${gapPart}; покрыто ${ok}`;
  }

  els.coverageSkills.innerHTML = "";
  const skills = Array.isArray(phase.skills) ? phase.skills : [];
  for (const s of skills) {
    const card = document.createElement("div");
    card.className = `studio-card studio-cov-${s.status || "ok"}`;
    const status = statusLabel(s.status);
    card.innerHTML = `<h3><code>${escapeHtml(s.id)}</code> — ${escapeHtml(s.name || s.id)}</h3>
      <p class="small"><span class="studio-status">${escapeHtml(status)}</span>
      · вопросов: <code>${escapeHtml(s.questionCount ?? "—")}</code>
      · depthRatio: <code>${escapeHtml(s.depthRatio ?? "—")}</code></p>`;
    if (s.status === "missing" || s.status === "thin") {
      const row = document.createElement("div");
      row.className = "studio-actions-row";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn primary";
      btn.textContent = "Закрыть пробел";
      btn.addEventListener("click", () => {
        void emitAction("close_gap", {
          skill: s.id,
          profile: phase.profile || null,
          level: phase.level || null,
          status: s.status,
        });
      });
      row.appendChild(btn);
      card.appendChild(row);
    }
    els.coverageSkills.appendChild(card);
  }

  const suggestions = Array.isArray(phase.suggestions) ? phase.suggestions : [];
  if (els.coverageSuggestions && els.coverageLevers) {
    els.coverageLevers.innerHTML = "";
    if (suggestions.length === 0) {
      els.coverageSuggestions.hidden = true;
    } else {
      els.coverageSuggestions.hidden = false;
      for (const sug of suggestions) {
        const block = document.createElement("div");
        block.className = "studio-card";
        block.innerHTML = `<h3>${escapeHtml(sug.label || sug.id)}</h3>
          <p class="small muted">${escapeHtml(sug.why || "")}</p>`;
        const levers = Array.isArray(sug.levers) ? sug.levers : [];
        const row = document.createElement("div");
        row.className = "studio-actions-row";
        for (const lever of levers) {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "btn";
          chip.textContent = lever.phrase || lever.mapsTo || "действие";
          chip.addEventListener("click", () => {
            void emitAction("suggest_lever", {
              suggestionId: sug.id || null,
              phrase: lever.phrase || null,
              mapsTo: lever.mapsTo || null,
              profile: phase.profile || null,
              level: phase.level || null,
            });
          });
          row.appendChild(chip);
        }
        if (levers.length) block.appendChild(row);
        els.coverageLevers.appendChild(block);
      }
    }
  }
}

function showExportFormIfAny() {
  if (!exportPhase || !els.phaseExport) return;
  if (els.exportTitle) {
    els.exportTitle.textContent = exportPhase.title || "Экспорт теста";
  }
  renderExportForm(exportPhase);
  els.phaseExport.hidden = false;
}

/**
 * @param {any} phase
 */
function renderExportForm(phase) {
  const fields = Array.isArray(phase.fields) ? phase.fields : [];
  exportValues = {};
  els.exportRoot.innerHTML = "";

  if (phase.defaults && typeof phase.defaults === "object") {
    const meta = document.createElement("p");
    meta.className = "small muted";
    const d = phase.defaults;
    meta.innerHTML = `Профиль / уровень: <code>${escapeHtml(d.profile || "—")}</code> / <code>${escapeHtml(d.level || "—")}</code>`;
    els.exportRoot.appendChild(meta);
  }

  for (const field of fields) {
    const wrap = document.createElement("div");
    wrap.className = "studio-card";
    const title = document.createElement("h3");
    title.textContent = field.label || field.id;
    wrap.appendChild(title);

    const widget = field.widget || "text";
    if (widget === "multi") {
      const options = Array.isArray(field.options) ? field.options : [];
      const initial = Array.isArray(field.defaultValue)
        ? field.defaultValue.map(String)
        : [];
      exportValues[field.id] = [...initial];
      for (const opt of options) {
        const label = document.createElement("label");
        label.className = "studio-option";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = String(opt.value);
        if (initial.includes(String(opt.value))) input.checked = true;
        input.addEventListener("change", () => {
          const selected = [];
          wrap.querySelectorAll('input[type="checkbox"]').forEach((el) => {
            if (el.checked) selected.push(el.value);
          });
          exportValues[field.id] = selected;
        });
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${opt.label ?? opt.value}`));
        wrap.appendChild(label);
      }
    } else if (widget === "boolean") {
      const initial = Boolean(field.defaultValue);
      exportValues[field.id] = initial;
      const label = document.createElement("label");
      label.className = "studio-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = initial;
      input.addEventListener("change", () => {
        exportValues[field.id] = input.checked;
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(" да"));
      wrap.appendChild(label);
    } else if (widget === "number") {
      const initial =
        field.defaultValue != null ? Number(field.defaultValue) : 0;
      exportValues[field.id] = initial;
      const input = document.createElement("input");
      input.type = "number";
      input.className = "studio-input";
      if (field.min != null) input.min = String(field.min);
      if (field.max != null) input.max = String(field.max);
      input.value = String(initial);
      input.addEventListener("input", () => {
        exportValues[field.id] = Number(input.value);
      });
      wrap.appendChild(input);
    } else {
      const initial =
        field.defaultValue != null ? String(field.defaultValue) : "";
      exportValues[field.id] = initial;
      const input = document.createElement("input");
      input.type = "text";
      input.className = "studio-input";
      input.value = initial;
      input.addEventListener("input", () => {
        exportValues[field.id] = input.value;
      });
      wrap.appendChild(input);
    }

    els.exportRoot.appendChild(wrap);
  }
}

function updatePlayerLinks() {
  if (!els.linkPlayer) return;
  if (bridgeAvailable) {
    els.linkPlayer.href = "/player/";
    if (els.linkExports) {
      els.linkExports.hidden = false;
      els.linkExports.href = "/exports/";
    }
    if (els.handoffHint) {
      els.handoffHint.textContent =
        "После export агентом JSON появится в exports/ — откройте Player на этом же serve и загрузите файл (не LMS).";
    }
  } else {
    els.linkPlayer.href = "../player/index.html";
    if (els.linkExports) els.linkExports.hidden = true;
    if (els.handoffHint) {
      els.handoffHint.textContent =
        "Для удобного handoff: sdm studio serve → /player/ и /exports/. Offline: ../player/index.html";
    }
  }
}

/**
 * @param {any} phase
 */
function renderClarifications(phase) {
  const items = Array.isArray(phase.items) ? phase.items : [];
  els.clarificationsRoot.innerHTML = "";
  for (const item of items) {
    const field = document.createElement("fieldset");
    field.className = "studio-clarify";
    const legend = document.createElement("legend");
    legend.textContent = item.prompt || item.id || "Уточнение";
    field.appendChild(legend);

    const options = Array.isArray(item.options) ? item.options : [];
    const name = `clarify-${item.id}`;
    const initial =
      item.defaultValue != null
        ? String(item.defaultValue)
        : options[0]
          ? String(options[0].value)
          : "";
    clarificationValues[item.id] = initial;

    for (const opt of options) {
      const label = document.createElement("label");
      label.className = "studio-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = name;
      input.value = String(opt.value);
      if (String(opt.value) === initial) input.checked = true;
      input.addEventListener("change", () => {
        clarificationValues[item.id] = String(opt.value);
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(` ${opt.label ?? opt.value}`));
      field.appendChild(label);
    }
    els.clarificationsRoot.appendChild(field);
  }
}

/**
 * @param {any} phase
 */
function renderPlan(phase) {
  const plan = phase.plan || {};
  const profile = plan.profile || {};
  const level = plan.level || {};
  const skills = Array.isArray(plan.skills) ? plan.skills : [];
  const links = Array.isArray(plan.links) ? plan.links : [];
  const reuse = Array.isArray(plan.reuseSkills) ? plan.reuseSkills : [];
  const reqs = Array.isArray(plan.requirements) ? plan.requirements : [];
  const seed = plan.seed || {};

  const parts = [];
  parts.push(
    `<div class="studio-card"><h3>Профиль / уровень</h3><p><code>${escapeHtml(profile.id || "—")}</code> — ${escapeHtml(profile.title || "")}<br/><code>${escapeHtml(level.id || "—")}</code> — ${escapeHtml(level.title || "")}</p></div>`,
  );

  parts.push(`<div class="studio-card"><h3>Навыки</h3><ul class="studio-list">`);
  for (const s of skills) {
    parts.push(
      `<li><strong>${escapeHtml(s.name || s.id)}</strong> <code>${escapeHtml(s.id)}</code>` +
        (s.category ? ` · ${escapeHtml(s.category)}` : "") +
        (s.description
          ? `<div class="muted small">${escapeHtml(s.description)}</div>`
          : "") +
        `</li>`,
    );
  }
  parts.push(`</ul></div>`);

  if (links.length || reuse.length) {
    parts.push(`<div class="studio-card"><h3>Связи</h3><ul class="studio-list">`);
    for (const l of links) {
      const dep = (l.dependsOn || []).map(escapeHtml).join(", ") || "—";
      const rel = (l.relatedTo || []).map(escapeHtml).join(", ") || "—";
      parts.push(
        `<li><code>${escapeHtml(l.id)}</code>: dependsOn [${dep}]; relatedTo [${rel}]</li>`,
      );
    }
    if (reuse.length) {
      parts.push(
        `<li>Переиспользовать: ${reuse
          .map((id) => `<code>${escapeHtml(id)}</code>`)
          .join(", ")}</li>`,
      );
    }
    parts.push(`</ul></div>`);
  }

  if (reqs.length) {
    parts.push(
      `<div class="studio-card"><h3>Requirements</h3><table class="studio-table"><thead><tr><th>skill</th><th>depth</th><th>weight</th></tr></thead><tbody>`,
    );
    for (const r of reqs) {
      parts.push(
        `<tr><td><code>${escapeHtml(r.skill)}</code></td><td>${escapeHtml(r.depth)}</td><td>${escapeHtml(r.weight)}</td></tr>`,
      );
    }
    parts.push(`</tbody></table></div>`);
  }

  parts.push(
    `<div class="studio-card"><h3>Seed</h3><p class="small">questionsPerSkill: <code>${escapeHtml(seed.questionsPerSkill ?? "—")}</code>; type: <code>${escapeHtml(seed.type ?? "—")}</code>; typeMix: <code>${escapeHtml(seed.typeMix ?? "—")}</code>; difficulty: <code>${escapeHtml(seed.difficultyMin ?? "—")}</code>–<code>${escapeHtml(seed.difficultyMax ?? "—")}</code></p></div>`,
  );

  if (plan.notes) {
    parts.push(
      `<div class="studio-card"><h3>Заметки</h3><p class="small">${escapeHtml(plan.notes)}</p></div>`,
    );
  }

  els.planRoot.innerHTML = parts.join("\n");
}

/**
 * @param {string} type
 * @param {Record<string, unknown>} [extra]
 */
async function emitAction(type, extra = {}) {
  const planPhase = currentView?.phases?.find((p) => p.kind === "plan");
  lastAction = {
    schemaVersion: ACTION_SCHEMA,
    type,
    at: new Date().toISOString(),
    viewId: currentView?.id ?? null,
    planId: planPhase?.id ?? null,
    values: { ...clarificationValues },
    ...extra,
  };
  els.actionJson.textContent = JSON.stringify(lastAction, null, 2);
  els.actionPanel.hidden = false;

  if (bridgeAvailable) {
    try {
      const res = await fetch("/bridge/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastAction),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `POST /bridge/action → ${res.status}`);
      }
      if (els.actionHint) {
        els.actionHint.textContent =
          "Action записан в мост (.sdm/studio/last-action.json). Агент: sdm studio pull-action --json --consume";
      }
    } catch (err) {
      if (els.actionHint) {
        els.actionHint.textContent = `Мост: не удалось записать action (${err instanceof Error ? err.message : String(err)}). Скачайте JSON вручную.`;
      }
    }
  } else if (els.actionHint) {
    els.actionHint.textContent =
      "Передайте JSON агенту или сохраните файл. Studio методологию не меняет.";
  }
}

async function detectBridge() {
  if (!els.bridgeStatus) return;
  try {
    const res = await fetch("/bridge/status", { cache: "no-store" });
    if (!res.ok) throw new Error("no bridge");
    const body = await res.json();
    bridgeAvailable = Boolean(body && body.bridge);
  } catch {
    bridgeAvailable = false;
  }
  if (bridgeAvailable) {
    els.bridgeStatus.textContent =
      "Мост: активен (sdm studio serve). View / action + /player/ + /exports/";
    if (els.btnBridge) els.btnBridge.hidden = false;
  } else {
    els.bridgeStatus.textContent =
      "Мост: нет (откройте через sdm studio serve для push-view / pull-action / Player)";
    if (els.btnBridge) els.btnBridge.hidden = true;
  }
  updatePlayerLinks();
}

async function loadFromBridge() {
  showError("");
  try {
    const res = await fetch("/bridge/view", { cache: "no-store" });
    if (res.status === 404) {
      throw new Error(
        "В мосте нет view. Агент: sdm studio push-view <file> --json",
      );
    }
    if (!res.ok) throw new Error(`GET /bridge/view → ${res.status}`);
    const doc = await res.json();
    loadViewDoc(doc);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  }
}

function downloadLastAction() {
  if (!lastAction) return;
  const blob = new Blob([JSON.stringify(lastAction, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `studio-action-${lastAction.type}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function loadDemo() {
  showError("");
  try {
    const res = await fetch("fixtures/demo-view.json");
    if (!res.ok) throw new Error(`Не удалось загрузить fixture (${res.status})`);
    const doc = await res.json();
    loadViewDoc(doc);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  }
}

/**
 * @param {File} file
 */
async function loadFile(file) {
  showError("");
  try {
    const text = await file.text();
    const doc = JSON.parse(text);
    loadViewDoc(doc);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  }
}

els.btnDemo.addEventListener("click", () => loadDemo());
if (els.btnBridge) {
  els.btnBridge.addEventListener("click", () => loadFromBridge());
}
els.fileInput.addEventListener("change", () => {
  const f = els.fileInput.files?.[0];
  if (f) loadFile(f);
});
els.dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  els.dropzone.classList.add("drag");
});
els.dropzone.addEventListener("dragleave", () => {
  els.dropzone.classList.remove("drag");
});
els.dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  els.dropzone.classList.remove("drag");
  const f = e.dataTransfer?.files?.[0];
  if (f) loadFile(f);
});

els.btnClarificationsNext.addEventListener("click", () => {
  void emitAction("answer_clarification").then(() => {
    const plan = currentView?.phases?.find((p) => p.kind === "plan");
    if (plan) {
      renderPlan(plan);
      els.phasePlan.hidden = false;
    }
    showCoverageIfAny();
    showExportFormIfAny();
  });
});
els.btnConfirm.addEventListener("click", () => {
  void emitAction("confirm_plan");
});
els.btnReject.addEventListener("click", () => {
  void emitAction("reject_plan");
});
if (els.btnExport) {
  els.btnExport.addEventListener("click", () => {
    void emitAction("export_test", {
      target: exportPhase?.target || "export_test",
      defaults: exportPhase?.defaults || null,
      values: { ...exportValues },
    }).then(() => {
      if (els.actionHint) {
        els.actionHint.textContent =
          "Агент: map values → sdm export test --profile … --level … [--include-type …] [--adaptive --per-skill …]; затем Открыть Player.";
      }
    });
  });
}
els.btnDownloadAction.addEventListener("click", () => downloadLastAction());
els.navHome.addEventListener("click", goHome);
els.crumbHome.addEventListener("click", goHome);

void detectBridge();
