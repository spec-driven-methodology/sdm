import type { KitChecklistItem, KitWarning } from "./export-kit.js";
import { labelDepth } from "./depth-bands.js";
import type { Skill } from "./schemas.js";

/** Prefer Russian description lead when skill.name is English-only. */
export function kitModuleDisplayTitle(skill: Skill): string {
  const name = skill.name.trim();
  const desc = skill.description.trim();
  if (!desc) return name || skill.id;
  const hasCyrillic = (s: string) => /[\u0400-\u04FF]/.test(s);
  if (hasCyrillic(desc) && !hasCyrillic(name)) {
    const firstLine = desc.split(/\n/)[0]?.trim() ?? desc;
    const sentence = firstLine.split(/[.!?](?:\s|$)/)[0]?.trim() ?? firstLine;
    if (sentence.length >= 12) {
      return sentence.length > 80 ? `${sentence.slice(0, 77)}…` : sentence;
    }
  }
  return name || skill.id;
}

export function kitMetaDepthWeight(
  depth: number,
  weight: number,
  depthBand?: string,
): string {
  const band = depthBand ?? labelDepth(depth).band;
  return `${band} · глубина ${depth} · вес ${weight}`;
}

export function kitChecklistIntroHtml(): string {
  return `<p class="checklist-intro">Отметьте каждый навык на интервью. <strong>Вес</strong> — приоритет и время (сумма ≈ 1). <strong>Глубина / L</strong> — насколько жёстко задавать уточняющие вопросы. Конкретные формулировки — в модулях выше.</p>`;
}

export function kitChecklistRowLabel(item: KitChecklistItem): string {
  return `${item.depthBand} (${item.depthLabel})`;
}

export interface KitWarningView {
  title: string;
  detail: string;
  action?: string;
}

export function kitWarningView(
  w: KitWarning,
  skillTitle?: string,
): KitWarningView {
  const skill = skillTitle ?? w.skill ?? "навык";
  switch (w.code) {
    case "KIT_NO_PROBE_QUESTION":
      return {
        title: `Нет вопросов для интервьюера: «${skill}»`,
        detail:
          "Шпаргалка эксперта показывает только открытые и кодовые вопросы с эталоном ответа. Тестовые вопросы с вариантами сюда не попадают — они для тестового экспорта.",
        action:
          "Добавьте 1–3 открытых вопроса с объяснениями в Библиотеку SDM (как на интервью), затем пересоберите шпаргалку: sdm export kit … --out exports/kit-….html",
      };
    case "KIT_EXPLANATION_MISSING":
      return {
        title: `Нет эталона ответа у вопроса ${w.questionId ?? ""}`.trim(),
        detail: `Вопрос «${w.questionId}» не попадёт в шпаргалку без объяснения — это критерий для интервьюера.`,
        action:
          "Допишите объяснение в Библиотеке SDM (library/questions), затем пересоберите шпаргалку.",
      };
    case "KIT_SKILL_DESCRIPTION_EMPTY":
      return {
        title: `Пустое описание навыка «${skill}»`,
        detail:
          "В шпаргалке глоссарий и карточка навыка берут описание из онтологии (ontology/).",
        action: "Заполните описание навыка и пересоберите шпаргалку.",
      };
    case "KIT_NO_WORK_SAMPLE":
      return {
        title: "Нет кодовой work-sample пробы",
        detail:
          "Для уровней middle+ нужна хотя бы одна кодовая проба (type=code) с рубрикой.",
        action:
          "Добавьте code-вопрос с rubric и evidence через question add, затем пересоберите шпаргалку.",
      };
    case "KIT_PROBE_RUBRIC_MISSING":
      return {
        title: `Нет рубрики у вопроса ${w.questionId ?? ""}`.trim(),
        detail:
          "Открытые и кодовые пробы должны иметь scored rubric (0–3) для интервьюера.",
        action: "Допишите rubric в library/questions или через question add --rubric.",
      };
    case "KIT_GLOSSARY_EMPTY":
      return {
        title: "Пустой глоссарий",
        detail: "Нет терминов и нет описаний навыков для глоссария kit.",
        action: "Добавьте library/terms или описания навыков в ontology/.",
      };
    case "KIT_GLOSSARY_FALLBACK_SKILL":
      return {
        title: "Глоссарий из описаний навыков",
        detail:
          "Нет library/terms, привязанных к навыкам уровня — показываем fallback из ontology.",
        action: "Добавьте термины: sdm term add … --skill <id>",
      };
    case "KIT_GLOSSARY_PRODUCT_HEAVY":
      return {
        title: "Много product-терминов в глоссарии",
        detail: w.message,
        action: "Добавьте concept-термины (kind=concept) или сократите product-адаптеры.",
      };
    case "KIT_SECURITY_SKILL_MISSING":
      return {
        title: "Нет security-навыка на middle+",
        detail: w.message,
        action:
          "Добавьте required skill с topics/id про security/privacy/injection.",
      };
    case "KIT_TERM_UNLINKED":
      return {
        title: `Термин без привязки: ${w.termId ?? ""}`.trim(),
        detail: w.message,
        action: "Укажите skills: […] в YAML термина или удалите лишний term.",
      };
    default:
      return {
        title: w.code,
        detail: w.message,
      };
  }
}

export function kitEmptyProbesHtml(input: {
  skillId: string;
  assessmentQuestionCount: number;
}): string {
  const testNote =
    input.assessmentQuestionCount > 0
      ? `<p>В Библиотеке SDM уже есть <strong>${input.assessmentQuestionCount}</strong> тестовых вопросов с вариантами — они для тестового экспорта, не для шпаргалки интервьюера.</p>`
      : `<p>В Библиотеке SDM пока нет вопросов по этому навыку.</p>`;
  return `<div class="kit-gap">
  <p class="kit-gap-title">Нет вопросов для интервьюера</p>
  <p>Шпаргалка показывает только <strong>открытые</strong> и <strong>кодовые</strong> вопросы — формулировку «спроси эксперта» и эталон ответа с объяснением.</p>
  ${testNote}
  <p class="kit-gap-action"><strong>Что сделать:</strong> добавьте открытый вопрос в духе «Как называют…?» / «Чем отличается…?» с объяснением в Библиотеку SDM; затем пересоберите шпаргалку.</p>
  <p class="kit-gap-hint">Навык: <code>${escapeHtml(input.skillId)}</code></p>
</div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function kitWarningsSummaryHtml(
  warnings: KitWarning[],
  skillTitles: Map<string, string>,
): string {
  if (warnings.length === 0) return "";
  const items = warnings
    .map((w) => {
      const view = kitWarningView(w, skillTitles.get(w.skill ?? ""));
      const action = view.action
        ? `<p class="warn-action">${escapeHtml(view.action)}</p>`
        : "";
      return `<li><strong>${escapeHtml(view.title)}</strong><p>${escapeHtml(view.detail)}</p>${action}</li>`;
    })
    .join("");
  return `<section class="kit-warnings-summary" aria-label="Замечания по готовности kit">
  <h2>Что доработать в эталоне</h2>
  <p class="warn-lead">Экспорт не блокирован — страница собрана, но часть блоков пустая или тонкая. Исправления в YAML, не в HTML.</p>
  <ul class="warn-list">${items}</ul>
</section>`;
}
