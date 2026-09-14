(() => {
  const UI = {
    en: {
      "nav.course": "Course",
      "nav.kit": "Cheat sheet",
      "nav.test": "Test",
      "nav.stats": "Results",
      "load.library.heading.kits": "Loaded cheat sheets",
      "load.library.heading.courses": "Loaded courses",
      "load.library.heading.tests": "Loaded tests",
      "load.dropzone.kit": "Drop kit JSON here or click to select (multiple allowed)",
      "load.dropzone.course": "Drop course JSON here or click to select (multiple allowed)",
      "load.dropzone.test": "Drop test JSON here or click to select (multiple allowed)",
      "err.notJson": "The file is not valid JSON.",
      "err.badDoc": "Invalid document.",
      "err.noQuestions": "The document must have a non-empty questions array.",
      "err.courseNeedsModules": "The course document must have a modules array.",
      "err.kitNeedsModules": "The kit document must have a modules array.",
      "err.kitNeedsGlossary": "The kit document must have a glossary array.",
      "err.kitNeedsChecklist": "The kit document must have a checklist array.",
      "lib.open": "Open",
      "lib.start": "Start",
      "lib.remove": "Remove",
      "lib.fallback.course": "Course",
      "lib.fallback.kit": "Cheat sheet",
      "err.saveTests": "Could not save the test library to localStorage (no space). Remove some entries or clear browser storage. The current page session is kept in memory.",
      "err.saveCourses": "Could not save the course library to localStorage (no space). Remove some entries or clear browser storage. The current page session is kept in memory.",
      "err.saveKits": "Could not save the cheat-sheet library to localStorage (no space). Remove some entries or clear browser storage.",
      "err.testsCorrupted": "The saved test library was corrupted and has been reset. Load the JSON again.",
      "err.coursesCorrupted": "The saved course library was corrupted and has been reset. Load the JSON again.",
      "err.kitsCorrupted": "The saved cheat-sheet library was corrupted and has been reset. Load the JSON again.",
      "err.minutesInvalid": "Enter a whole number of minutes \u2265 1 or leave the field empty.",
      "err.noAnswer": "First select or enter an answer (or skip).",
      "err.unsupportedType": "Unsupported question type: {type}",
      "err.meta.profile": "profile: {v}",
      "err.meta.level": "level: {v}",
      "err.meta.threshold": "threshold: {v}",
      "err.meta.questions": "{n} questions",
      "err.saveTestsMsg": "Could not save the test library: {msg}",
      "err.saveCoursesMsg": "Could not save the course library: {msg}",
      "err.saveKitsMsg": "Could not save the cheat-sheet library: {msg}",
      "err.loadUrl": "Could not load {label}",
      "err.loadError": "{file}: {msg}",
      "err.loadError.file": "file",
      "err.noSchema": "schemaVersion is missing. Expected {test}, {course} or {kit}.",
      "err.badSchema": "Unsupported schemaVersion \"{version}\". Expected {test}, {course} or {kit}.",
      "meta.count.module": "module",
      "meta.count.modules": "modules",
      "meta.count.modulesMany": "modules",
      "meta.count.lesson": "lesson",
      "meta.count.lessons": "lessons",
      "meta.count.lessonsMany": "lessons",
      "meta.count.probe": "probe",
      "meta.count.probes": "probes",
      "meta.count.probesMany": "probes",
      "meta.count.question": "question",
      "meta.count.questions": "questions",
      "meta.count.course": "course",
      "practice.title": "Practice",
      "practice.fromCourse": "{n} questions \u00b7 practice from course",
      "course.about": "About the course",
      "course.module": "Module {n}",
      "course.lesson": "Lesson {n}",
      "course.noLessons": "No lessons",
      "course.noLessonsBody": "This course has no lessons to view.",
      "course.noLessonText": "No lesson text (empty body \u2014 brief not filled in yet).",
      "course.warningsOnlyAuthor": "The list of fixes is below. Visible only to the course author.",
      "course.footnotes": "Footnotes",
      "course.terms": "Course terms",
      "course.termsIntro": "Full list of course terms. In regular lessons only footnotes for this section\u2019s terms are shown below the text.",
      "course.ref": "Reference",
      "course.rerework": "To rework",
      "course.rereworkTitle": "Course fixes",
      "course.warningsBadge": "Fixes: {n}",
      "course.warningsTitle": "Course fixes ({n})",
      "course.warningsLead": "Technical notes for the author, not for the reader.",
      "course.practice": "Module practice",
      "course.practiceIds": "Practice questions ({n})",
      "course.practiceRun": "Run practice ({n})",
      "course.practiceNeedTest": "Load a paired {code}export test{/code} on the Tests tab to run practice here.",
      "course.practiceFromLibrary": "{n} questions from library",
      "course.noModules": "The course has no modules or lessons.",
      "kit.title": "Cheat sheet",
      "kit.revision": "revision {n}",
      "kit.warnHead": "What to fix in the standard",
      "kit.warnLead": "Fix in YAML, not in HTML. Export is not blocked.",
      "kit.warnNoProbe": "No interviewer questions: \u00ab{skill}\u00bb",
      "kit.warnNoProbeDetail": "The cheat sheet shows only open and code questions with a reference answer. Choice questions are for test export.",
      "kit.warnNoProbeAction": "Add open questions with explanations to the SDM Library, then rebuild the cheat sheet.",
      "kit.warnNoRef": "No reference answer for question {id}",
      "kit.warnNoRefDetail": "Add an explanation (reference answer) to the open question in the SDM Library.",
      "kit.warnNoSkillDesc": "Empty skill description \u00ab{skill}\u00bb",
      "kit.warnNoSkillDescDetail": "Fill in the skill description in the ontology (ontology/).",
      "kit.emptyProbes": "No interviewer questions",
      "kit.needOpen": "Need {strong}open{/strong} or {strong}code{/strong} questions with an explanation (reference answer), like \u00abWhat is\u2026?\u00bb",
      "kit.hasTestOnly": "The SDM Library already has {strong}{n}{/strong} choice questions \u2014 they are for test export.",
      "kit.noQuestionsYet": "The SDM Library has no questions for this skill yet.",
      "kit.addOpenAction": "Add open questions with explanations to the SDM Library and rebuild the cheat sheet. Skill:",
      "kit.qLabel": "Question for the expert",
      "kit.covers": "Covers:",
      "kit.reference": "Reference:",
      "kit.expected": "Expected:",
      "kit.rubric": "Rubric:",
      "kit.keyTopics": "Key topics:",
      "kit.moduleFallback": "Module",
      "kit.meta.depth": "depth {v}",
      "kit.meta.weight": "weight {v}",
      "kit.glossary": "Glossary",
      "kit.term": "Term",
      "kit.definition": "Definition",
      "kit.checklist": "Level checklist",
      "kit.checklistIntro": "Check each skill. {strong}Weight{/strong} \u2014 priority and time (sum \u2248 1). {strong}Depth / L{/strong} \u2014 how hard to dig into follow-ups.",
      "kit.skill": "Skill",
      "kit.depthMeaning": "L / meaning",
      "kit.depth": "Depth",
      "kit.weight": "Weight",
      "kit.modules": "Modules",
      "kit.noModulesInExports": "No kit JSON in exports/ for this tab.",
      "kit.noCourseInExports": "No course JSON in exports/ for this tab (there are tests \u2014 switch to Tests).",
      "kit.noTestInExports": "No test JSON in exports/ for this tab (there are courses \u2014 switch to Courses).",
      "kit.exports.kits": "Cheat sheets in exports/",
      "kit.exports.courses": "Courses in exports/",
      "kit.exports.tests": "Tests in exports/",
      "test.feedback.correct": "Correct.",
      "test.feedback.incorrect": "Incorrect.",
      "test.feedback.skipped": "Skipped.",
      "test.feedback.unscored": "Recorded without auto-check.",
      "test.placeholder.open": "Enter a short answer\u2026",
      "test.placeholder.code": "Notes (code is not auto-checked)\u2026",
      "test.criteria": "Grading criteria",
      "test.difficulty": "difficulty {v}",
      "test.emptyText": "(empty question text)",
      "test.stats.correct": "Correct",
      "test.stats.incorrect": "Incorrect",
      "test.stats.skipped": "Skipped",
      "test.stats.unscored": "Unscored",
      "test.stats.percent": "Percent",
      "test.stats.weighted": "Weighted",
      "test.stats.summary.timeUp": "time is up",
      "test.stats.summary.score": "{correct} correct / {scored} scored ({pct}%)",
      "test.stats.summary.skipped": "{n} skipped",
      "test.stats.summary.unscored": "{n} unscored",
      "test.stats.summary.weighted": "weighted score {v}",
      "test.stats.summary.threshold": "weighted {v} of threshold {t} \u2192 {result}",
      "test.stats.result.pass": "threshold passed",
      "test.stats.result.fail": "below threshold",

      "nav.home": "Home",
      "load.title": "Load export JSON",
      "load.tabs.label": "Export type",
      "load.tab.tests": "Tests",
      "load.tab.courses": "Courses",
      "load.tab.kits": "Cheat sheets",
      "load.exports.heading": "Files in exports/",
      "load.dropzone": "Drop files here or click to select (multiple allowed)",
      "load.options": "Session options",
      "load.opt.autonext": "Auto-advance after check (~1 s)",
      "load.opt.shuffle": "Shuffle questions",
      "load.opt.shuffleOptions": "Shuffle options",
      "load.opt.timed": "Limit time",
      "load.opt.minutes": "Total minutes (empty = N × 1 min)",
      "load.opt.minutes.placeholder": "auto",
      "course.title": "Course",
      "course.modules": "Modules",
      "course.contents": "Contents",
      "course.practiceHint": "Practice comes from {code}practiceQuestionIds{/code} of the module (not from a section in the lesson text).",
      "kit.actions.home": "To library",
      "test.actions.prev": "Back",
      "test.actions.skip": "Skip",
      "test.actions.check": "Check",
      "test.actions.next": "Next",
      "test.actions.finish": "Finish",
      "test.actions.home": "To library",
      "test.stats.title": "Results",
      "test.stats.bySkill": "By skill",
      "test.stats.skill": "Skill",
      "test.stats.weight": "Weight",
      "test.stats.ratio": "Ratio",
      "lang.switch": "Switch language",
    },
    ru: {
      "nav.course": "\u041a\u0443\u0440\u0441",
      "nav.kit": "\u0428\u043f\u0430\u0440\u0433\u0430\u043b\u043a\u0430",
      "nav.test": "\u0422\u0435\u0441\u0442",
      "nav.stats": "\u0420\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u044b",
      "load.library.heading.kits": "\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u043d\u044b\u0435 \u0448\u043f\u0430\u0440\u0433\u0430\u043b\u043a\u0438",
      "load.library.heading.courses": "\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u043d\u044b\u0435 \u043a\u0443\u0440\u0441\u044b",
      "load.library.heading.tests": "\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u043d\u044b\u0435 \u0442\u0435\u0441\u0442\u044b",
      "load.dropzone.kit": "\u041f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 kit JSON \u0441\u044e\u0434\u0430 \u0438\u043b\u0438 \u043d\u0430\u0436\u043c\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u0432\u044b\u0431\u0440\u0430\u0442\u044c (\u043c\u043e\u0436\u043d\u043e \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e)",
      "load.dropzone.course": "\u041f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 course JSON \u0441\u044e\u0434\u0430 \u0438\u043b\u0438 \u043d\u0430\u0436\u043c\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u0432\u044b\u0431\u0440\u0430\u0442\u044c (\u043c\u043e\u0436\u043d\u043e \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e)",
      "load.dropzone.test": "\u041f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 test JSON \u0441\u044e\u0434\u0430 \u0438\u043b\u0438 \u043d\u0430\u0436\u043c\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u0432\u044b\u0431\u0440\u0430\u0442\u044c (\u043c\u043e\u0436\u043d\u043e \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e)",
      "err.notJson": "\u0424\u0430\u0439\u043b \u043d\u0435 \u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u043c JSON.",
      "err.badDoc": "\u041d\u0435\u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442.",
      "err.noQuestions": "\u0412 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0435 \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043d\u0435\u043f\u0443\u0441\u0442\u043e\u0439 \u043c\u0430\u0441\u0441\u0438\u0432 questions.",
      "err.courseNeedsModules": "\u0412 course-\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0435 \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043c\u0430\u0441\u0441\u0438\u0432 modules.",
      "err.kitNeedsModules": "\u0412 kit-\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0435 \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043c\u0430\u0441\u0441\u0438\u0432 modules.",
      "err.kitNeedsGlossary": "\u0412 kit-\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0435 \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043c\u0430\u0441\u0441\u0438\u0432 glossary.",
      "err.kitNeedsChecklist": "\u0412 kit-\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0435 \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043c\u0430\u0441\u0441\u0438\u0432 checklist.",
      "lib.open": "\u041e\u0442\u043a\u0440\u044b\u0442\u044c",
      "lib.start": "\u041d\u0430\u0447\u0430\u0442\u044c",
      "lib.remove": "\u0423\u0434\u0430\u043b\u0438\u0442\u044c",
      "lib.fallback.course": "\u041a\u0443\u0440\u0441",
      "lib.fallback.kit": "\u0428\u043f\u0430\u0440\u0433\u0430\u043b\u043a\u0430",
      "err.saveTests": "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0443 \u0442\u0435\u0441\u0442\u043e\u0432 \u0432 localStorage (\u043d\u0435\u0442 \u043c\u0435\u0441\u0442\u0430). \u0423\u0434\u0430\u043b\u0438\u0442\u0435 \u0447\u0430\u0441\u0442\u044c \u0437\u0430\u043f\u0438\u0441\u0435\u0439 \u0438\u043b\u0438 \u043e\u0447\u0438\u0441\u0442\u0438\u0442\u0435 \u0445\u0440\u0430\u043d\u0438\u043b\u0438\u0449\u0435 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430. \u0422\u0435\u043a\u0443\u0449\u0430\u044f \u0441\u0435\u0441\u0441\u0438\u044f \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430 \u0432 \u043f\u0430\u043c\u044f\u0442\u0438.",
      "err.saveCourses": "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0443 \u043a\u0443\u0440\u0441\u043e\u0432 \u0432 localStorage (\u043d\u0435\u0442 \u043c\u0435\u0441\u0442\u0430). \u0423\u0434\u0430\u043b\u0438\u0442\u0435 \u0447\u0430\u0441\u0442\u044c \u0437\u0430\u043f\u0438\u0441\u0435\u0439 \u0438\u043b\u0438 \u043e\u0447\u0438\u0441\u0442\u0438\u0442\u0435 \u0445\u0440\u0430\u043d\u0438\u043b\u0438\u0449\u0435 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430. \u0422\u0435\u043a\u0443\u0449\u0430\u044f \u0441\u0435\u0441\u0441\u0438\u044f \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430 \u0432 \u043f\u0430\u043c\u044f\u0442\u0438.",
      "err.saveKits": "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0443 \u0448\u043f\u0430\u0440\u0433\u0430\u043b\u043e\u043a \u0432 localStorage (\u043d\u0435\u0442 \u043c\u0435\u0441\u0442\u0430). \u0423\u0434\u0430\u043b\u0438\u0442\u0435 \u0447\u0430\u0441\u0442\u044c \u0437\u0430\u043f\u0438\u0441\u0435\u0439 \u0438\u043b\u0438 \u043e\u0447\u0438\u0441\u0442\u0438\u0442\u0435 \u0445\u0440\u0430\u043d\u0438\u043b\u0438\u0449\u0435 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430.",
      "err.testsCorrupted": "\u0421\u043e\u0445\u0440\u0430\u043d\u0451\u043d\u043d\u0430\u044f \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0430 \u0442\u0435\u0441\u0442\u043e\u0432 \u043f\u043e\u0432\u0440\u0435\u0436\u0434\u0435\u043d\u0430 \u0438 \u0431\u044b\u043b\u0430 \u0441\u0431\u0440\u043e\u0448\u0435\u043d\u0430. \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 JSON \u0441\u043d\u043e\u0432\u0430.",
      "err.coursesCorrupted": "\u0421\u043e\u0445\u0440\u0430\u043d\u0451\u043d\u043d\u0430\u044f \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0430 \u043a\u0443\u0440\u0441\u043e\u0432 \u043f\u043e\u0432\u0440\u0435\u0436\u0434\u0435\u043d\u0430 \u0438 \u0431\u044b\u043b\u0430 \u0441\u0431\u0440\u043e\u0448\u0435\u043d\u0430. \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 JSON \u0441\u043d\u043e\u0432\u0430.",
      "err.kitsCorrupted": "\u0421\u043e\u0445\u0440\u0430\u043d\u0451\u043d\u043d\u0430\u044f \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0430 \u0448\u043f\u0430\u0440\u0433\u0430\u043b\u043e\u043a \u043f\u043e\u0432\u0440\u0435\u0436\u0434\u0435\u043d\u0430 \u0438 \u0431\u044b\u043b\u0430 \u0441\u0431\u0440\u043e\u0448\u0435\u043d\u0430. \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 JSON \u0441\u043d\u043e\u0432\u0430.",
      "err.minutesInvalid": "\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0446\u0435\u043b\u043e\u0435 \u0447\u0438\u0441\u043b\u043e \u043c\u0438\u043d\u0443\u0442 \u2265 1 \u0438\u043b\u0438 \u043e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u043f\u043e\u043b\u0435 \u043f\u0443\u0441\u0442\u044b\u043c.",
      "err.noAnswer": "\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0438\u043b\u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043e\u0442\u0432\u0435\u0442 (\u0438\u043b\u0438 \u043f\u0440\u043e\u043f\u0443\u0441\u0442\u0438\u0442\u0435).",
      "err.unsupportedType": "\u041d\u0435\u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043c\u044b\u0439 \u0442\u0438\u043f \u0432\u043e\u043f\u0440\u043e\u0441\u0430: {type}",
      "err.meta.profile": "\u043f\u0440\u043e\u0444\u0438\u043b\u044c: {v}",
      "err.meta.level": "\u0443\u0440\u043e\u0432\u0435\u043d\u044c: {v}",
      "err.meta.threshold": "\u043f\u043e\u0440\u043e\u0433: {v}",
      "err.meta.questions": "{n} \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432",
      "err.saveTestsMsg": "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0443 \u0442\u0435\u0441\u0442\u043e\u0432: {msg}",
      "err.saveCoursesMsg": "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0443 \u043a\u0443\u0440\u0441\u043e\u0432: {msg}",
      "err.saveKitsMsg": "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0443 \u0448\u043f\u0430\u0440\u0433\u0430\u043b\u043e\u043a: {msg}",
      "err.loadUrl": "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c {label}",
      "err.loadError": "{file}: {msg}",
      "err.loadError.file": "\u0444\u0430\u0439\u043b",
      "err.noSchema": "\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d schemaVersion. \u041e\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044f {test}, {course} \u0438\u043b\u0438 {kit}.",
      "err.badSchema": "\u041d\u0435\u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043c\u044b\u0439 schemaVersion \"{version}\". \u041e\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044f {test}, {course} \u0438\u043b\u0438 {kit}.",
      "meta.count.module": "\u043c\u043e\u0434\u0443\u043b\u044c",
      "meta.count.modules": "\u043c\u043e\u0434\u0443\u043b\u044f",
      "meta.count.modulesMany": "\u043c\u043e\u0434\u0443\u043b\u0435\u0439",
      "meta.count.lesson": "\u0443\u0440\u043e\u043a",
      "meta.count.lessons": "\u0443\u0440\u043e\u043a\u0430",
      "meta.count.lessonsMany": "\u0443\u0440\u043e\u043a\u043e\u0432",
      "meta.count.probe": "\u043f\u0440\u043e\u0431\u0430",
      "meta.count.probes": "\u043f\u0440\u043e\u0431\u044b",
      "meta.count.probesMany": "\u043f\u0440\u043e\u0431",
      "meta.count.question": "\u0432\u043e\u043f\u0440\u043e\u0441",
      "meta.count.questions": "\u0432\u043e\u043f\u0440\u043e\u0441\u0430",
      "meta.count.course": "\u043a\u0443\u0440\u0441",
      "practice.title": "\u041f\u0440\u0430\u043a\u0442\u0438\u043a\u0430",
      "practice.fromCourse": "{n} \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432 \u00b7 \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0430 \u0438\u0437 \u043a\u0443\u0440\u0441\u0430",
      "course.about": "\u041e \u043a\u0443\u0440\u0441\u0435",
      "course.module": "\u041c\u043e\u0434\u0443\u043b\u044c {n}",
      "course.lesson": "\u0423\u0440\u043e\u043a {n}",
      "course.noLessons": "\u041d\u0435\u0442 \u0443\u0440\u043e\u043a\u043e\u0432",
      "course.noLessonsBody": "\u0412 \u044d\u0442\u043e\u043c \u043a\u0443\u0440\u0441\u0435 \u043d\u0435\u0442 \u0443\u0440\u043e\u043a\u043e\u0432 \u0434\u043b\u044f \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430.",
      "course.noLessonText": "\u041d\u0435\u0442 \u0442\u0435\u043a\u0441\u0442\u0430 \u0443\u0440\u043e\u043a\u0430 (\u043f\u0443\u0441\u0442\u043e\u0439 body \u2014 \u0435\u0449\u0451 \u043d\u0435 \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u043d\u044b\u0439 brief).",
      "course.warningsOnlyAuthor": "\u0421\u043f\u0438\u0441\u043e\u043a \u0434\u043e\u0440\u0430\u0431\u043e\u0442\u043e\u043a \u043d\u0438\u0436\u0435. \u041e\u043d\u0438 \u0432\u0438\u0434\u043d\u044b \u0442\u043e\u043b\u044c\u043a\u043e \u0430\u0432\u0442\u043e\u0440\u0443 \u043a\u0443\u0440\u0441\u0430.",
      "course.footnotes": "\u0421\u043d\u043e\u0441\u043a\u0438",
      "course.terms": "\u0422\u0435\u0440\u043c\u0438\u043d\u044b \u043a\u0443\u0440\u0441\u0430",
      "course.termsIntro": "\u041f\u043e\u043b\u043d\u044b\u0439 \u0441\u043f\u0438\u0441\u043e\u043a \u0442\u0435\u0440\u043c\u0438\u043d\u043e\u0432 \u043a\u0443\u0440\u0441\u0430. \u0412 \u043e\u0431\u044b\u0447\u043d\u044b\u0445 \u0443\u0440\u043e\u043a\u0430\u0445 \u043d\u0438\u0436\u0435 \u0442\u0435\u043a\u0441\u0442\u0430 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u044e\u0442\u0441\u044f \u0442\u043e\u043b\u044c\u043a\u043e \u0441\u043d\u043e\u0441\u043a\u0438 \u043f\u043e \u0442\u0435\u0440\u043c\u0438\u043d\u0430\u043c \u044d\u0442\u043e\u0433\u043e \u0440\u0430\u0437\u0434\u0435\u043b\u0430.",
      "course.ref": "\u0421\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a",
      "course.rerework": "\u0414\u043e\u0440\u0430\u0431\u043e\u0442\u043a\u0438",
      "course.rereworkTitle": "\u0414\u043e\u0440\u0430\u0431\u043e\u0442\u043a\u0438 \u043a\u0443\u0440\u0441\u0430",
      "course.warningsBadge": "\u0414\u043e\u0440\u0430\u0431\u043e\u0442\u043a\u0438: {n}",
      "course.warningsTitle": "\u0414\u043e\u0440\u0430\u0431\u043e\u0442\u043a\u0438 \u043a\u0443\u0440\u0441\u0430 ({n})",
      "course.warningsLead": "\u0422\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u0437\u0430\u043c\u0435\u0447\u0430\u043d\u0438\u044f \u0434\u043b\u044f \u0430\u0432\u0442\u043e\u0440\u0430, \u043d\u0435 \u0434\u043b\u044f \u0447\u0438\u0442\u0430\u0442\u0435\u043b\u044f.",
      "course.practice": "\u041f\u0440\u0430\u043a\u0442\u0438\u043a\u0430 \u043c\u043e\u0434\u0443\u043b\u044f",
      "course.practiceIds": "\u0412\u043e\u043f\u0440\u043e\u0441\u044b \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0438 ({n})",
      "course.practiceRun": "\u041f\u0440\u043e\u0439\u0442\u0438 \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0443 ({n})",
      "course.practiceNeedTest": "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 paired {code}export test{/code} \u043d\u0430 \u0432\u043a\u043b\u0430\u0434\u043a\u0435 \u0422\u0435\u0441\u0442\u044b, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u043e\u0439\u0442\u0438 \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0443 \u0437\u0434\u0435\u0441\u044c.",
      "course.practiceFromLibrary": "{n} \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432 \u0438\u0437 library",
      "course.noModules": "\u0412 \u043a\u0443\u0440\u0441\u0435 \u043d\u0435\u0442 \u043c\u043e\u0434\u0443\u043b\u0435\u0439 \u0438\u043b\u0438 \u0443\u0440\u043e\u043a\u043e\u0432.",
      "kit.title": "\u0428\u043f\u0430\u0440\u0433\u0430\u043b\u043a\u0430",
      "kit.revision": "\u0440\u0435\u0432\u0438\u0437\u0438\u044f {n}",
      "kit.warnHead": "\u0427\u0442\u043e \u0434\u043e\u0440\u0430\u0431\u043e\u0442\u0430\u0442\u044c \u0432 \u044d\u0442\u0430\u043b\u043e\u043d\u0435",
      "kit.warnLead": "\u0418\u0441\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0432 YAML, \u043d\u0435 \u0432 HTML. \u042d\u043a\u0441\u043f\u043e\u0440\u0442 \u043d\u0435 \u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d.",
      "kit.warnNoProbe": "\u041d\u0435\u0442 \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432 \u0434\u043b\u044f \u0438\u043d\u0442\u0435\u0440\u0432\u044c\u044e\u0435\u0440\u0430: \u00ab{skill}\u00bb",
      "kit.warnNoProbeDetail": "\u0428\u043f\u0430\u0440\u0433\u0430\u043b\u043a\u0430 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u0442\u043e\u043b\u044c\u043a\u043e \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0435 \u0438 \u043a\u043e\u0434\u043e\u0432\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b \u0441 \u044d\u0442\u0430\u043b\u043e\u043d\u043e\u043c. \u0422\u0435\u0441\u0442\u044b \u0441 \u0432\u0430\u0440\u0438\u0430\u043d\u0442\u0430\u043c\u0438 \u2014 \u0434\u043b\u044f \u0442\u0435\u0441\u0442\u043e\u0432\u043e\u0433\u043e \u044d\u043a\u0441\u043f\u043e\u0440\u0442\u0430.",
      "kit.warnNoProbeAction": "\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b \u0441 \u043e\u0431\u044a\u044f\u0441\u043d\u0435\u043d\u0438\u044f\u043c\u0438 \u0432 \u0411\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0443 SDM, \u0437\u0430\u0442\u0435\u043c \u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0435\u0440\u0438\u0442\u0435 \u0448\u043f\u0430\u0440\u0433\u0430\u043b\u043a\u0443.",
      "kit.warnNoRef": "\u041d\u0435\u0442 \u044d\u0442\u0430\u043b\u043e\u043d\u0430 \u0443 \u0432\u043e\u043f\u0440\u043e\u0441\u0430 {id}",
      "kit.warnNoRefDetail": "\u0414\u043e\u043f\u0438\u0448\u0438\u0442\u0435 \u043e\u0431\u044a\u044f\u0441\u043d\u0435\u043d\u0438\u0435 (\u044d\u0442\u0430\u043b\u043e\u043d \u043e\u0442\u0432\u0435\u0442\u0430) \u0443 \u043e\u0442\u043a\u0440\u044b\u0442\u043e\u0433\u043e \u0432\u043e\u043f\u0440\u043e\u0441\u0430 \u0432 \u0411\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0435 SDM.",
      "kit.warnNoSkillDesc": "\u041f\u0443\u0441\u0442\u043e\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043d\u0430\u0432\u044b\u043a\u0430 \u00ab{skill}\u00bb",
      "kit.warnNoSkillDescDetail": "\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043d\u0430\u0432\u044b\u043a\u0430 \u0432 \u043e\u043d\u0442\u043e\u043b\u043e\u0433\u0438\u0438 (ontology/).",
      "kit.emptyProbes": "\u041d\u0435\u0442 \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432 \u0434\u043b\u044f \u0438\u043d\u0442\u0435\u0440\u0432\u044c\u044e\u0435\u0440\u0430",
      "kit.needOpen": "\u041d\u0443\u0436\u043d\u044b {strong}\u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0435{/strong} \u0438\u043b\u0438 {strong}\u043a\u043e\u0434\u043e\u0432\u044b\u0435{/strong} \u0432\u043e\u043f\u0440\u043e\u0441\u044b \u0441 \u043e\u0431\u044a\u044f\u0441\u043d\u0435\u043d\u0438\u0435\u043c (\u044d\u0442\u0430\u043b\u043e\u043d \u043e\u0442\u0432\u0435\u0442\u0430), \u043a\u0430\u043a \u00ab\u041a\u0430\u043a \u043d\u0430\u0437\u044b\u0432\u0430\u044e\u0442\u2026?\u00bb",
      "kit.hasTestOnly": "\u0412 \u0411\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0435 SDM \u0443\u0436\u0435 \u0435\u0441\u0442\u044c {strong}{n}{/strong} \u0442\u0435\u0441\u0442\u043e\u0432\u044b\u0445 \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432 \u0441 \u0432\u0430\u0440\u0438\u0430\u043d\u0442\u0430\u043c\u0438 \u2014 \u043e\u043d\u0438 \u0434\u043b\u044f \u0442\u0435\u0441\u0442\u043e\u0432\u043e\u0433\u043e \u044d\u043a\u0441\u043f\u043e\u0440\u0442\u0430.",
      "kit.noQuestionsYet": "\u0412 \u0411\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0435 SDM \u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432 \u043f\u043e \u044d\u0442\u043e\u043c\u0443 \u043d\u0430\u0432\u044b\u043a\u0443.",
      "kit.addOpenAction": "\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b \u0441 \u043e\u0431\u044a\u044f\u0441\u043d\u0435\u043d\u0438\u044f\u043c\u0438 \u0432 \u0411\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0443 SDM \u0438 \u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0435\u0440\u0438\u0442\u0435 \u0448\u043f\u0430\u0440\u0433\u0430\u043b\u043a\u0443. \u041d\u0430\u0432\u044b\u043a:",
      "kit.qLabel": "\u0412\u043e\u043f\u0440\u043e\u0441 \u044d\u043a\u0441\u043f\u0435\u0440\u0442\u0443",
      "kit.covers": "\u0417\u0430\u043a\u0440\u044b\u0432\u0430\u0435\u0442:",
      "kit.reference": "\u042d\u0442\u0430\u043b\u043e\u043d:",
      "kit.expected": "\u041e\u0436\u0438\u0434\u0430\u0435\u043c\u043e\u0435:",
      "kit.rubric": "\u0420\u0443\u0431\u0440\u0438\u043a\u0430:",
      "kit.keyTopics": "\u041a\u043b\u044e\u0447\u0435\u0432\u044b\u0435 \u0442\u0435\u043c\u044b:",
      "kit.moduleFallback": "\u041c\u043e\u0434\u0443\u043b\u044c",
      "kit.meta.depth": "\u0433\u043b\u0443\u0431\u0438\u043d\u0430 {v}",
      "kit.meta.weight": "\u0432\u0435\u0441 {v}",
      "kit.glossary": "\u0413\u043b\u043e\u0441\u0441\u0430\u0440\u0438\u0439",
      "kit.term": "\u0422\u0435\u0440\u043c\u0438\u043d",
      "kit.definition": "\u041e\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435",
      "kit.checklist": "\u0427\u0435\u043a\u043b\u0438\u0441\u0442 \u0443\u0440\u043e\u0432\u043d\u044f",
      "kit.checklistIntro": "\u041e\u0442\u043c\u0435\u0442\u044c\u0442\u0435 \u043a\u0430\u0436\u0434\u044b\u0439 \u043d\u0430\u0432\u044b\u043a. {strong}\u0412\u0435\u0441{/strong} \u2014 \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442 \u0438 \u0432\u0440\u0435\u043c\u044f (\u0441\u0443\u043c\u043c\u0430 \u2248 1). {strong}\u0413\u043b\u0443\u0431\u0438\u043d\u0430 / L{/strong} \u2014 \u043d\u0430\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0436\u0451\u0441\u0442\u043a\u043e \u043a\u043e\u043f\u0430\u0442\u044c follow-up.",
      "kit.skill": "\u041d\u0430\u0432\u044b\u043a",
      "kit.depthMeaning": "L / \u0441\u043c\u044b\u0441\u043b",
      "kit.depth": "\u0413\u043b\u0443\u0431\u0438\u043d\u0430",
      "kit.weight": "\u0412\u0435\u0441",
      "kit.modules": "\u041c\u043e\u0434\u0443\u043b\u0438",
      "kit.noModulesInExports": "\u0412 exports/ \u043d\u0435\u0442 kit JSON \u0434\u043b\u044f \u044d\u0442\u043e\u0439 \u0432\u043a\u043b\u0430\u0434\u043a\u0438.",
      "kit.noCourseInExports": "\u0412 exports/ \u043d\u0435\u0442 course JSON \u0434\u043b\u044f \u044d\u0442\u043e\u0439 \u0432\u043a\u043b\u0430\u0434\u043a\u0438 (\u0435\u0441\u0442\u044c \u0442\u0435\u0441\u0442\u044b \u2014 \u043f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0438\u0442\u0435\u0441\u044c \u043d\u0430 \u0422\u0435\u0441\u0442\u044b).",
      "kit.noTestInExports": "\u0412 exports/ \u043d\u0435\u0442 test JSON \u0434\u043b\u044f \u044d\u0442\u043e\u0439 \u0432\u043a\u043b\u0430\u0434\u043a\u0438 (\u0435\u0441\u0442\u044c \u043a\u0443\u0440\u0441\u044b \u2014 \u043f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0438\u0442\u0435\u0441\u044c \u043d\u0430 \u041a\u0443\u0440\u0441\u044b).",
      "kit.exports.kits": "\u0428\u043f\u0430\u0440\u0433\u0430\u043b\u043a\u0438 \u0432 exports/",
      "kit.exports.courses": "\u041a\u0443\u0440\u0441\u044b \u0432 exports/",
      "kit.exports.tests": "\u0422\u0435\u0441\u0442\u044b \u0432 exports/",
      "test.feedback.correct": "\u0412\u0435\u0440\u043d\u043e.",
      "test.feedback.incorrect": "\u041d\u0435\u0432\u0435\u0440\u043d\u043e.",
      "test.feedback.skipped": "\u041f\u0440\u043e\u043f\u0443\u0449\u0435\u043d\u043e.",
      "test.feedback.unscored": "\u0417\u0430\u043f\u0438\u0441\u0430\u043d\u043e \u0431\u0435\u0437 \u0430\u0432\u0442\u043e\u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0438.",
      "test.placeholder.open": "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043a\u043e\u0440\u043e\u0442\u043a\u0438\u0439 \u043e\u0442\u0432\u0435\u0442\u2026",
      "test.placeholder.code": "\u0417\u0430\u043c\u0435\u0442\u043a\u0438 (\u043a\u043e\u0434 \u043d\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0435\u0442\u0441\u044f \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438)\u2026",
      "test.criteria": "\u041a\u0440\u0438\u0442\u0435\u0440\u0438\u0438 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0438",
      "test.difficulty": "\u0441\u043b\u043e\u0436\u043d\u043e\u0441\u0442\u044c {v}",
      "test.emptyText": "(\u043f\u0443\u0441\u0442\u043e\u0439 \u0442\u0435\u043a\u0441\u0442 \u0432\u043e\u043f\u0440\u043e\u0441\u0430)",
      "test.stats.correct": "\u0412\u0435\u0440\u043d\u043e",
      "test.stats.incorrect": "\u041d\u0435\u0432\u0435\u0440\u043d\u043e",
      "test.stats.skipped": "\u041f\u0440\u043e\u043f\u0443\u0441\u043a",
      "test.stats.unscored": "\u0411\u0435\u0437 \u043e\u0446\u0435\u043d\u043a\u0438",
      "test.stats.percent": "\u041f\u0440\u043e\u0446\u0435\u043d\u0442",
      "test.stats.weighted": "\u0412\u0437\u0432\u0435\u0448\u0435\u043d\u043d\u044b\u0439",
      "test.stats.summary.timeUp": "\u0432\u0440\u0435\u043c\u044f \u0432\u044b\u0448\u043b\u043e",
      "test.stats.summary.score": "{correct} \u0432\u0435\u0440\u043d\u043e / {scored} \u0441 \u043e\u0446\u0435\u043d\u043a\u043e\u0439 ({pct}%)",
      "test.stats.summary.skipped": "{n} \u043f\u0440\u043e\u043f\u0443\u0449\u0435\u043d\u043e",
      "test.stats.summary.unscored": "{n} \u0431\u0435\u0437 \u043e\u0446\u0435\u043d\u043a\u0438",
      "test.stats.summary.weighted": "\u0432\u0437\u0432\u0435\u0448\u0435\u043d\u043d\u044b\u0439 \u0431\u0430\u043b\u043b {v}",
      "test.stats.summary.threshold": "\u0432\u0437\u0432\u0435\u0448\u0435\u043d\u043d\u044b\u0439 {v} \u043f\u0440\u0438 \u043f\u043e\u0440\u043e\u0433\u0435 {t} \u2192 {result}",
      "test.stats.result.pass": "\u043f\u043e\u0440\u043e\u0433 \u043f\u0440\u043e\u0439\u0434\u0435\u043d",
      "test.stats.result.fail": "\u043d\u0438\u0436\u0435 \u043f\u043e\u0440\u043e\u0433\u0430",

      "nav.home": "Главная",
      "load.title": "Загрузить JSON экспорта",
      "load.tabs.label": "Тип экспорта",
      "load.tab.tests": "Тесты",
      "load.tab.courses": "Курсы",
      "load.tab.kits": "Шпаргалки",
      "load.exports.heading": "Файлы в exports/",
      "load.dropzone": "Перетащите файлы сюда или нажмите, чтобы выбрать (можно несколько)",
      "load.options": "Параметры сессии",
      "load.opt.autonext": "Автопереход после проверки (~1 с)",
      "load.opt.shuffle": "Перетасовывать вопросы",
      "load.opt.shuffleOptions": "Перетасовывать варианты",
      "load.opt.timed": "Ограничить время",
      "load.opt.minutes": "Всего минут (пусто = N × 1 мин)",
      "load.opt.minutes.placeholder": "авто",
      "course.title": "Курс",
      "course.modules": "Модули",
      "course.contents": "Содержание",
      "course.practiceHint": "Практика берётся из {code}practiceQuestionIds{/code} модуля (не из секции в тексте урока).",
      "kit.actions.home": "К библиотеке",
      "test.actions.prev": "Назад",
      "test.actions.skip": "Пропустить",
      "test.actions.check": "Проверить",
      "test.actions.next": "Далее",
      "test.actions.finish": "Завершить",
      "test.actions.home": "К библиотеке",
      "test.stats.title": "Результаты",
      "test.stats.bySkill": "По навыкам",
      "test.stats.skill": "Навык",
      "test.stats.weight": "Вес",
      "test.stats.ratio": "Доля",
      "lang.switch": "Переключить язык",
    },
  };
  let lang = (typeof localStorage !== "undefined" && localStorage.getItem("sdm.player.lang")) || "en";
  function t(key, vars) {
    const dict = UI[lang] || UI.en;
    let val = dict[key];
    if (val == null) val = UI.en[key];
    if (val == null) val = key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        val = String(val).replace(new RegExp("\\{" + k + "\\}", "g"), String(v));
      }
      val = val.replace(/\{strong\}(.*?)\{\/strong\}/g, "<strong>$1</strong>");
    }
    return val;
  }
  function setLang(next) {
    lang = next === "ru" ? "ru" : "en";
    try { localStorage.setItem("sdm.player.lang", lang); } catch { /* ignore */ }
    document.documentElement.lang = lang;
    applyI18n();
  }
  function applyI18n() {
    // Translate static HTML via data-i18n attributes
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });
    document.querySelectorAll("[data-i18n-legend]").forEach((el) => {
      el.innerText = t(el.getAttribute("data-i18n-legend"));
    });
    // Language button label: show the OTHER language to switch to
    const langBtn = document.getElementById("btn-lang");
    if (langBtn) langBtn.textContent = lang === "ru" ? "EN" : "RU";
    document.title = t("load.title") + " — SDM";
    // Re-render dynamic UI
    syncHomeUi();
    if (doc) { els.testTitle.textContent = doc.title || doc.level || t("nav.test"); }
    if (courseDoc) openCourse(courseDoc);
    if (kitDoc) openKit(kitDoc);
    if (sessionQuestions.length) renderQuestion();
  }

  const SCHEMA_TEST = "sdm.export.test/v1";
  const SCHEMA_COURSE = "sdm.export.course/v1";
  const SCHEMA_KIT = "sdm.export.kit/v1";
  const AUTO_NEXT_MS = 1000;
  const SEC_PER_QUESTION = 60;

  /**
   * Stable scope from player directory path so each methodology project
   * gets its own library keys (file:// / shared-origin safe).
   * Does not read legacy unscoped `sdm.player.exportLibrary`.
   */
  function playerStorageScope() {
    let path = typeof location !== "undefined" ? String(location.pathname || "") : "";
    try {
      path = decodeURIComponent(path);
    } catch {
      /* keep raw */
    }
    path = path.replace(/\/+$/, "");
    path = path.replace(/\/player\/index\.html$/i, "");
    path = path.replace(/\/player$/i, "");
    if (!path) path = "default";
    let h = 2166136261;
    for (let i = 0; i < path.length; i++) {
      h ^= path.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }

  const STORAGE_SCOPE = playerStorageScope();
  const STORAGE_KEYS = {
    autoNext: "sdm.player.autoNext",
    shuffleQuestions: "sdm.player.shuffleQuestions",
    shuffleOptions: "sdm.player.shuffleOptions",
    timed: "sdm.player.timed",
    minutes: "sdm.player.minutes",
    homeMode: `sdm.player.lib.${STORAGE_SCOPE}.homeMode`,
    exportLibrary: `sdm.player.lib.${STORAGE_SCOPE}.exportLibrary`,
    selectedExportId: `sdm.player.lib.${STORAGE_SCOPE}.selectedExportId`,
    courseLibrary: `sdm.player.lib.${STORAGE_SCOPE}.courseLibrary`,
    selectedCourseId: `sdm.player.lib.${STORAGE_SCOPE}.selectedCourseId`,
    kitLibrary: `sdm.player.lib.${STORAGE_SCOPE}.kitLibrary`,
    selectedKitId: `sdm.player.lib.${STORAGE_SCOPE}.selectedKitId`,
  };

  /** @typedef {'unanswered'|'correct'|'incorrect'|'skipped'|'unscored'} Outcome */
  /**
   * @typedef {{
   *   id: string,
   *   name: string,
   *   addedAt: string,
   *   document: any,
   * }} LibraryEntry
   */
  /**
   * @typedef {{
   *   flatIndex: number,
   *   moduleIndex: number,
   *   lessonIndex: number,
   *   moduleTitle: string,
   *   moduleSkill: string,
   *   moduleKind?: string,
   *   practiceQuestionIds: string[],
   *   id: string,
   *   title: string,
   *   topic?: string,
   *   body: string,
   *   footnotes?: Array<{ term?: string, definition?: string }>,
   *   isCourseGlossary?: boolean,
   * }} FlatLesson
   */

  const els = {
    loadView: document.getElementById("load-view"),
    courseView: document.getElementById("course-view"),
    runView: document.getElementById("run-view"),
    statsView: document.getElementById("stats-view"),
    navHome: document.getElementById("nav-home"),
    langBtn: document.getElementById("btn-lang"),
    crumbs: document.getElementById("crumbs"),
    crumbHome: document.getElementById("crumb-home"),
    crumbCurrent: document.getElementById("crumb-current"),
    tabTests: document.getElementById("tab-tests"),
    tabCourses: document.getElementById("tab-courses"),
    tabKits: document.getElementById("tab-kits"),
    kitView: document.getElementById("kit-view"),
    fileInput: document.getElementById("file-input"),
    dropzone: document.getElementById("dropzone"),
    dropzoneHint: document.getElementById("dropzone-hint"),
    loadError: document.getElementById("load-error"),
    exportListWrap: document.getElementById("export-list-wrap"),
    exportListHeading: document.getElementById("export-list-heading"),
    exportList: document.getElementById("export-list"),
    libraryWrap: document.getElementById("library-wrap"),
    libraryHeading: document.getElementById("library-heading"),
    libraryList: document.getElementById("library-list"),
    sessionOptions: document.getElementById("session-options"),
    optAutoNext: document.getElementById("opt-auto-next"),
    optShuffle: document.getElementById("opt-shuffle"),
    optShuffleOptions: document.getElementById("opt-shuffle-options"),
    optTimed: document.getElementById("opt-timed"),
    optMinutes: document.getElementById("opt-minutes"),
    minutesField: document.getElementById("minutes-field"),
    courseTitle: document.getElementById("course-title"),
    courseMeta: document.getElementById("course-meta"),
    courseProgress: document.getElementById("course-progress"),
    courseOutline: document.getElementById("course-outline"),
    courseLessonCrumb: document.getElementById("course-lesson-crumb"),
    courseLessonTitle: document.getElementById("course-lesson-title"),
    courseLessonBody: document.getElementById("course-lesson-body"),
    courseLessonFootnotes: document.getElementById("course-lesson-footnotes"),
    courseGlossary: document.getElementById("course-glossary"),
    coursePractice: document.getElementById("course-practice"),
    coursePracticeHint: document.getElementById("course-practice-hint"),
    courseWarnBadge: document.getElementById("course-warn-badge"),
    courseWarnings: document.getElementById("course-warnings"),
    btnCoursePrev: document.getElementById("btn-course-prev"),
    btnCourseNext: document.getElementById("btn-course-next"),
    btnCourseHome: document.getElementById("btn-course-home"),
    kitTitle: document.getElementById("kit-title"),
    kitMeta: document.getElementById("kit-meta"),
    kitRevision: document.getElementById("kit-revision"),
    kitWarnings: document.getElementById("kit-warnings"),
    kitBody: document.getElementById("kit-body"),
    btnKitHome: document.getElementById("btn-kit-home"),
    testTitle: document.getElementById("test-title"),
    testMeta: document.getElementById("test-meta"),
    progress: document.getElementById("progress"),
    timer: document.getElementById("timer"),
    timeUpBanner: document.getElementById("time-up-banner"),
    qMeta: document.getElementById("q-meta"),
    qText: document.getElementById("q-text"),
    qBody: document.getElementById("q-body"),
    feedback: document.getElementById("feedback"),
    btnPrev: document.getElementById("btn-prev"),
    btnSkip: document.getElementById("btn-skip"),
    btnCheck: document.getElementById("btn-check"),
    btnNext: document.getElementById("btn-next"),
    btnFinish: document.getElementById("btn-finish"),
    statsSummary: document.getElementById("stats-summary"),
    statsGrid: document.getElementById("stats-grid"),
    skillTable: document.querySelector("#skill-table tbody"),
  };

  /** @type {'tests'|'courses'|'kits'} */
  let homeMode = "tests";
  /** @type {LibraryEntry[]} */
  let library = [];
  /** @type {string | null} */
  let selectedExportId = null;
  /** @type {LibraryEntry[]} */
  let courseLibrary = [];
  /** @type {string | null} */
  let selectedCourseId = null;
  /** @type {LibraryEntry[]} */
  let kitLibrary = [];
  /** @type {string | null} */
  let selectedKitId = null;
  /** @type {any | null} */
  let kitDoc = null;
  /** @type {any | null} */
  let doc = null;
  /** @type {any | null} */
  let courseDoc = null;
  /** @type {FlatLesson[]} */
  let courseLessons = [];
  let courseLessonIndex = 0;
  /** @type {any[]} */
  let sessionQuestions = [];
  /** @type {Outcome[]} */
  let outcomes = [];
  /** @type {unknown[]} */
  let answers = [];
  let index = 0;
  let sessionAutoNext = false;
  let sessionTimed = false;
  let remainingMs = 0;
  let timerId = null;
  let autoNextId = null;
  let finishedByTimeout = false;
  /** @type {{ name: string, kind: 'test'|'course'|'kit', url: string }[]} */
  let discoveredExports = [];

  function updateCrumbs(view) {
    if (view === "load") {
      els.crumbs.hidden = true;
      els.crumbCurrent.textContent = "";
      return;
    }
    els.crumbs.hidden = false;
    if (view === "course") els.crumbCurrent.textContent = t("nav.course");
    else if (view === "kit") els.crumbCurrent.textContent = t("nav.kit");
    else if (view === "run") els.crumbCurrent.textContent = t("nav.test");
    else els.crumbCurrent.textContent = t("nav.stats");
  }

  function show(view) {
    els.loadView.hidden = view !== "load";
    els.courseView.hidden = view !== "course";
    els.kitView.hidden = view !== "kit";
    els.runView.hidden = view !== "run";
    els.statsView.hidden = view !== "stats";
    updateCrumbs(view);
  }

  /** Return to load screen; keep libraries so rows can restart. */
  function goHome() {
    clearAutoNext();
    clearTimer();
    finishedByTimeout = false;
    sessionQuestions = [];
    outcomes = [];
    answers = [];
    index = 0;
    courseDoc = null;
    courseLessons = [];
    courseLessonIndex = 0;
    kitDoc = null;
    setLoadError("");
    syncHomeUi();
    show("load");
  }

  function setLoadError(message) {
    if (!message) {
      els.loadError.hidden = true;
      els.loadError.textContent = "";
      return;
    }
    els.loadError.hidden = false;
    els.loadError.textContent = message;
  }

  function loadPrefs() {
    try {
      els.optAutoNext.checked = localStorage.getItem(STORAGE_KEYS.autoNext) === "1";
      els.optShuffle.checked = localStorage.getItem(STORAGE_KEYS.shuffleQuestions) === "1";
      els.optShuffleOptions.checked =
        localStorage.getItem(STORAGE_KEYS.shuffleOptions) === "1";
      els.optTimed.checked = localStorage.getItem(STORAGE_KEYS.timed) === "1";
      const mins = localStorage.getItem(STORAGE_KEYS.minutes);
      if (mins) els.optMinutes.value = mins;
      const mode = localStorage.getItem(STORAGE_KEYS.homeMode);
      if (mode === "courses" || mode === "tests" || mode === "kits") homeMode = mode;
    } catch {
      /* ignore */
    }
    syncMinutesVisibility();
  }

  function savePrefs() {
    try {
      localStorage.setItem(STORAGE_KEYS.autoNext, els.optAutoNext.checked ? "1" : "0");
      localStorage.setItem(
        STORAGE_KEYS.shuffleQuestions,
        els.optShuffle.checked ? "1" : "0",
      );
      localStorage.setItem(
        STORAGE_KEYS.shuffleOptions,
        els.optShuffleOptions.checked ? "1" : "0",
      );
      localStorage.setItem(STORAGE_KEYS.timed, els.optTimed.checked ? "1" : "0");
      localStorage.setItem(STORAGE_KEYS.minutes, els.optMinutes.value.trim());
      localStorage.setItem(STORAGE_KEYS.homeMode, homeMode);
    } catch {
      /* ignore */
    }
  }

  function setHomeMode(mode) {
    homeMode =
      mode === "courses" ? "courses" : mode === "kits" ? "kits" : "tests";
    savePrefs();
    syncHomeUi();
  }

  function syncHomeUi() {
    const isCourses = homeMode === "courses";
    const isKits = homeMode === "kits";
    if (els.tabTests) {
      els.tabTests.setAttribute(
        "aria-selected",
        !isCourses && !isKits ? "true" : "false",
      );
    }
    if (els.tabCourses) {
      els.tabCourses.setAttribute("aria-selected", isCourses ? "true" : "false");
    }
    if (els.tabKits) {
      els.tabKits.setAttribute("aria-selected", isKits ? "true" : "false");
    }
    if (els.sessionOptions) els.sessionOptions.hidden = isCourses || isKits;
    if (els.libraryHeading) {
      els.libraryHeading.textContent = isKits
        ? t("load.library.heading.kits")
        : isCourses
          ? t("load.library.heading.courses")
          : t("load.library.heading.tests");
    }
    if (els.libraryList) {
      els.libraryList.setAttribute(
        "aria-label",
        isKits
          ? t("load.library.heading.kits")
          : isCourses
            ? t("load.library.heading.courses")
            : t("load.library.heading.tests"),
      );
    }
    if (els.dropzoneHint) {
      els.dropzoneHint.textContent = isKits
        ? t("load.dropzone.kit")
        : isCourses
          ? t("load.dropzone.course")
          : t("load.dropzone.test");
    }
    syncSelectionUi();
    renderDiscoveredExports();
  }

  /** Fisher–Yates; mutates and returns `list`. */
  function shuffleInPlace(list) {
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  /** Session-local option shuffle with 1-based correct remap. */
  function shuffleQuestionOptions(question) {
    const type = question.type;
    if (type !== "single_choice" && type !== "multi_choice") return question;
    const options = Array.isArray(question.options) ? question.options.slice() : null;
    if (!options || options.length < 2 || question.correct === undefined) {
      return question;
    }
    const order = options.map((_, i) => i);
    shuffleInPlace(order);
    const shuffled = order.map((i) => options[i]);
    const oldToNew = new Map();
    for (let newIdx = 0; newIdx < order.length; newIdx += 1) {
      oldToNew.set(order[newIdx] + 1, newIdx + 1);
    }
    const corrects = Array.isArray(question.correct)
      ? question.correct
      : [question.correct];
    const remapped = corrects.map((c) => oldToNew.get(c) ?? c);
    return {
      ...question,
      options: shuffled,
      correct: Array.isArray(question.correct) ? remapped : remapped[0],
    };
  }

  function syncMinutesVisibility() {
    els.minutesField.hidden = !els.optTimed.checked;
  }

  function clearAutoNext() {
    if (autoNextId != null) {
      clearTimeout(autoNextId);
      autoNextId = null;
    }
  }

  function clearTimer() {
    if (timerId != null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function formatClock(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function updateTimerUi() {
    if (!sessionTimed) {
      els.timer.hidden = true;
      return;
    }
    els.timer.hidden = false;
    els.timer.textContent = formatClock(remainingMs);
    els.timer.classList.toggle("warn", remainingMs <= 60_000);
  }

  function startTimer() {
    clearTimer();
    if (!sessionTimed) {
      els.timer.hidden = true;
      return;
    }
    updateTimerUi();
    timerId = setInterval(() => {
      remainingMs -= 1000;
      if (remainingMs <= 0) {
        remainingMs = 0;
        updateTimerUi();
        clearTimer();
        finishedByTimeout = true;
        finish();
        return;
      }
      updateTimerUi();
    }, 1000);
  }

  function normalizeText(value) {
    return String(value ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function expectedList(expected) {
    if (expected == null) return [];
    return (Array.isArray(expected) ? expected : [expected])
      .map((v) => normalizeText(v))
      .filter(Boolean);
  }

  function asCorrectSet(correct) {
    if (correct == null) return null;
    const list = Array.isArray(correct) ? correct : [correct];
    return new Set(list.map((n) => Number(n)));
  }

  function isAutoGradable(q) {
    if (q.type === "single_choice" || q.type === "multi_choice") {
      return q.correct != null && Array.isArray(q.options) && q.options.length > 0;
    }
    if (q.type === "open") {
      return expectedList(q.expected).length > 0;
    }
    return false;
  }

  function grade(q, answer) {
    if (!isAutoGradable(q)) return "unscored";
    if (q.type === "single_choice") {
      const selected = Number(answer);
      const correct = Number(Array.isArray(q.correct) ? q.correct[0] : q.correct);
      return selected === correct ? "correct" : "incorrect";
    }
    if (q.type === "multi_choice") {
      const selected = new Set((Array.isArray(answer) ? answer : []).map(Number));
      const correct = asCorrectSet(q.correct) || new Set();
      if (selected.size !== correct.size) return "incorrect";
      for (const n of correct) {
        if (!selected.has(n)) return "incorrect";
      }
      return "correct";
    }
    if (q.type === "open") {
      const got = normalizeText(answer);
      if (!got) return "incorrect";
      return expectedList(q.expected).includes(got) ? "correct" : "incorrect";
    }
    return "unscored";
  }

  function readAnswer(q) {
    if (q.type === "single_choice") {
      const picked = els.qBody.querySelector('input[name="opt"]:checked');
      return picked ? Number(picked.value) : null;
    }
    if (q.type === "multi_choice") {
      return [...els.qBody.querySelectorAll('input[name="opt"]:checked')].map((el) =>
        Number(el.value),
      );
    }
    if (q.type === "open" || q.type === "code") {
      const area = els.qBody.querySelector("textarea");
      return area ? area.value : "";
    }
    return null;
  }

  function hasAnswer(q, answer) {
    if (q.type === "single_choice") return answer != null;
    if (q.type === "multi_choice") return Array.isArray(answer) && answer.length > 0;
    if (q.type === "open" || q.type === "code") {
      return String(answer ?? "").trim().length > 0;
    }
    return false;
  }

  function parseJsonObject(raw) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(t("err.notJson"));
    }
    if (!data || typeof data !== "object") {
      throw new Error(t("err.badDoc"));
    }
    return data;
  }

  function parseTestDocument(data) {
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error(t("err.noQuestions"));
    }
    return data;
  }

  function parseCourseDocument(data) {
    if (!Array.isArray(data.modules)) {
      throw new Error(t("err.courseNeedsModules"));
    }
    return data;
  }

  function parseKitDocument(data) {
    if (!Array.isArray(data.modules)) {
      throw new Error(t("err.kitNeedsModules"));
    }
    if (!Array.isArray(data.glossary)) {
      throw new Error(t("err.kitNeedsGlossary"));
    }
    if (!Array.isArray(data.checklist)) {
      throw new Error(t("err.kitNeedsChecklist"));
    }
    return data;
  }

  /**
   * @returns {{ kind: 'test'|'course'|'kit', document: any }}
   */
  function parseIncoming(raw) {
    let data = parseJsonObject(raw);
    // CLI --json wraps exports in an envelope { ok, document, ... }; unwrap it
    // so authors can drop `sdm export test --json` output straight in.
    if (
      data.ok === true &&
      data.document &&
      typeof data.document === "object" &&
      data.schemaVersion === undefined
    ) {
      data = data.document;
    }
    const version = data.schemaVersion;
    if (!version) {
      if (Array.isArray(data.questions)) {
        return { kind: "test", document: parseTestDocument(data) };
      }
      if (Array.isArray(data.checklist) && Array.isArray(data.modules)) {
        return { kind: "kit", document: parseKitDocument(data) };
      }
      if (Array.isArray(data.modules)) {
        return { kind: "course", document: parseCourseDocument(data) };
      }
      throw new Error(
        t("err.noSchema",{test:SCHEMA_TEST,course:SCHEMA_COURSE,kit:SCHEMA_KIT}),
      );
    }
    if (version === SCHEMA_TEST) {
      return { kind: "test", document: parseTestDocument(data) };
    }
    if (version === SCHEMA_COURSE) {
      return { kind: "course", document: parseCourseDocument(data) };
    }
    if (version === SCHEMA_KIT) {
      return { kind: "kit", document: parseKitDocument(data) };
    }
    throw new Error(
      t("err.badSchema",{version,test:SCHEMA_TEST,course:SCHEMA_COURSE,kit:SCHEMA_KIT}),
    );
  }

  function detectSchemaKind(data) {
    if (!data || typeof data !== "object") return null;
    if (data.schemaVersion === SCHEMA_KIT) return "kit";
    if (data.schemaVersion === SCHEMA_COURSE) return "course";
    if (data.schemaVersion === SCHEMA_TEST) return "test";
    if (Array.isArray(data.checklist) && Array.isArray(data.modules)) return "kit";
    if (Array.isArray(data.modules) && !Array.isArray(data.questions)) return "course";
    if (Array.isArray(data.questions)) return "test";
    return null;
  }

  function testMetaLine(data) {
    return [
      data.profile && t("err.meta.profile",{v:data.profile}),
      data.level && t("err.meta.level",{v:data.level}),
      typeof data.threshold === "number" && t("err.meta.threshold",{v:data.threshold}),
      t("err.meta.questions",{n:data.questions.length}),
    ]
      .filter(Boolean)
      .join(" · ");
  }

  /** Russian plural: 1 модуль, 2 модуля, 5 модулей */
  function ruCount(n, one, few, many) {
    const abs = Math.abs(Number(n)) % 100;
    const d = abs % 10;
    if (abs > 10 && abs < 20) return `${n} ${many}`;
    if (d === 1) return `${n} ${one}`;
    if (d >= 2 && d <= 4) return `${n} ${few}`;
    return `${n} ${many}`;
  }

  /**
   * Course packs often omit top-level `title` and put the human name on the
   * (single) module — prefer that over the bare fallback «Курс».
   */
  function resolveCourseDisplayTitle(data) {
    if (!data || typeof data !== "object") return t("lib.fallback.course");
    const top = typeof data.title === "string" ? data.title.trim() : "";
    if (top) return top;
    const modules = Array.isArray(data.modules) ? data.modules : [];
    if (modules.length === 1) {
      const modTitle =
        typeof modules[0].title === "string" ? modules[0].title.trim() : "";
      if (modTitle) return modTitle;
    }
    if (data.profile && data.level) return `${data.profile} · ${data.level}`;
    if (typeof data.level === "string" && data.level.trim()) return data.level.trim();
    for (const mod of modules) {
      if (typeof mod?.title === "string" && mod.title.trim()) return mod.title.trim();
    }
    if (typeof modules[0]?.skill === "string" && modules[0].skill.trim()) {
      return modules[0].skill.trim();
    }
    return t("lib.fallback.course");
  }

  function courseMetaLine(data) {
    const modules = Array.isArray(data.modules) ? data.modules : [];
    const lessons = modules.reduce(
      (n, m) => n + (Array.isArray(m.lessons) ? m.lessons.length : 0),
      0,
    );
    const controls = data.controls || {};
    return [
      data.profile && `профиль: ${data.profile}`,
      data.level && `уровень: ${data.level}`,
      controls.depth && `depth: ${controls.depth}`,
      controls.format && `format: ${controls.format}`,
      controls.locale && `locale: ${controls.locale}`,
      ruCount(modules.length, t("meta.count.module"), t("meta.count.modules"), t("meta.count.modulesMany")),
      ruCount(lessons, t("meta.count.lesson"), t("meta.count.lessons"), t("meta.count.lessonsMany")),
    ]
      .filter(Boolean)
      .join(" · ");
  }

  function resolveKitDisplayTitle(data) {
    if (!data || typeof data !== "object") return t("lib.fallback.kit");
    const top = typeof data.title === "string" ? data.title.trim() : "";
    if (top) return top;
    if (data.profile && data.level) return `${data.profile} · ${data.level}`;
    return t("lib.fallback.kit");
  }

  function kitMetaLine(data) {
    const modules = Array.isArray(data.modules) ? data.modules : [];
    const probeCount = modules.reduce(
      (n, m) => n + (Array.isArray(m.probes) ? m.probes.length : 0),
      0,
    );
    return [
      data.profile && `профиль: ${data.profile}`,
      data.level && `уровень: ${data.level}`,
      ruCount(modules.length, t("meta.count.module"), t("meta.count.modules"), t("meta.count.modulesMany")),
      ruCount(probeCount, t("meta.count.probe"), t("meta.count.probes"), t("meta.count.probesMany")),
    ]
      .filter(Boolean)
      .join(" · ");
  }

  function newEntryId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function persistSelectedTestId() {
    try {
      if (selectedExportId) {
        localStorage.setItem(STORAGE_KEYS.selectedExportId, selectedExportId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.selectedExportId);
      }
    } catch {
      /* ignore */
    }
  }

  function persistSelectedCourseId() {
    try {
      if (selectedCourseId) {
        localStorage.setItem(STORAGE_KEYS.selectedCourseId, selectedCourseId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.selectedCourseId);
      }
    } catch {
      /* ignore */
    }
  }

  function persistSelectedKitId() {
    try {
      if (selectedKitId) {
        localStorage.setItem(STORAGE_KEYS.selectedKitId, selectedKitId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.selectedKitId);
      }
    } catch {
      /* ignore */
    }
  }

  /** @returns {boolean} false when localStorage write failed */
  function persistTestLibrary() {
    try {
      localStorage.setItem(STORAGE_KEYS.exportLibrary, JSON.stringify(library));
      persistSelectedTestId();
      return true;
    } catch (err) {
      const quota =
        err &&
        (err.name === "QuotaExceededError" ||
          err.code === 22 ||
          err.code === 1014);
      if (quota) {
        setLoadError(
          t("err.saveTests"),
        );
      } else {
        setLoadError(
          t("err.saveTestsMsg",{msg:err?.message||String(err)}),
        );
      }
      return false;
    }
  }

  /** @returns {boolean} */
  function persistCourseLibrary() {
    try {
      localStorage.setItem(STORAGE_KEYS.courseLibrary, JSON.stringify(courseLibrary));
      persistSelectedCourseId();
      return true;
    } catch (err) {
      const quota =
        err &&
        (err.name === "QuotaExceededError" ||
          err.code === 22 ||
          err.code === 1014);
      if (quota) {
        setLoadError(
          t("err.saveCourses"),
        );
      } else {
        setLoadError(
          t("err.saveCoursesMsg",{msg:err?.message||String(err)}),
        );
      }
      return false;
    }
  }

  /** @returns {boolean} */
  function persistKitLibrary() {
    try {
      localStorage.setItem(STORAGE_KEYS.kitLibrary, JSON.stringify(kitLibrary));
      persistSelectedKitId();
      return true;
    } catch (err) {
      const quota =
        err &&
        (err.name === "QuotaExceededError" ||
          err.code === 22 ||
          err.code === 1014);
      if (quota) {
        setLoadError(
          t("err.saveKits"),
        );
      } else {
        setLoadError(
          t("err.saveKitsMsg",{msg:err?.message||String(err)}),
        );
      }
      return false;
    }
  }

  function loadTestLibraryFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.exportLibrary);
      if (!raw) {
        library = [];
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error("not an array");
      }
      library = parsed
        .filter(
          (e) =>
            e &&
            typeof e === "object" &&
            typeof e.id === "string" &&
            typeof e.name === "string" &&
            e.document &&
            typeof e.document === "object" &&
            Array.isArray(e.document.questions),
        )
        .map((e) => ({
          id: e.id,
          name: e.name,
          addedAt: typeof e.addedAt === "string" ? e.addedAt : new Date().toISOString(),
          document: e.document,
        }));
      if (library.length !== parsed.length) {
        persistTestLibrary();
      }
    } catch {
      library = [];
      try {
        localStorage.removeItem(STORAGE_KEYS.exportLibrary);
      } catch {
        /* ignore */
      }
      setLoadError(
        t("err.testsCorrupted"),
      );
    }

    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.selectedExportId);
      if (savedId && library.some((e) => e.id === savedId)) {
        selectedExportId = savedId;
      } else {
        selectedExportId = library.length > 0 ? library[library.length - 1].id : null;
        persistSelectedTestId();
      }
    } catch {
      selectedExportId = library.length > 0 ? library[library.length - 1].id : null;
    }
  }

  function loadCourseLibraryFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.courseLibrary);
      if (!raw) {
        courseLibrary = [];
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error("not an array");
      }
      courseLibrary = parsed
        .filter(
          (e) =>
            e &&
            typeof e === "object" &&
            typeof e.id === "string" &&
            typeof e.name === "string" &&
            e.document &&
            typeof e.document === "object" &&
            Array.isArray(e.document.modules) &&
            e.document.schemaVersion !== SCHEMA_KIT &&
            !Array.isArray(e.document.checklist),
        )
        .map((e) => ({
          id: e.id,
          name: e.name,
          addedAt: typeof e.addedAt === "string" ? e.addedAt : new Date().toISOString(),
          document: e.document,
        }));
      if (courseLibrary.length !== parsed.length) {
        persistCourseLibrary();
      }
    } catch {
      courseLibrary = [];
      try {
        localStorage.removeItem(STORAGE_KEYS.courseLibrary);
      } catch {
        /* ignore */
      }
      setLoadError(
        t("err.coursesCorrupted"),
      );
    }

    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.selectedCourseId);
      if (savedId && courseLibrary.some((e) => e.id === savedId)) {
        selectedCourseId = savedId;
      } else {
        selectedCourseId =
          courseLibrary.length > 0 ? courseLibrary[courseLibrary.length - 1].id : null;
        persistSelectedCourseId();
      }
    } catch {
      selectedCourseId =
        courseLibrary.length > 0 ? courseLibrary[courseLibrary.length - 1].id : null;
    }
  }

  function loadKitLibraryFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.kitLibrary);
      if (!raw) {
        kitLibrary = [];
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error("not an array");
      }
      kitLibrary = parsed
        .filter(
          (e) =>
            e &&
            typeof e === "object" &&
            typeof e.id === "string" &&
            typeof e.name === "string" &&
            e.document &&
            typeof e.document === "object" &&
            Array.isArray(e.document.modules) &&
            (e.document.schemaVersion === SCHEMA_KIT ||
              Array.isArray(e.document.checklist)),
        )
        .map((e) => ({
          id: e.id,
          name: e.name,
          addedAt: typeof e.addedAt === "string" ? e.addedAt : new Date().toISOString(),
          document: e.document,
        }));
      if (kitLibrary.length !== parsed.length) {
        persistKitLibrary();
      }
    } catch {
      kitLibrary = [];
      try {
        localStorage.removeItem(STORAGE_KEYS.kitLibrary);
      } catch {
        /* ignore */
      }
      setLoadError(
        t("err.kitsCorrupted"),
      );
    }

    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.selectedKitId);
      if (savedId && kitLibrary.some((e) => e.id === savedId)) {
        selectedKitId = savedId;
      } else {
        selectedKitId =
          kitLibrary.length > 0 ? kitLibrary[kitLibrary.length - 1].id : null;
        persistSelectedKitId();
      }
    } catch {
      selectedKitId =
        kitLibrary.length > 0 ? kitLibrary[kitLibrary.length - 1].id : null;
    }
  }

  function findTestEntry(id) {
    return library.find((e) => e.id === id) || null;
  }

  function findCourseEntry(id) {
    return courseLibrary.find((e) => e.id === id) || null;
  }

  function findKitEntry(id) {
    return kitLibrary.find((e) => e.id === id) || null;
  }

  function syncSelectionUi() {
    if (homeMode === "courses") {
      const entry = selectedCourseId ? findCourseEntry(selectedCourseId) : null;
      courseDoc = entry ? entry.document : null;
    } else if (homeMode === "kits") {
      const entry = selectedKitId ? findKitEntry(selectedKitId) : null;
      kitDoc = entry ? entry.document : null;
    } else {
      const entry = selectedExportId ? findEntry(selectedExportId) : null;
      doc = entry ? entry.document : null;
    }
    renderLibraryList();
  }

  function findEntry(id) {
    return findTestEntry(id);
  }

  function renderLibraryList() {
    if (!els.libraryList || !els.libraryWrap) return;
    els.libraryList.innerHTML = "";
    const entries =
      homeMode === "courses"
        ? courseLibrary
        : homeMode === "kits"
          ? kitLibrary
          : library;
    if (entries.length === 0) {
      els.libraryWrap.hidden = true;
      return;
    }
    els.libraryWrap.hidden = false;
    const selectedId =
      homeMode === "courses"
        ? selectedCourseId
        : homeMode === "kits"
          ? selectedKitId
          : selectedExportId;
    for (const entry of entries) {
      const li = document.createElement("li");
      li.className = "library-item";
      if (entry.id === selectedId) li.classList.add("selected");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", entry.id === selectedId ? "true" : "false");
      li.tabIndex = 0;
      li.addEventListener("click", () => selectEntry(entry.id));
      li.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          selectEntry(entry.id);
        }
      });

      const main = document.createElement("div");
      main.className = "library-item-main";

      const title = document.createElement("p");
      title.className = "library-item-title";
      title.textContent =
        homeMode === "kits"
          ? resolveKitDisplayTitle(entry.document) || entry.name || t("lib.fallback.kit")
          : homeMode === "courses"
            ? resolveCourseDisplayTitle(entry.document) || entry.name || t("lib.fallback.course")
            : entry.document.title || entry.document.level || entry.name || t("nav.test");

      const meta = document.createElement("p");
      meta.className = "library-item-meta";
      meta.textContent =
        homeMode === "kits"
          ? kitMetaLine(entry.document)
          : homeMode === "courses"
            ? courseMetaLine(entry.document)
            : testMetaLine(entry.document);

      const name = document.createElement("p");
      name.className = "library-item-name";
      name.textContent = entry.name;

      main.append(title, meta, name);

      const actions = document.createElement("div");
      actions.className = "library-item-actions";

      const start = document.createElement("button");
      start.type = "button";
      start.className = "library-item-start";
      start.textContent =
        homeMode === "courses" || homeMode === "kits" ? t("lib.open") : t("lib.start");
      start.addEventListener("click", (ev) => {
        ev.stopPropagation();
        startEntry(entry.id);
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "library-item-remove";
      remove.textContent = t("lib.remove");
      remove.addEventListener("click", (ev) => {
        ev.stopPropagation();
        removeEntry(entry.id);
      });

      actions.append(start, remove);
      li.append(main, actions);
      els.libraryList.append(li);
    }
  }

  function selectEntry(id) {
    if (homeMode === "courses") {
      if (!findCourseEntry(id)) return;
      selectedCourseId = selectedCourseId === id ? null : id;
      persistSelectedCourseId();
    } else if (homeMode === "kits") {
      if (!findKitEntry(id)) return;
      selectedKitId = selectedKitId === id ? null : id;
      persistSelectedKitId();
    } else {
      if (!findTestEntry(id)) return;
      selectedExportId = selectedExportId === id ? null : id;
      persistSelectedTestId();
    }
    syncSelectionUi();
  }

  function startEntry(id) {
    if (homeMode === "kits") {
      const entry = findKitEntry(id);
      if (!entry) return;
      selectedKitId = id;
      persistSelectedKitId();
      syncSelectionUi();
      openKit(entry.document);
      return;
    }
    if (homeMode === "courses") {
      const entry = findCourseEntry(id);
      if (!entry) return;
      selectedCourseId = id;
      persistSelectedCourseId();
      syncSelectionUi();
      openCourse(entry.document);
      return;
    }
    const entry = findTestEntry(id);
    if (!entry) return;
    selectedExportId = id;
    doc = entry.document;
    sessionQuestions = [];
    outcomes = [];
    answers = [];
    index = 0;
    finishedByTimeout = false;
    clearAutoNext();
    clearTimer();
    setLoadError("");
    persistSelectedTestId();
    syncSelectionUi();
    startSession();
  }

  function removeEntry(id) {
    if (homeMode === "kits") {
      kitLibrary = kitLibrary.filter((e) => e.id !== id);
      if (selectedKitId === id) selectedKitId = null;
      persistKitLibrary();
    } else if (homeMode === "courses") {
      courseLibrary = courseLibrary.filter((e) => e.id !== id);
      if (selectedCourseId === id) selectedCourseId = null;
      persistCourseLibrary();
    } else {
      library = library.filter((e) => e.id !== id);
      if (selectedExportId === id) selectedExportId = null;
      persistTestLibrary();
    }
    syncSelectionUi();
  }

  /**
   * @param {{ name: string, document: any, kind: 'test'|'course'|'kit' }} param0
   */
  function upsertLibraryEntry({ name, document: data, kind }) {
    const sourceName = String(name || "export.json").trim() || "export.json";
    if (kind === "kit") {
      homeMode = "kits";
      savePrefs();
      const existing = kitLibrary.find((e) => e.name === sourceName);
      let entry;
      if (existing) {
        existing.document = data;
        existing.addedAt = new Date().toISOString();
        entry = existing;
      } else {
        entry = {
          id: newEntryId(),
          name: sourceName,
          addedAt: new Date().toISOString(),
          document: data,
        };
        kitLibrary.push(entry);
      }
      selectedKitId = entry.id;
      persistKitLibrary();
    } else if (kind === "course") {
      homeMode = "courses";
      savePrefs();
      const existing = courseLibrary.find((e) => e.name === sourceName);
      let entry;
      if (existing) {
        existing.document = data;
        existing.addedAt = new Date().toISOString();
        entry = existing;
      } else {
        entry = {
          id: newEntryId(),
          name: sourceName,
          addedAt: new Date().toISOString(),
          document: data,
        };
        courseLibrary.push(entry);
      }
      selectedCourseId = entry.id;
      persistCourseLibrary();
    } else {
      homeMode = "tests";
      savePrefs();
      const existing = library.find((e) => e.name === sourceName);
      let entry;
      if (existing) {
        existing.document = data;
        existing.addedAt = new Date().toISOString();
        entry = existing;
      } else {
        entry = {
          id: newEntryId(),
          name: sourceName,
          addedAt: new Date().toISOString(),
          document: data,
        };
        library.push(entry);
      }
      selectedExportId = entry.id;
      sessionQuestions = [];
      outcomes = [];
      answers = [];
      index = 0;
      finishedByTimeout = false;
      clearAutoNext();
      clearTimer();
      persistTestLibrary();
    }
    setLoadError("");
    syncHomeUi();
    show("load");
  }

  async function loadFile(file) {
    const text = await file.text();
    const parsed = parseIncoming(text);
    upsertLibraryEntry({
      name: file.name || "export.json",
      document: parsed.document,
      kind: parsed.kind,
    });
  }

  async function loadFiles(fileList) {
    const files = [...(fileList || [])];
    if (files.length === 0) return;
    const errors = [];
    for (const file of files) {
      try {
        await loadFile(file);
      } catch (err) {
        errors.push(t("err.loadError",{file:file.name||t("err.loadError.file"),msg:err.message||String(err)}));
      }
    }
    if (errors.length) {
      setLoadError(errors.join("\n"));
    }
  }

  async function loadUrl(url, label) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(t("err.loadUrl",{label:label||url}));
    const text = await res.text();
    const parsed = parseIncoming(text);
    upsertLibraryEntry({
      name: label || url.split("/").pop() || "export.json",
      document: parsed.document,
      kind: parsed.kind,
    });
  }

  function computeBudgetMs(questionCount) {
    const raw = els.optMinutes.value.trim();
    if (raw) {
      const mins = Number(raw);
      if (!Number.isFinite(mins) || mins < 1) {
        throw new Error(t("err.minutesInvalid"));
      }
      return Math.round(mins * 60_000);
    }
    return questionCount * SEC_PER_QUESTION * 1000;
  }

  function startSession() {
    if (!doc) return;
    try {
      savePrefs();
      sessionAutoNext = els.optAutoNext.checked;
      sessionTimed = els.optTimed.checked;
      sessionQuestions = doc.questions.map((q) =>
        els.optShuffleOptions.checked ? shuffleQuestionOptions({ ...q }) : { ...q },
      );
      if (els.optShuffle.checked) shuffleInPlace(sessionQuestions);
      remainingMs = sessionTimed ? computeBudgetMs(sessionQuestions.length) : 0;
    } catch (err) {
      setLoadError(err.message || String(err));
      return;
    }

    outcomes = sessionQuestions.map(() => "unanswered");
    answers = sessionQuestions.map(() => null);
    index = 0;
    finishedByTimeout = false;
    els.testTitle.textContent = doc.title || doc.level || t("nav.test");
    els.testMeta.textContent = testMetaLine(doc);
    show("run");
    startTimer();
    renderQuestion();
  }

  /**
   * Start a filtered practice session from resolved question objects.
   * @param {any[]} questions
   * @param {string} title
   */
  function startPracticeSession(questions, title) {
    if (!questions.length) return;
    const practiceDoc = {
      schemaVersion: SCHEMA_TEST,
      title: title || t("practice.title"),
      profile: courseDoc?.profile,
      level: courseDoc?.level,
      threshold: null,
      questions,
      requirements: [],
    };
    doc = practiceDoc;
    homeMode = "tests";
    savePrefs();
    try {
      sessionAutoNext = els.optAutoNext.checked;
      sessionTimed = false;
      sessionQuestions = questions.map((q) =>
        els.optShuffleOptions.checked ? shuffleQuestionOptions({ ...q }) : { ...q },
      );
      if (els.optShuffle.checked) shuffleInPlace(sessionQuestions);
      remainingMs = 0;
    } catch (err) {
      setLoadError(err.message || String(err));
      return;
    }
    outcomes = sessionQuestions.map(() => "unanswered");
    answers = sessionQuestions.map(() => null);
    index = 0;
    finishedByTimeout = false;
    clearAutoNext();
    clearTimer();
    els.testTitle.textContent = practiceDoc.title;
    els.testMeta.textContent = [
      practiceDoc.profile && t("err.meta.profile",{v:practiceDoc.profile}),
      practiceDoc.level && t("err.meta.level",{v:practiceDoc.level}),
      t("practice.fromCourse",{n:sessionQuestions.length}),
    ]
      .filter(Boolean)
      .join(" · ");
    show("run");
    renderQuestion();
  }

  function flattenCourseLessons(data) {
    /** @type {FlatLesson[]} */
    const flat = [];
    const modules = Array.isArray(data.modules) ? data.modules : [];
    // Prefer document order; ensure overview modules sort first if mis-ordered.
    const ordered = modules
      .map((mod, moduleIndex) => ({ mod, moduleIndex }))
      .sort((a, b) => {
        const ka = a.mod?.kind === "overview" ? 0 : 1;
        const kb = b.mod?.kind === "overview" ? 0 : 1;
        if (ka !== kb) return ka - kb;
        return a.moduleIndex - b.moduleIndex;
      });
    ordered.forEach(({ mod, moduleIndex }, orderIndex) => {
      const lessons = Array.isArray(mod.lessons) ? mod.lessons : [];
      const practiceQuestionIds = Array.isArray(mod.practiceQuestionIds)
        ? mod.practiceQuestionIds.map(String)
        : [];
      const moduleKind = mod.kind || "skill";
      const moduleTitle =
        moduleKind === "overview"
          ? mod.title || t("course.about")
          : mod.title || mod.skill || t("course.module",{n:moduleIndex+1});
      const moduleSkill = mod.skill || "";
      const navModuleIndex = orderIndex;
      if (lessons.length === 0) {
        flat.push({
          flatIndex: flat.length,
          moduleIndex: navModuleIndex,
          lessonIndex: 0,
          moduleTitle,
          moduleSkill,
          moduleKind,
          practiceQuestionIds,
          id: `${mod.skill || moduleIndex}-overview`,
          title: moduleTitle,
          body: "",
          footnotes: [],
        });
        return;
      }
      lessons.forEach((lesson, lessonIndex) => {
        flat.push({
          flatIndex: flat.length,
          moduleIndex: navModuleIndex,
          lessonIndex,
          moduleTitle,
          moduleSkill,
          moduleKind,
          practiceQuestionIds,
          id: lesson.id || `${mod.skill || moduleIndex}-${lessonIndex}`,
          title: lesson.title || t("course.lesson",{n:lessonIndex+1}),
          topic: lesson.topic,
          body: typeof lesson.body === "string" ? lesson.body : "",
          footnotes: Array.isArray(lesson.footnotes) ? lesson.footnotes : [],
        });
      });
    });
    return appendCourseWarningsLesson(appendCourseGlossaryLesson(flat, data));
  }

  function appendCourseWarningsLesson(flat, data = courseDoc) {
    const warnings = Array.isArray(data?.warnings) ? data.warnings : [];
    if (warnings.length === 0) return flat;
    const moduleIndex =
      flat.length > 0 ? Math.max(...flat.map((l) => l.moduleIndex)) + 1 : 0;
    flat.push({
      flatIndex: flat.length,
      moduleIndex,
      lessonIndex: 0,
      moduleTitle: t("course.rerework"),
      moduleSkill: "course-warnings",
      moduleKind: "warnings",
      practiceQuestionIds: [],
      id: "course-warnings--list",
      title: t("course.rereworkTitle"),
      body: "",
      footnotes: [],
      isWarningsPage: true,
    });
    return flat.map((lesson, index) => ({ ...lesson, flatIndex: index }));
  }

  /** Filled document-level glossary entries (non-empty term + definition). */
  function getFilledGlossary(doc = courseDoc) {
    const glossary = Array.isArray(doc?.glossary) ? doc.glossary : [];
    return glossary.filter(
      (g) => g && String(g.term || "").trim() && String(g.definition || "").trim(),
    );
  }

  /**
   * One reader page for the full course glossary (not repeated under every lesson).
   * @param {FlatLesson[]} flat
   * @param {any} data
   */
  function appendCourseGlossaryLesson(flat, data) {
    const filled = getFilledGlossary(data);
    if (filled.length === 0) return flat;
    const moduleIndex =
      flat.length > 0 ? Math.max(...flat.map((l) => l.moduleIndex)) + 1 : 0;
    flat.push({
      flatIndex: flat.length,
      moduleIndex,
      lessonIndex: 0,
      moduleTitle: t("course.ref"),
      moduleSkill: "course-glossary",
      moduleKind: "glossary",
      practiceQuestionIds: [],
      id: "course-glossary--terms",
      title: t("course.terms"),
      body:
        t("course.termsIntro"),
      footnotes: [],
      isCourseGlossary: true,
    });
    return flat.map((lesson, index) => ({ ...lesson, flatIndex: index }));
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /** Whether `term` appears in lesson text (case-insensitive; short terms use boundaries). */
  function termAppearsInText(term, text) {
    const needle = String(term || "").trim();
    if (!needle || !text) return false;
    if (needle.length <= 2) {
      try {
        const re = new RegExp(
          `(^|[^\\p{L}\\p{N}_])${escapeRegExp(needle)}([^\\p{L}\\p{N}_]|$)`,
          "iu",
        );
        return re.test(text);
      } catch {
        return text.toLowerCase().includes(needle.toLowerCase());
      }
    }
    return text.toLowerCase().includes(needle.toLowerCase());
  }

  /**
   * Per-lesson footnotes: explicit `lessons[].footnotes` only.
   * Glossary-derived terms are no longer dumped under a lesson — they are
   * explained inline via hover tooltips in the body (annotateGlossaryTerms),
   * so a «Сноски» block never restates the lesson topic as its only entry.
   * @param {FlatLesson} lesson
   */
  function resolveLessonFootnotes(lesson) {
    const explicit = (lesson.footnotes || []).filter(
      (f) => f && String(f.term || "").trim() && String(f.definition || "").trim(),
    );
    if (explicit.length === 0) return [];
    return explicit.map((f) => ({
      term: String(f.term).trim(),
      alias: "",
      definition: String(f.definition).trim(),
    }));
  }

  function openCourse(data) {
    courseDoc = data;
    courseLessons = flattenCourseLessons(data);
    courseLessonIndex = 0;
    els.courseTitle.textContent = resolveCourseDisplayTitle(data);
    els.courseMeta.textContent = courseMetaLine(data);
    renderCourseOutline();
    renderCourseLesson();
    renderCourseWarnings();
    show("course");
  }

  function renderKitWarnings(data) {
    if (!els.kitWarnings) return;
    const warnings = Array.isArray(data?.warnings) ? data.warnings : [];
    if (warnings.length === 0) {
      els.kitWarnings.hidden = true;
      els.kitWarnings.innerHTML = "";
      return;
    }
    const skillTitle = (skillId) => {
      const mod = (data.modules ?? []).find((m) => m.skill === skillId);
      return mod?.title ?? skillId;
    };
    const explain = (w) => {
      const skill = skillTitle(w.skill);
      if (w.code === "KIT_NO_PROBE_QUESTION") {
        return {
          title: t("kit.warnNoProbe",{skill}),
          detail:
            t("kit.warnNoProbeDetail"),
          action:
            t("kit.warnNoProbeAction"),
        };
      }
      if (w.code === "KIT_EXPLANATION_MISSING") {
        return {
          title: t("kit.warnNoRef",{id:w.questionId??""}),
          detail: t("kit.warnNoRefDetail"),
        };
      }
      if (w.code === "KIT_SKILL_DESCRIPTION_EMPTY") {
        return {
          title: t("kit.warnNoSkillDesc",{skill}),
          detail: t("kit.warnNoSkillDescDetail"),
        };
      }
      return { title: w.code, detail: w.message ?? "" };
    };
    els.kitWarnings.hidden = false;
    els.kitWarnings.innerHTML = `<h2 class="kit-warn-heading">${t("kit.warnHead")}</h2>
      <p class="lead">${t("kit.warnLead")}</p>
      <ul class="kit-warn-list">${warnings
        .map((w) => {
          const e = explain(w);
          const act = e.action
            ? `<p class="kit-warn-action">${escapeHtml(e.action)}</p>`
            : "";
          return `<li><strong>${escapeHtml(e.title)}</strong><p>${escapeHtml(e.detail)}</p>${act}</li>`;
        })
        .join("")}</ul>`;
  }

  function kitEmptyProbesBlock(mod) {
    const n = mod.assessmentQuestionCount ?? 0;
    const testNote =
      n > 0
        ? `<p>${t("kit.hasTestOnly",{n})}</p>`
        : `<p>${t("kit.noQuestionsYet")}</p>`;
    return `<div class="kit-gap">
      <p class="kit-gap-title">${t("kit.emptyProbes")}</p>
      <p>${t("kit.needOpen")}</p>
      ${testNote}
      <p class="kit-gap-action">${t("kit.addOpenAction")} <code>${escapeHtml(mod.skill)}</code></p>
    </div>`;
  }

  function renderKitProbeHtml(probe) {
    const parts = [
      `<div class="kit-qbox">`,
      `<div class="q-label">${t("kit.qLabel")}</div>`,
      `<p class="q-text">${escapeHtml(probe.text || "")}</p>`,
    ];
    if (probe.evidence) {
      parts.push(
        `<p><strong>Evidence:</strong> ${escapeHtml(probe.evidence)}</p>`,
      );
    }
    if (probe.minDepthBand) {
      parts.push(
        `<p><strong>${t("kit.covers")}</strong> ${escapeHtml(probe.minDepthBand)} (${escapeHtml(probe.minDepthLabel || "")})</p>`,
      );
    }
    if (probe.explanation) {
      parts.push(
        `<p><strong>${t("kit.reference")}</strong> ${escapeHtml(probe.explanation)}</p>`,
      );
    }
    if (probe.expected) {
      const exp = Array.isArray(probe.expected)
        ? probe.expected.map(escapeHtml).join("; ")
        : escapeHtml(probe.expected);
      parts.push(`<p><strong>${t("kit.expected")}</strong> ${exp}</p>`);
    }
    if (Array.isArray(probe.red_flags) && probe.red_flags.length) {
      parts.push(
        `<p><strong>Red flags:</strong></p><ul>${probe.red_flags.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>`,
      );
    }
    if (Array.isArray(probe.rubric) && probe.rubric.length) {
      parts.push(
        `<p><strong>${t("kit.rubric")}</strong></p><ul>${probe.rubric.map((r) => `<li><strong>${r.score}:</strong> ${escapeHtml(r.description || "")}</li>`).join("")}</ul>`,
      );
    }
    if (Array.isArray(probe.validationCriteria) && probe.validationCriteria.length) {
      parts.push(
        `<ul>${probe.validationCriteria.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>`,
      );
    }
    parts.push("</div>");
    return parts.join("");
  }

  function renderKitBody(data) {
    if (!els.kitBody) return;
    const modules = Array.isArray(data.modules) ? data.modules : [];
    const glossary = Array.isArray(data.glossary) ? data.glossary : [];
    const checklist = Array.isArray(data.checklist) ? data.checklist : [];
    const moduleHtml = modules
      .map((mod, index) => {
        const topics =
          Array.isArray(mod.topics) && mod.topics.length
            ? `<p class="kit-topics"><span class="kit-topics-label">${t("kit.keyTopics")}</span> ${escapeHtml(mod.topics.join(", "))}</p>`
            : "";
        const desc = mod.description
          ? `<p class="kit-desc">${escapeHtml(mod.description)}</p>`
          : "";
        const probes =
          Array.isArray(mod.probes) && mod.probes.length
            ? mod.probes.map(renderKitProbeHtml).join("")
            : kitEmptyProbesBlock(mod);
        return `<article class="kit-module" id="kit-m${index}">
          <h3>${index + 1}. ${escapeHtml(mod.title || mod.skill || t("kit.moduleFallback"))}</h3>
          <p class="meta">${escapeHtml(mod.depthBand ? `${mod.depthBand} · ` : "")}${t("kit.meta.depth",{v:escapeHtml(String(mod.depth ?? "—"))})} · ${t("kit.meta.weight",{v:escapeHtml(String(mod.weight ?? "—"))})}</p>
          ${desc}
          ${topics}
          <div class="kit-probes">${probes}</div>
        </article>`;
      })
      .join("");
    const glossaryHtml =
      glossary.length > 0
        ? `<section class="kit-section"><h2>${t("kit.glossary")}</h2>
          <table class="kit-table"><thead><tr><th>${t("kit.term")}</th><th>${t("kit.definition")}</th></tr></thead><tbody>
          ${glossary
            .map(
              (g) =>
                `<tr><td>${escapeHtml(g.term || g.id || "")}</td><td>${escapeHtml(g.definition || "")}</td></tr>`,
            )
            .join("")}
          </tbody></table></section>`
        : "";
    const checklistHtml =
      checklist.length > 0
        ? `<section class="kit-section"><h2>${t("kit.checklist")}</h2>
          <p class="kit-checklist-intro">${t("kit.checklistIntro")}</p>
          <table class="kit-table"><thead><tr><th>${t("kit.skill")}</th><th>${t("kit.depthMeaning")}</th><th>${t("kit.depth")}</th><th>${t("kit.weight")}</th></tr></thead><tbody>
          ${checklist
            .map(
              (c) =>
                `<tr><td>${escapeHtml(c.skillName || c.skill || "")}</td><td>${escapeHtml(c.depthBand || "")} <span class="muted">(${escapeHtml(c.depthLabel || "")})</span></td><td>${escapeHtml(String(c.depth ?? ""))}</td><td>${escapeHtml(String(c.weight ?? ""))}</td></tr>`,
            )
            .join("")}
          </tbody></table></section>`
        : "";
    els.kitBody.innerHTML = `${moduleHtml ? `<section class="kit-section"><h2>${t("kit.modules")}</h2>${moduleHtml}</section>` : ""}${glossaryHtml}${checklistHtml}`;
  }

  function openKit(data) {
    kitDoc = data;
    els.kitTitle.textContent = resolveKitDisplayTitle(data);
    els.kitMeta.textContent = kitMetaLine(data);
    if (els.kitRevision) {
      const revision = data?.meta?.revision;
      els.kitRevision.textContent = revision ? t("kit.revision",{n:revision}) : "";
    }
    renderKitWarnings(data);
    renderKitBody(data);
    show("kit");
  }

  function courseModuleCount() {
    const seen = new Set(courseLessons.map((l) => l.moduleIndex));
    return seen.size;
  }

  function renderCourseOutline() {
    if (!els.courseOutline) return;
    els.courseOutline.innerHTML = "";
    if (courseLessons.length === 0) {
      const p = document.createElement("p");
      p.className = "lead";
      p.textContent = t("course.noModules");
      els.courseOutline.append(p);
      return;
    }
    /** @type {Map<number, FlatLesson[]>} */
    const byModule = new Map();
    for (const lesson of courseLessons) {
      if (!byModule.has(lesson.moduleIndex)) byModule.set(lesson.moduleIndex, []);
      byModule.get(lesson.moduleIndex).push(lesson);
    }
    const courseTitle = resolveCourseDisplayTitle(courseDoc || {});
    const multiModule = byModule.size > 1;
    for (const [moduleIndex, lessons] of byModule) {
      const block = document.createElement("div");
      const list = document.createElement("ul");
      list.className = "course-outline-list";
      // Single-module packs reuse module title as course h1 — skip duplicate group label.
      if (
        multiModule ||
        (lessons[0].moduleTitle && lessons[0].moduleTitle !== courseTitle)
      ) {
        const heading = document.createElement("p");
        heading.className = "course-module-title";
        const kind = lessons[0].moduleKind;
        heading.textContent = lessons[0].moduleTitle;
        if (kind === "overview" || kind === "glossary") {
          heading.dataset.kind = kind;
        }
        block.append(heading);
      }
      for (const lesson of lessons) {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = lesson.title;
        if (lesson.flatIndex === courseLessonIndex) btn.classList.add("active");
        btn.addEventListener("click", () => {
          courseLessonIndex = lesson.flatIndex;
          renderCourseLesson();
          renderCourseOutline();
        });
        li.append(btn);
        list.append(li);
      }
      block.append(list);
      block.dataset.moduleIndex = String(moduleIndex);
      els.courseOutline.append(block);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Lightweight escape-first markdown subset for lesson bodies.
   * Line-oriented so `## Зачем\nparagraph` (single newline) still becomes a heading.
   */
  function renderMarkdown(src, options = {}) {
    const escaped = escapeHtml(src).replace(/\r\n/g, "\n");
    const parts = escaped.split(/(```[\s\S]*?```)/g);
    let skipNextH1 = Boolean(options.skipLeadingH1);
    return parts
      .map((part) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const inner = part.slice(3, -3).replace(/^\w*\n/, "");
          return `<pre><code>${inner.trimEnd()}</code></pre>`;
        }
        return renderMdBlocks(part, {
          skipLeadingH1: skipNextH1,
          onSkippedH1: () => {
            skipNextH1 = false;
          },
        });
      })
      .join("");
  }

  function renderMdBlocks(text, options = {}) {
    const lines = text.replace(/^\n+/, "").replace(/\n+$/, "").split("\n");
    const out = [];
    let i = 0;
    let skipLeadingH1 = Boolean(options.skipLeadingH1);

    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) {
        i += 1;
        continue;
      }

      const heading = line.match(/^(#{1,4})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        if (skipLeadingH1 && level === 1) {
          skipLeadingH1 = false;
          options.onSkippedH1?.();
          i += 1;
          continue;
        }
        skipLeadingH1 = false;
        out.push(`<h${level}>${inlineMd(heading[2])}</h${level}>`);
        i += 1;
        continue;
      }

      if (line.startsWith("|") && line.includes("|")) {
        skipLeadingH1 = false;
        const rows = [];
        while (
          i < lines.length &&
          lines[i].trim().startsWith("|") &&
          lines[i].trim().endsWith("|")
        ) {
          rows.push(lines[i].trim());
          i += 1;
        }
        if (rows.length >= 2) {
          const thead = parseTableRow(rows[0]);
          const dataRows = rows.slice(2);
          let html = '<table class="md-table"><thead><tr>';
          for (const th of thead) html += `<th>${inlineMd(th)}</th>`;
          html += "</tr></thead>";
          if (dataRows.length > 0) {
            html += "<tbody>";
            for (const r of dataRows) {
              html += "<tr>";
              for (const td of parseTableRow(r)) html += `<td>${inlineMd(td)}</td>`;
              html += "</tr>";
            }
            html += "</tbody>";
          }
          html += "</table>";
          out.push(html);
        } else {
          out.push(`<p>${inlineMd(rows.join("<br />"))}</p>`);
        }
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        skipLeadingH1 = false;
        const items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
          items.push(`<li>${inlineMd(lines[i].replace(/^[-*]\s+/, ""))}</li>`);
          i += 1;
        }
        out.push(`<ul>${items.join("")}</ul>`);
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        skipLeadingH1 = false;
        const items = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
          items.push(`<li>${inlineMd(lines[i].replace(/^\d+\.\s+/, ""))}</li>`);
          i += 1;
        }
        out.push(`<ol>${items.join("")}</ol>`);
        continue;
      }

      skipLeadingH1 = false;
      const para = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^(#{1,4})\s+/.test(lines[i]) &&
        !/^[-*]\s+/.test(lines[i]) &&
        !/^\d+\.\s+/.test(lines[i])
      ) {
        para.push(lines[i]);
        i += 1;
      }
      out.push(`<p>${inlineMd(para.join("<br />"))}</p>`);
    }

    return out.join("");
  }

  function inlineMd(text) {
    const html = text
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
    return annotateGlossaryTerms(html);
  }

  /** Glossary entries with definitions, longest term first (for hover tooltips). */
  function glossaryTermIndex() {
    const filled = getFilledGlossary();
    if (filled.length === 0) return [];
    return filled
      .map((g) => ({
        term: String(g.term || "").trim(),
        aliases: Array.isArray(g.aliases)
          ? g.aliases.map((a) => String(a).trim()).filter(Boolean)
          : [],
        definition: String(g.definition || "").trim(),
      }))
      .filter((e) => e.term && e.definition)
      .sort((a, b) => b.term.length - a.term.length);
  }

  /** Replace first occurrence of every glossary term in a plain text run. */
  function annotateTextRun(run, entries) {
    let text = run;
    for (const e of entries) {
      const names = e.aliases.length > 0 ? [e.term, ...e.aliases] : [e.term];
      for (const name of names) {
        if (!name) continue;
        const re = new RegExp(
          `(^|[^\\p{L}\\p{N}_])(${escapeRegExp(name)})([^\\p{L}\\p{N}_]|$)`,
          "iu",
        );
        const m = re.exec(text);
        if (!m) continue;
        const span = `<span class="glossary-term" data-term="${escapeHtml(e.term)}" data-definition="${escapeHtml(e.definition)}">${m[2]}</span>`;
        text =
          text.slice(0, m.index) +
          m[1] +
          span +
          m[3] +
          text.slice(m.index + m[0].length);
      }
    }
    return text;
  }

  /**
   * Wrap glossary terms in inline markdown output with a hover definition.
   * HTML tags already emitted by inlineMd stay untouched; only plain text
   * runs are annotated; code blocks never reach here.
   */
  function annotateGlossaryTerms(html) {
    const entries = glossaryTermIndex();
    if (entries.length === 0) return html;
    const parts = html.split(/(<code>[\s\S]*?<\/code>)/g);
    return parts
      .map((part) => {
        if (part.startsWith("<code>")) return part;
        let out = "";
        let run = "";
        for (let i = 0; i < part.length; i += 1) {
          if (part[i] === "<") {
            out += annotateTextRun(run, entries);
            run = "";
            const close = part.indexOf(">", i);
            const end = close === -1 ? part.length : close + 1;
            out += part.slice(i, end);
            i = end - 1;
          } else {
            run += part[i];
          }
        }
        out += annotateTextRun(run, entries);
        return out;
      })
      .join("");
  }

  function parseTableRow(raw) {
    return raw
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());
  }

  function resolvePracticeQuestions(ids) {
    const want = new Set((ids || []).map(String));
    if (want.size === 0) return [];
    /** @type {Map<string, any>} */
    const found = new Map();
    for (const entry of library) {
      const questions = Array.isArray(entry.document?.questions)
        ? entry.document.questions
        : [];
      for (const q of questions) {
        if (q && want.has(String(q.id)) && !found.has(String(q.id))) {
          found.set(String(q.id), q);
        }
      }
    }
    return [...want].map((id) => found.get(id)).filter(Boolean);
  }

  /** Trailing numeric suffix: q-prompt-engineering-005 → 005 */
  function practiceShortRef(id) {
    const s = String(id || "");
    const m = s.match(/(\d+)$/);
    return m ? m[1] : s;
  }

  /** Known acronyms that stay uppercase when humanizing a topic slug. */
  const TOPIC_ACRONYMS = new Set([
    "api",
    "cli",
    "cors",
    "cpu",
    "cqrs",
    "css",
    "db",
    "ddd",
    "di",
    "dns",
    "docker",
    "dto",
    "e2e",
    "gc",
    "gin",
    "gist",
    "grpc",
    "http",
    "https",
    "id",
    "ide",
    "jdbc",
    "jpa",
    "jvm",
    "kpi",
    "llm",
    "mcp",
    "mvc",
    "n1",
    "oauth",
    "orm",
    "otel",
    "p95",
    "r2dbc",
    "rag",
    "rbac",
    "rest",
    "rpc",
    "sdk",
    "sla",
    "slo",
    "sql",
    "sse",
    "ssl",
    "tls",
    "ttl",
    "ui",
    "uri",
    "url",
    "uuid",
    "vo",
    "web",
  ]);

  /** Russian inflection map for common topic slugs: key → «ключ» (человеческое имя). */
  const TOPIC_LABELS_RU = {
    bootstrap: "Запуск приложения",
    circuit_breaker: "Предохранитель (Circuit Breaker)",
    "3-case-pattern": "Паттерн трёх тестов",
    "domain-event": "Доменное событие",
    "value-object": "Value Object",
    "bounded-context": "Ограниченный контекст",
    "ubiquitous-language": "Единый язык (Ubiquitous Language)",
    "ports-and-adapters": "Порты и адаптеры",
    "domain-purity": "Чистота домена",
    "dependency-inversion": "Инверсия зависимостей",
    "dependency-injection": "Внедрение зависимостей",
    "embedded-kafka": "Встроенный Kafka",
    "unit-testing": "Модульные тесты",
    "integration-test": "Интеграционные тесты",
    "load-test": "Нагрузочные тесты",
    testcontainers: "Testcontainers",
    "outbox-table": "Таблица outbox",
    "poll-relay": "Poll-relay",
    "transactional-outbox": "Транзакционный outbox",
    atomicity: "Атомарность",
    "http-client": "HTTP-клиент",
    "http-methods": "HTTP-методы",
    "http-status": "HTTP-коды состояния",
    "error-handling": "Обработка ошибок",
    multi_stage: "Многоэтапная сборка",
    dockerfile: "Dockerfile",
    collections: "Коллекции",
    concurrency: "Многопоточность",
    "language-core": "Ядро языка",
    streams: "Streams",
    performance: "Производительность",
    mapping: "Маппинг",
    transactions: "Транзакции",
    indexing: "Индексы",
    extensions: "Расширения",
    projections: "Проекции",
    "choreography-orchestration": "Хореография и оркестрация",
    retry: "Повторы (Retry)",
    "selection-criteria": "Критерии выбора",
    configuration: "Конфигурация",
    starters: "Стартеры",
    metrics: "Метрики",
    tracing: "Трейсинг",
    authentication: "Аутентификация",
    authorization: "Авторизация",
    reliability: "Надёжность",
    architecture: "Архитектура",
    consumer: "Потребитель (Consumer)",
    producer: "Производитель (Producer)",
    topics_kafka: "Топики Kafka",
  };

  /**
   * system-prompt → System prompt; http-client → HTTP-клиент; cqrs → CQRS.
   * Falls back to a plain capitalization for unknown slugs; known Russian
   * labels and acronyms take precedence for learner-facing copy.
   */
  function humanizeTopic(topic) {
    const raw = String(topic || "").trim();
    if (!raw) return "";
    const key = raw.toLowerCase().replace(/[\s_]+/g, "-");
    const ru = TOPIC_LABELS_RU[key] || TOPIC_LABELS_RU[raw.toLowerCase()];
    if (ru) return ru;
    const words = raw
      .split(/[-_]+/)
      .filter(Boolean)
      .map((w) => w.toLowerCase());
    if (words.length === 0) return "";
    return words
      .map((w, i) => {
        if (TOPIC_ACRONYMS.has(w)) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(" ");
  }

  /**
   * Labels for practice list: short ref + question text from course anchors /
   * test pack (`005 — Какова типичная роль system prompt?`).
   * Full id stays in the tooltip for authors.
   */
  function practiceMetaById(ids) {
    /** @type {Map<string, { topics?: string[], text?: string, skill?: string }>} */
    const map = new Map();
    const anchors = Array.isArray(courseDoc?.teachingContext?.questionAnchors)
      ? courseDoc.teachingContext.questionAnchors
      : [];
    for (const a of anchors) {
      if (a && a.id) map.set(String(a.id), a);
    }
    for (const entry of library) {
      const questions = Array.isArray(entry.document?.questions)
        ? entry.document.questions
        : [];
      for (const q of questions) {
        if (q && q.id) {
          const prev = map.get(String(q.id));
          // Prefer richer text when merging test pack over thin anchors.
          if (!prev || (q.text && !prev.text)) map.set(String(q.id), q);
          else if (q.text && prev.text && String(q.text).length > String(prev.text).length) {
            map.set(String(q.id), { ...prev, ...q });
          }
        }
      }
    }
    for (const id of ids || []) {
      if (!map.has(String(id))) map.set(String(id), { id: String(id) });
    }
    return map;
  }

  function formatPracticeLabel(id, meta) {
    const short = practiceShortRef(id);
    const text = String(meta?.text || "").trim();
    if (text) return `${short} — ${text}`;
    const topic =
      (Array.isArray(meta?.topics) && meta.topics[0]) || meta?.skill || "";
    if (topic) return `${short} — ${humanizeTopic(topic)}`;
    return short;
  }

  function renderCourseLesson() {
    const total = courseLessons.length;
    if (total === 0) {
      els.courseProgress.textContent = "0 / 0";
      els.courseLessonCrumb.textContent = "";
      els.courseLessonTitle.textContent = t("course.noLessons");
      els.courseLessonBody.innerHTML =
        `<p class="lesson-stub">${t("course.noLessonsBody")}</p>`;
      if (els.courseLessonFootnotes) {
        els.courseLessonFootnotes.hidden = true;
        els.courseLessonFootnotes.innerHTML = "";
      }
      if (els.courseGlossary) {
        els.courseGlossary.hidden = true;
        els.courseGlossary.innerHTML = "";
      }
      if (els.coursePracticeHint) els.coursePracticeHint.hidden = true;
      els.coursePractice.hidden = true;
      els.btnCoursePrev.disabled = true;
      els.btnCourseNext.disabled = true;
      return;
    }
    if (courseLessonIndex < 0) courseLessonIndex = 0;
    if (courseLessonIndex >= total) courseLessonIndex = total - 1;
    const lesson = courseLessons[courseLessonIndex];
    els.courseProgress.textContent = `${courseLessonIndex + 1} / ${total}`;
    // Avoid repeating outline module title + lesson id; keep topic/skill only.
    const crumbParts = [];
    if (courseModuleCount() > 1 && lesson.moduleTitle) {
      crumbParts.push(lesson.moduleTitle);
    }
    if (lesson.topic) crumbParts.push(lesson.topic);
    else if (lesson.moduleSkill) crumbParts.push(lesson.moduleSkill);
    els.courseLessonCrumb.textContent = crumbParts.join(" · ");
    els.courseLessonTitle.textContent = lesson.title;
    const body = String(lesson.body || "").trim();
    if (!body) {
      els.courseLessonBody.innerHTML =
        `<p class="lesson-stub">${t("course.noLessonText")}</p>`;
    } else {
      // Body howto packs usually start with `# …` that overlaps the lesson h2.
      els.courseLessonBody.innerHTML = renderMarkdown(body, { skipLeadingH1: true });
    }
    if (lesson.isCourseGlossary) {
      if (els.courseLessonFootnotes) {
        els.courseLessonFootnotes.hidden = true;
        els.courseLessonFootnotes.innerHTML = "";
      }
      renderCourseGlossary(true);
      if (els.coursePractice) {
        els.coursePractice.hidden = true;
        els.coursePractice.innerHTML = "";
      }
      if (els.coursePracticeHint) els.coursePracticeHint.hidden = true;
    } else if (lesson.isWarningsPage) {
      // Hide body, footnotes, glossary, practice — the warnings list fills the page.
      els.courseLessonBody.innerHTML =
        `<p class="lesson-stub">${t("course.warningsOnlyAuthor")}</p>`;
      if (els.courseLessonFootnotes) {
        els.courseLessonFootnotes.hidden = true;
        els.courseLessonFootnotes.innerHTML = "";
      }
      renderCourseGlossary(false);
      if (els.coursePractice) {
        els.coursePractice.hidden = true;
        els.coursePractice.innerHTML = "";
      }
      if (els.coursePracticeHint) els.coursePracticeHint.hidden = true;
    } else {
      renderCourseFootnotes(lesson);
      renderCourseGlossary(false);
      renderCoursePractice(lesson);
      if (els.coursePracticeHint) {
        els.coursePracticeHint.hidden = !(lesson.practiceQuestionIds || []).length;
      }
    }
    els.btnCoursePrev.disabled = courseLessonIndex === 0;
    els.btnCourseNext.disabled = courseLessonIndex >= total - 1;
    renderCourseWarnings();
    renderCourseOutline();
  }

  function renderCourseFootnotes(lesson) {
    if (!els.courseLessonFootnotes) return;
    const notes = resolveLessonFootnotes(lesson);
    if (notes.length === 0) {
      els.courseLessonFootnotes.hidden = true;
      els.courseLessonFootnotes.innerHTML = "";
      return;
    }
    els.courseLessonFootnotes.hidden = false;
    const items = notes
      .map((f) => {
        const alias = f.alias || "";
        const label = f.term;
        const display = alias
          ? `${escapeHtml(alias)} <span class="footnote-acr">(${escapeHtml(label)})</span>`
          : escapeHtml(label);
        return `<li><strong>${display}</strong> — ${escapeHtml(f.definition)}</li>`;
      })
      .join("");
    els.courseLessonFootnotes.innerHTML = `<h3>${t("course.footnotes")}</h3><ul>${items}</ul>`;
  }

  /** Full glossary once — only on the dedicated «Термины курса» page. */
  function renderCourseGlossary(show) {
    if (!els.courseGlossary) return;
    if (!show) {
      els.courseGlossary.hidden = true;
      els.courseGlossary.innerHTML = "";
      return;
    }
    const filled = getFilledGlossary();
    if (filled.length === 0) {
      els.courseGlossary.hidden = true;
      els.courseGlossary.innerHTML = "";
      return;
    }
    els.courseGlossary.hidden = false;
    const items = filled
      .map((g) => {
        const term = String(g.term).trim();
        const alias = (Array.isArray(g.aliases) ? g.aliases[0] : "") || "";
        const display = alias
          ? `${escapeHtml(alias)} <span class="footnote-acr">(${escapeHtml(term)})</span>`
          : escapeHtml(humanizeTopic(term) || term);
        return `<li><strong>${display}</strong> — ${escapeHtml(String(g.definition).trim())}</li>`;
      })
      .join("");
    els.courseGlossary.innerHTML = `<h3>${t("course.terms")}</h3><ul>${items}</ul>`;
  }

  function renderCoursePractice(lesson) {
    if (!els.coursePractice) return;
    const ids = lesson.practiceQuestionIds || [];
    if (ids.length === 0) {
      els.coursePractice.hidden = true;
      els.coursePractice.innerHTML = "";
      return;
    }
    els.coursePractice.hidden = false;
    const resolved = resolvePracticeQuestions(ids);
    const metaById = practiceMetaById(ids);
    const list = ids
      .map((id) => {
        const meta = metaById.get(String(id));
        const label = formatPracticeLabel(id, meta);
        return `<li title="${escapeHtml(String(id))}"><span class="practice-label">${escapeHtml(label)}</span></li>`;
      })
      .join("");
    let actions = "";
    if (resolved.length > 0) {
      actions = `<button type="button" class="btn primary" id="btn-run-practice">${t("course.practiceRun",{n:resolved.length})}</button>`;
    } else {
      actions =
        `<p class="lead" style="margin:0">${t("course.practiceNeedTest")}</p>`;
    }
    // Topic labels from teachingContext.questionAnchors; full id kept for authors.
    els.coursePractice.innerHTML = `
      <h3>${t("course.practice")}</h3>
      <p class="lead" style="margin:0 0 0.65rem">${t("course.practiceFromLibrary",{n:ids.length})}</p>
      ${actions}
      <details class="practice-details">
        <summary>${t("course.practiceIds",{n:ids.length})}</summary>
        <ul class="practice-ids">${list}</ul>
      </details>
    `;
    const btn = document.getElementById("btn-run-practice");
    if (btn) {
      btn.addEventListener("click", () => {
        startPracticeSession(
          resolved,
          `Практика: ${lesson.moduleTitle || courseDoc?.title || t("meta.count.course")}`,
        );
      });
    }
  }

  /** Position and show the term tooltip next to a .glossary-term element. */
  const termTipEl = document.getElementById("termTip");
  function showTermTip(el) {
    if (!termTipEl || !el.dataset.definition) return;
    const label = humanizeTopic(el.dataset.term) || el.dataset.term || "";
    termTipEl.innerHTML = `<b>${escapeHtml(label)}</b>${escapeHtml(el.dataset.definition)}`;
    termTipEl.classList.add("show");
    const r = el.getBoundingClientRect();
    const w = Math.min(300, window.innerWidth - 24);
    let left = r.left;
    if (left + w > window.innerWidth - 12) left = window.innerWidth - w - 12;
    let top = r.bottom + 8;
    termTipEl.style.width = "max-content";
    termTipEl.style.maxWidth = w + "px";
    termTipEl.style.left = Math.max(12, left) + "px";
    termTipEl.style.top = top + "px";
    const tr = termTipEl.getBoundingClientRect();
    if (tr.bottom > window.innerHeight - 8) termTipEl.style.top = r.top - tr.height - 8 + "px";
  }
  function hideTermTip() {
    if (termTipEl) termTipEl.classList.remove("show");
  }

  function renderCourseWarnings() {
    if (!els.courseWarnings) return;
    const warnings = Array.isArray(courseDoc?.warnings) ? courseDoc.warnings : [];
    if (warnings.length === 0) {
      els.courseWarnings.hidden = true;
      els.courseWarnings.innerHTML = "";
      if (els.courseWarnBadge) els.courseWarnBadge.hidden = true;
      return;
    }
    // Badge in the header — author-only, one line, no full list on lesson pages.
    if (els.courseWarnBadge) {
      els.courseWarnBadge.hidden = false;
      els.courseWarnBadge.className = "course-warn-badge warn";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "course-warn-badge warn";
      btn.textContent = t("course.warningsBadge",{n:warnings.length});
      btn.addEventListener("click", () => {
        const idx = courseLessons.findIndex((l) => l.moduleKind === "warnings");
        if (idx !== -1) {
          courseLessonIndex = idx;
          renderCourseLesson();
        }
      });
      els.courseWarnBadge.replaceChildren(btn);
    }
    // The full list renders only on the dedicated «Доработки» page.
    const isWarningsPage = courseLessons[courseLessonIndex]?.moduleKind === "warnings";
    if (!isWarningsPage) {
      els.courseWarnings.hidden = true;
      els.courseWarnings.innerHTML = "";
      return;
    }
    els.courseWarnings.hidden = false;
    const items = warnings
      .map((w) => {
        if (typeof w === "string") return `<li>${escapeHtml(w)}</li>`;
        const code = w.code || w.type || "";
        const msg = w.message || w.detail || JSON.stringify(w);
        const skill = w.skill ? ` <span class="warn-skill">(${escapeHtml(w.skill)})</span>` : "";
        return `<li><code>${escapeHtml(code)}</code>${skill} — ${escapeHtml(msg)}</li>`;
      })
      .join("");
    els.courseWarnings.innerHTML = `
      <h3>${t("course.warningsTitle",{n:warnings.length})}</h3>
      <p class="lead">${t("course.warningsLead")}</p>
      <ul>${items}</ul>`;
  }

  function goNext() {
    clearAutoNext();
    if (index >= sessionQuestions.length - 1) {
      finish();
      return;
    }
    if (outcomes[index] === "unanswered") {
      answers[index] = readAnswer(sessionQuestions[index]);
    }
    index += 1;
    renderQuestion();
  }

  function scheduleAutoNext() {
    clearAutoNext();
    if (!sessionAutoNext) return;
    autoNextId = setTimeout(() => {
      autoNextId = null;
      goNext();
    }, AUTO_NEXT_MS);
  }

  function renderQuestion() {
    clearAutoNext();
    const q = sessionQuestions[index];
    els.progress.textContent = `${index + 1} / ${sessionQuestions.length}`;
    els.qMeta.textContent = [
      q.id,
      q.skill,
      q.type,
      typeof q.difficulty === "number" ? t("test.difficulty",{v:q.difficulty}) : null,
    ]
      .filter(Boolean)
      .join(" · ");
    els.qText.textContent = q.text || t("test.emptyText");
    els.qBody.innerHTML = "";
    els.feedback.hidden = true;
    els.feedback.className = "feedback";
    els.feedback.textContent = "";

    if (q.type === "single_choice" || q.type === "multi_choice") {
      const options = Array.isArray(q.options) ? q.options : [];
      const wrap = document.createElement("div");
      wrap.className = "options";
      const saved = answers[index];
      options.forEach((label, i) => {
        const oneBased = i + 1;
        const row = document.createElement("label");
        row.className = "option";
        const input = document.createElement("input");
        input.type = q.type === "multi_choice" ? "checkbox" : "radio";
        input.name = "opt";
        input.value = String(oneBased);
        if (q.type === "single_choice" && Number(saved) === oneBased) input.checked = true;
        if (
          q.type === "multi_choice" &&
          Array.isArray(saved) &&
          saved.map(Number).includes(oneBased)
        ) {
          input.checked = true;
        }
        if (outcomes[index] !== "unanswered" && outcomes[index] !== "skipped") {
          input.disabled = true;
        }
        const span = document.createElement("span");
        span.textContent = label;
        row.append(input, span);
        wrap.append(row);
      });
      els.qBody.append(wrap);
    } else if (q.type === "open" || q.type === "code") {
      const area = document.createElement("textarea");
      area.className = "answer";
      area.placeholder =
        q.type === "open"
          ? t("test.placeholder.open")
          : t("test.placeholder.code");
      area.value = typeof answers[index] === "string" ? answers[index] : "";
      if (outcomes[index] !== "unanswered" && outcomes[index] !== "skipped") {
        area.readOnly = true;
      }
      els.qBody.append(area);
      if (q.type === "code") {
        if (q.code_template) {
          const pre = document.createElement("pre");
          pre.className = "code-box";
          pre.textContent = q.code_template;
          els.qBody.append(pre);
        }
        const criteria = q.validation?.criteria;
        if (Array.isArray(criteria) && criteria.length) {
          const box = document.createElement("div");
          box.className = "criteria";
          box.innerHTML = `<strong>${t("test.criteria")}</strong><ul>${criteria
            .map((c) => `<li>${escapeHtml(c)}</li>`)
            .join("")}</ul>`;
          els.qBody.append(box);
        }
      }
    } else {
      const p = document.createElement("p");
      p.className = "lead";
      p.textContent = t("err.unsupportedType",{type:q.type});
      els.qBody.append(p);
    }

    if (outcomes[index] !== "unanswered") {
      showFeedback(q, outcomes[index]);
      highlightOptions(q, outcomes[index]);
    }

    els.btnPrev.disabled = index === 0;
    els.btnSkip.disabled = outcomes[index] !== "unanswered";
    els.btnCheck.hidden = outcomes[index] !== "unanswered";
    els.btnNext.hidden = index >= sessionQuestions.length - 1;
    els.btnNext.disabled = false;
  }

  function highlightOptions(q, outcome) {
    if (q.type !== "single_choice" && q.type !== "multi_choice") return;
    const correct = asCorrectSet(q.correct) || new Set();
    const selected = new Set(
      q.type === "single_choice"
        ? answers[index] != null
          ? [Number(answers[index])]
          : []
        : (Array.isArray(answers[index]) ? answers[index] : []).map(Number),
    );
    els.qBody.querySelectorAll(".option").forEach((row) => {
      const input = row.querySelector("input");
      const n = Number(input.value);
      if (correct.has(n)) row.classList.add("correct");
      else if (selected.has(n) && outcome === "incorrect") row.classList.add("incorrect");
    });
  }

  function showFeedback(q, outcome) {
    els.feedback.hidden = false;
    const parts = [];
    if (outcome === "correct") {
      els.feedback.className = "feedback ok";
      parts.push(t("test.feedback.correct"));
    } else if (outcome === "incorrect") {
      els.feedback.className = "feedback bad";
      parts.push(t("test.feedback.incorrect"));
    } else if (outcome === "skipped") {
      els.feedback.className = "feedback neutral";
      parts.push(t("test.feedback.skipped"));
    } else {
      els.feedback.className = "feedback neutral";
      parts.push(t("test.feedback.unscored"));
    }
    if (q.explanation) parts.push(q.explanation);
    els.feedback.textContent = parts.join(" ");
  }

  function checkCurrent() {
    const q = sessionQuestions[index];
    const answer = readAnswer(q);
    if (!hasAnswer(q, answer)) {
      els.feedback.hidden = false;
      els.feedback.className = "feedback neutral";
      els.feedback.textContent = t("err.noAnswer");
      return;
    }
    answers[index] = answer;
    const outcome = grade(q, answer);
    outcomes[index] = outcome;
    showFeedback(q, outcome);
    highlightOptions(q, outcome);
    els.btnCheck.hidden = true;
    els.btnSkip.disabled = true;
    [...els.qBody.querySelectorAll("input, textarea")].forEach((el) => {
      if ("disabled" in el) el.disabled = true;
      if ("readOnly" in el) el.readOnly = true;
    });
    scheduleAutoNext();
  }

  function skipCurrent() {
    clearAutoNext();
    if (outcomes[index] !== "unanswered") return;
    outcomes[index] = "skipped";
    answers[index] = null;
    goNext();
  }

  function finish() {
    clearAutoNext();
    clearTimer();
    for (let i = 0; i < outcomes.length; i += 1) {
      if (outcomes[i] === "unanswered") outcomes[i] = "skipped";
    }
    renderStats();
    show("stats");
  }

  function count(kind) {
    return outcomes.filter((o) => o === kind).length;
  }

  function renderStats() {
    els.timeUpBanner.hidden = !finishedByTimeout;
    const correct = count("correct");
    const incorrect = count("incorrect");
    const skipped = count("skipped");
    const unscored = count("unscored");
    const scored = correct + incorrect;
    const pct = scored > 0 ? Math.round((correct / scored) * 100) : 0;

    const requirements = Array.isArray(doc.requirements) ? doc.requirements : [];
    const weightBySkill = new Map(
      requirements.map((r) => [r.skill, Number(r.weight) || 0]),
    );
    const skills = new Set([
      ...sessionQuestions.map((q) => q.skill),
      ...requirements.map((r) => r.skill),
    ]);

    let weighted = 0;
    const rows = [];

    for (const skill of [...skills].sort()) {
      const idxs = sessionQuestions
        .map((q, i) => (q.skill === skill ? i : -1))
        .filter((i) => i >= 0);
      const c = idxs.filter((i) => outcomes[i] === "correct").length;
      const ic = idxs.filter((i) => outcomes[i] === "incorrect").length;
      const sk = idxs.filter((i) => outcomes[i] === "skipped").length;
      const us = idxs.filter((i) => outcomes[i] === "unscored").length;
      const denom = c + ic;
      const share = denom > 0 ? c / denom : null;
      const weight = weightBySkill.has(skill) ? weightBySkill.get(skill) : null;
      if (weight != null && share != null) {
        weighted += share * weight;
      }
      rows.push({ skill, weight, c, ic, sk, us, share });
    }

    const threshold = typeof doc.threshold === "number" ? doc.threshold : null;
    const pass = threshold == null ? null : weighted >= threshold;

    els.statsSummary.textContent = [
      finishedByTimeout ? t("test.stats.summary.timeUp") : null,
      t("test.stats.summary.score",{correct,scored,pct}),
      t("test.stats.summary.skipped",{n:skipped}),
      t("test.stats.summary.unscored",{n:unscored}),
      threshold == null
        ? t("test.stats.summary.weighted",{v:weighted.toFixed(3)})
        : t("test.stats.summary.threshold",{v:weighted.toFixed(3),t:threshold,result:pass?t("test.stats.result.pass"):t("test.stats.result.fail")}),
    ]
      .filter(Boolean)
      .join(" · ");

    els.statsGrid.innerHTML = [
      [t("test.stats.correct"), correct],
      [t("test.stats.incorrect"), incorrect],
      [t("test.stats.skipped"), skipped],
      [t("test.stats.unscored"), unscored],
      [t("test.stats.percent"), `${pct}%`],
      [t("test.stats.weighted"), weighted.toFixed(3)],
    ]
      .map(
        ([label, value]) =>
          `<div class="stat"><span class="label">${label}</span><span class="value">${value}</span></div>`,
      )
      .join("");

    els.skillTable.innerHTML = rows
      .map((r) => {
        const w = r.weight == null ? "—" : String(r.weight);
        const share = r.share == null ? "—" : `${Math.round(r.share * 100)}%`;
        return `<tr>
          <td>${escapeHtml(r.skill)}</td>
          <td>${w}</td>
          <td>${r.c}</td>
          <td>${r.ic}</td>
          <td>${r.sk}</td>
          <td>${r.us}</td>
          <td>${share}</td>
        </tr>`;
      })
      .join("");
  }

  function renderDiscoveredExports() {
    if (!els.exportList || !els.exportListWrap) return;
    const filtered = discoveredExports.filter((item) => {
      if (homeMode === "courses") return item.kind === "course";
      if (homeMode === "kits") return item.kind === "kit";
      return item.kind === "test";
    });
    els.exportList.innerHTML = "";
    if (filtered.length === 0) {
      if (discoveredExports.length === 0) {
        els.exportListWrap.hidden = true;
        return;
      }
      const li = document.createElement("li");
      const p = document.createElement("p");
      p.className = "lead";
      p.style.margin = "0";
      p.textContent =
        homeMode === "kits"
          ? t("kit.noModulesInExports")
          : homeMode === "courses"
            ? t("kit.noCourseInExports")
            : t("kit.noTestInExports");
      li.append(p);
      els.exportList.append(li);
      els.exportListWrap.hidden = false;
      if (els.exportListHeading) {
        els.exportListHeading.textContent =
          homeMode === "kits"
            ? t("kit.exports.kits")
            : homeMode === "courses"
              ? t("kit.exports.courses")
              : t("kit.exports.tests");
      }
      return;
    }
    if (els.exportListHeading) {
      els.exportListHeading.textContent =
        homeMode === "kits"
          ? t("kit.exports.kits")
          : homeMode === "courses"
            ? t("kit.exports.courses")
            : t("kit.exports.tests");
    }
    for (const item of filtered.sort((a, b) => a.name.localeCompare(b.name))) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      const badge = document.createElement("span");
      badge.className = `export-badge ${item.kind}`;
      badge.textContent =
        item.kind === "course" ? "course" : item.kind === "kit" ? "kit" : "test";
      btn.append(document.createTextNode(item.name + " "), badge);
      btn.addEventListener("click", () => {
        loadUrl(item.url, item.name).catch((err) =>
          setLoadError(err.message || String(err)),
        );
      });
      li.append(btn);
      els.exportList.append(li);
    }
    els.exportListWrap.hidden = false;
  }

  async function discoverExports() {
    if (location.protocol === "file:") return;
    const candidates = ["../exports/", "./exports/", "/exports/"];
    for (const base of candidates) {
      try {
        const res = await fetch(base);
        if (!res.ok) continue;
        const html = await res.text();
        const names = [...html.matchAll(/href=["']([^"']+\.json)["']/gi)]
          .map((m) => m[1])
          .map((href) => href.split("/").pop())
          .filter(Boolean);
        const unique = [...new Set(names)];
        if (unique.length === 0) continue;
        /** @type {{ name: string, kind: 'test'|'course'|'kit', url: string }[]} */
        const items = [];
        for (const name of unique) {
          const url = new URL(name, new URL(base, location.href)).href;
          try {
            const fileRes = await fetch(url);
            if (!fileRes.ok) continue;
            const text = await fileRes.text();
            const data = parseJsonObject(text);
            const kind = detectSchemaKind(data);
            if (kind === "test" || kind === "course" || kind === "kit") {
              items.push({ name, kind, url });
            }
          } catch {
            /* skip unreadable */
          }
        }
        discoveredExports = items;
        renderDiscoveredExports();
        return;
      } catch {
        /* try next */
      }
    }
  }

  els.optTimed.addEventListener("change", () => {
    syncMinutesVisibility();
    savePrefs();
  });
  els.optAutoNext.addEventListener("change", savePrefs);
  els.optShuffle.addEventListener("change", savePrefs);
  els.optShuffleOptions.addEventListener("change", savePrefs);
  els.optMinutes.addEventListener("change", savePrefs);

  els.tabTests?.addEventListener("click", () => setHomeMode("tests"));
  els.tabCourses?.addEventListener("click", () => setHomeMode("courses"));
  els.tabKits?.addEventListener("click", () => setHomeMode("kits"));

  els.fileInput.addEventListener("change", () => {
    const files = els.fileInput.files;
    if (!files?.length) return;
    loadFiles(files).finally(() => {
      els.fileInput.value = "";
    });
  });

  ["dragenter", "dragover"].forEach((evt) => {
    els.dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      els.dropzone.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach((evt) => {
    els.dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      els.dropzone.classList.remove("dragover");
    });
  });
  els.dropzone.addEventListener("drop", (e) => {
    const files = e.dataTransfer?.files;
    if (!files?.length) return;
    loadFiles(files);
  });

  els.btnCheck.addEventListener("click", checkCurrent);
  els.btnSkip.addEventListener("click", skipCurrent);
  els.btnPrev.addEventListener("click", () => {
    clearAutoNext();
    if (index === 0) return;
    index -= 1;
    renderQuestion();
  });
  els.btnNext.addEventListener("click", () => {
    clearAutoNext();
    goNext();
  });
  els.btnFinish.addEventListener("click", () => {
    finishedByTimeout = false;
    finish();
  });
  els.btnCoursePrev?.addEventListener("click", () => {
    if (courseLessonIndex <= 0) return;
    courseLessonIndex -= 1;
    renderCourseLesson();
  });
  els.btnCourseNext?.addEventListener("click", () => {
    if (courseLessonIndex >= courseLessons.length - 1) return;
    courseLessonIndex += 1;
    renderCourseLesson();
  });
  els.btnCourseHome?.addEventListener("click", goHome);
  els.btnKitHome?.addEventListener("click", goHome);
  els.navHome.addEventListener("click", goHome);
  els.crumbHome.addEventListener("click", goHome);
  if (els.langBtn) {
    els.langBtn.addEventListener("click", () => setLang(lang === "ru" ? "en" : "ru"));
  }

  // Term tooltip (like roadmap): hover = short definition, no native title.
  document.addEventListener("pointerover", (e) => {
    const t = e.target?.closest?.(".glossary-term");
    if (t && t.dataset.definition) showTermTip(t);
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target?.closest?.(".glossary-term")) hideTermTip();
  });
  // Click on a glossary term jumps to its entry on the «Термины курса» page.
  document.addEventListener("click", (e) => {
    const t = e.target?.closest?.(".glossary-term");
    if (t && t.dataset.term) {
      e.preventDefault();
      e.stopPropagation();
      hideTermTip();
      const idx = courseLessons.findIndex((l) => l.isCourseGlossary);
      if (idx !== -1) {
        courseLessonIndex = idx;
        renderCourseLesson();
      }
    }
  });
  document.addEventListener("scroll", hideTermTip, { passive: true });

  loadPrefs();
  loadTestLibraryFromStorage();
  loadCourseLibraryFromStorage();
  loadKitLibraryFromStorage();
  syncHomeUi();
  discoverExports();
})();
