import { kitChecklistIntroHtml, kitEmptyProbesHtml, kitMetaDepthWeight, kitWarningsSummaryHtml, } from "./kit-ui-copy.js";
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
function formatExpected(expected) {
    if (expected === undefined)
        return "";
    if (Array.isArray(expected)) {
        return expected.map((e) => escapeHtml(e)).join("; ");
    }
    return escapeHtml(expected);
}
function renderProbe(probe) {
    const parts = [
        `<div class="qbox">`,
        `<div class="q-label">Вопрос эксперту</div>`,
        `<p class="q-text">${escapeHtml(probe.text)}</p>`,
    ];
    if (probe.evidence) {
        parts.push(`<p class="q-meta"><strong>Evidence:</strong> ${escapeHtml(probe.evidence)}</p>`);
    }
    if (probe.minDepthBand) {
        parts.push(`<p class="q-meta"><strong>Закрывает:</strong> ${escapeHtml(probe.minDepthBand)} (${escapeHtml(probe.minDepthLabel ?? "")})</p>`);
    }
    if (probe.explanation) {
        parts.push(`<p class="q-expected"><strong>Эталон:</strong> ${escapeHtml(probe.explanation)}</p>`);
    }
    const exp = formatExpected(probe.expected);
    if (exp) {
        parts.push(`<p class="q-expected"><strong>Ожидаемое:</strong> ${exp}</p>`);
    }
    if (probe.red_flags && probe.red_flags.length > 0) {
        parts.push("<p class=\"q-expected\"><strong>Red flags:</strong></p><ul class=\"q-criteria\">");
        for (const flag of probe.red_flags) {
            parts.push(`<li>${escapeHtml(flag)}</li>`);
        }
        parts.push("</ul>");
    }
    if (probe.rubric && probe.rubric.length > 0) {
        parts.push("<p class=\"q-expected\"><strong>Рубрика:</strong></p><ul class=\"q-criteria\">");
        for (const row of probe.rubric) {
            parts.push(`<li><strong>${row.score}:</strong> ${escapeHtml(row.description)}</li>`);
        }
        parts.push("</ul>");
    }
    if (probe.validationCriteria && probe.validationCriteria.length > 0) {
        parts.push("<ul class=\"q-criteria\">");
        for (const c of probe.validationCriteria) {
            parts.push(`<li>${escapeHtml(c)}</li>`);
        }
        parts.push("</ul>");
    }
    parts.push("</div>");
    return parts.join("\n");
}
function renderModule(mod, index) {
    const topics = mod.topics.length > 0
        ? `<p class="topics"><strong>Ключевые темы:</strong> ${mod.topics.map(escapeHtml).join(", ")}</p>`
        : "";
    const meta = `<p class="meta-line">${escapeHtml(kitMetaDepthWeight(mod.depth, mod.weight, mod.depthBand))}</p>`;
    const desc = mod.description
        ? `<p class="desc">${escapeHtml(mod.description)}</p>`
        : "";
    const probes = mod.probes.length > 0
        ? mod.probes.map(renderProbe).join("\n")
        : kitEmptyProbesHtml({
            skillId: mod.skill,
            assessmentQuestionCount: mod.assessmentQuestionCount ?? 0,
        });
    return `
<section class="module panel" id="m${index}">
  <h2>${index + 1}. ${escapeHtml(mod.title)}</h2>
  ${meta}
  ${desc}
  ${topics}
  ${probes}
</section>`;
}
/** Self-contained kit page styles — aligned with methodology player (styles.css). */
const KIT_CSS = `
:root {
  --bg: #f3f0ea;
  --bg-accent: #e4ebe4;
  --ink: #1c241c;
  --muted: #5a655a;
  --line: #c9d0c6;
  --panel: #fffdf8;
  --primary: #1f5c45;
  --primary-ink: #f4fff8;
  --warn: #854d0e;
  --radius: 12px;
  --font: "IBM Plex Sans", "Segoe UI", sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, monospace;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--font);
  color: var(--ink);
  line-height: 1.55;
  min-height: 100vh;
  background:
    radial-gradient(1200px 600px at 10% -10%, var(--bg-accent), transparent 55%),
    linear-gradient(180deg, #f7f4ee 0%, var(--bg) 40%, #ebe6dc 100%);
}
.page {
  width: min(960px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 3rem;
}
.site-header { margin-bottom: 1.25rem; }
.brand-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
}
.brand {
  margin: 0;
  padding: 0;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--ink);
  text-decoration: none;
}
a.brand {
  cursor: pointer;
}
.brand:hover {
  color: var(--primary);
}
.tagline {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 450;
  letter-spacing: 0.01em;
  line-height: 1.2;
}
.tag-sep {
  display: inline-block;
  width: 1px;
  height: 0.95em;
  background: var(--line);
}
.doc-header {
  margin-bottom: 1.25rem;
}
.doc-header h1 {
  font-size: 1.45rem;
  margin-bottom: 0.35rem;
  line-height: 1.3;
}
.doc-header .sub {
  color: var(--muted);
  font-size: 0.95rem;
}
.panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: calc(var(--radius) + 2px);
  padding: 1.25rem 1.5rem;
  box-shadow: 0 10px 30px rgba(28, 36, 28, 0.05);
}
nav.toc {
  margin-bottom: 1.25rem;
}
nav.toc h2 {
  font-size: 1.05rem;
  margin-bottom: 0.75rem;
  color: var(--primary);
}
nav.toc ol {
  padding-left: 1.25rem;
  margin: 0;
}
nav.toc a {
  color: var(--primary);
  text-decoration: none;
}
nav.toc a:hover {
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 0.15em;
}
.module {
  margin-bottom: 1rem;
}
.module h2 {
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
  color: var(--ink);
}
.meta-line, .topics, .desc {
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}
.topics strong { color: var(--ink); }
.qbox {
  padding: 0.85rem 1rem;
  border-left: 3px solid var(--primary);
  background: #eef6f1;
  border-radius: 0 var(--radius) var(--radius) 0;
  margin: 0.75rem 0;
}
.q-label {
  font-size: 0.72rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--primary);
  margin-bottom: 0.35rem;
}
.q-text {
  font-size: 1rem;
  font-weight: 550;
  line-height: 1.45;
  margin: 0 0 0.5rem;
}
.q-expected {
  font-size: 0.9rem;
  color: var(--muted);
  margin-top: 0.35rem;
  line-height: 1.5;
}
.q-expected strong { color: var(--ink); }
.q-meta { font-size: 0.85rem; color: var(--muted); margin-top: 0.25rem; }
.checklist-intro {
  font-size: 0.9rem;
  color: var(--muted);
  margin-bottom: 0.75rem;
  line-height: 1.5;
}
.checklist-intro strong { color: var(--ink); }
.muted { color: var(--muted); font-size: 0.85em; }
.q-criteria {
  margin: 0.35rem 0 0 1.1rem;
  font-size: 0.88rem;
  color: var(--muted);
}
.kit-gap {
  background: #f4f6f2;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0.85rem 1rem;
  margin: 0.75rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
}
.kit-gap-title {
  font-weight: 650;
  margin-bottom: 0.35rem;
  color: var(--warn);
}
.kit-gap-action { margin-top: 0.5rem; }
.kit-gap-hint {
  margin-top: 0.35rem;
  font-size: 0.82rem;
  color: var(--muted);
}
.kit-gap code {
  font-family: var(--mono);
  font-size: 0.85em;
  background: #eef2ee;
  padding: 0.1em 0.35em;
  border-radius: 4px;
}
.kit-warnings-summary {
  background: #f8faf6;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
}
.kit-warnings-summary h2 {
  font-size: 1.05rem;
  color: var(--ink);
  margin-bottom: 0.5rem;
}
.warn-lead {
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}
.warn-list {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--warn);
}
.warn-list li { margin-bottom: 0.75rem; }
.warn-list li strong { color: var(--ink); }
.warn-list p {
  margin: 0.25rem 0;
  color: var(--muted);
  font-size: 0.88rem;
}
.warn-action {
  font-size: 0.85rem !important;
  color: var(--ink) !important;
}
.checklist, .glossary {
  margin-bottom: 1.25rem;
}
.checklist h2, .glossary h2 {
  font-size: 1.05rem;
  margin-bottom: 0.75rem;
  color: var(--primary);
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}
th, td {
  text-align: left;
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--line);
  vertical-align: top;
}
th {
  background: #f4f6f2;
  font-weight: 650;
  color: var(--muted);
}
code {
  font-family: var(--mono);
  font-size: 0.88em;
  background: #eef2ee;
  padding: 0.1em 0.35em;
  border-radius: 4px;
}
footer {
  text-align: center;
  color: var(--muted);
  font-size: 0.82rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}
footer .brand-footer {
  margin-bottom: 0.35rem;
  font-weight: 550;
  color: var(--primary);
}
@media (max-width: 640px) {
  .page { width: min(960px, calc(100% - 1rem)); padding: 1.25rem 0 2rem; }
  .panel { padding: 1rem 1.1rem; }
}
`.trim();
/** Deterministic self-contained HTML for expert interview kit. */
export function renderKitHtml(doc) {
    const tocItems = doc.modules
        .map((m, i) => `<li><a href="#m${i}">${escapeHtml(m.title)}</a></li>`)
        .join("\n");
    const modulesHtml = doc.modules
        .map((m, i) => renderModule(m, i))
        .join("\n");
    const checklistRows = doc.checklist
        .map((c) => `<tr><td>${escapeHtml(c.skillName)}</td><td>${escapeHtml(c.depthBand)} <span class="muted">(${escapeHtml(c.depthLabel)})</span></td><td>${c.depth}</td><td>${c.weight}</td></tr>`)
        .join("\n");
    const glossaryRows = doc.glossary
        .map((g) => `<tr><td><code>${escapeHtml(g.id)}</code></td><td>${escapeHtml(g.term)}</td><td>${escapeHtml(g.definition)}</td></tr>`)
        .join("\n");
    const revision = doc.meta.revision ?? "—";
    const profileLevel = `${escapeHtml(doc.profile)} / ${escapeHtml(doc.level)}`;
    const skillTitles = new Map(doc.modules.map((m) => [m.skill, m.title]));
    const warningsHtml = kitWarningsSummaryHtml(doc.warnings, skillTitles);
    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SDM — шпаргалка — ${escapeHtml(doc.title)}</title>
  <style>${KIT_CSS}</style>
</head>
<body>
  <div class="page">
    <header class="site-header">
      <div class="brand-row">
        <p class="brand">SDM</p>
        <p class="tagline">
          <span class="tag-sep" aria-hidden="true"></span>Spec-Driven Methodology
        </p>
      </div>
    </header>
    <header class="doc-header panel">
      <h1>Шпаргалка эксперта — ${escapeHtml(doc.title)}</h1>
      <p class="sub">${profileLevel} · рендер эталона (не SSOT)</p>
    </header>
    <nav class="toc panel">
      <h2>Содержание</h2>
      <ol>${tocItems}</ol>
    </nav>
    ${warningsHtml}
    ${modulesHtml}
    <section class="checklist panel" id="checklist">
      <h2>Чеклист навыков уровня</h2>
      ${kitChecklistIntroHtml()}
      <table>
        <thead><tr><th>Навык</th><th>L / смысл</th><th>Глубина</th><th>Вес</th></tr></thead>
        <tbody>${checklistRows}</tbody>
      </table>
    </section>
    <section class="glossary panel" id="glossary">
      <h2>Глоссарий</h2>
      <table>
        <thead><tr><th>ID</th><th>Термин</th><th>Определение</th></tr></thead>
        <tbody>${glossaryRows}</tbody>
      </table>
    </section>
    <footer>
      <p class="brand-footer">SDM · Spec-Driven Methodology</p>
      <p>Шпаргалка эксперта · revision ${escapeHtml(revision)} · ${escapeHtml(doc.id)}</p>
    </footer>
  </div>
</body>
</html>`;
}
//# sourceMappingURL=export-kit-html.js.map