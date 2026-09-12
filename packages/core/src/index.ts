export {
  SkillSchema,
  QuestionSchema,
  TermSchema,
  TermKindSchema,
  ProfileSchema,
  LevelSchema,
  RequirementSchema,
  ContentBasisSchema,
  DistractorQualityModeSchema,
  CoverageModeSchema,
  GateModeSchema,
  QualityConfigSchema,
  SdmConfigSchema,
  type Skill,
  type Question,
  type Term,
  type TermKind,
  type Profile,
  type Level,
  type ContentBasis,
  type SdmConfig,
  type QualityConfig,
  type CoverageMode,
  type GateMode,
} from "./schemas.js";

export {
  hashSkillContent,
  hashLevelContent,
  buildContentBasis,
  buildSkillBasis,
  nowCapturedAt,
} from "./content-basis.js";

export {
  buildTestPackageId,
  buildCoursePackageId,
  buildKitPackageId,
  hashContentRevision,
  hashModuleRevision,
  buildRevisionByModule,
  type TestPackageIdentityInput,
  type CoursePackageIdentityInput,
  type CoursePackageScopeIdentity,
} from "./export-package-identity.js";

export {
  CONTENT_STALE_SCHEMA,
  runContentStale,
  countBasisMismatches,
  type ContentStaleDocument,
  type ContentStaleRun,
  type RunContentStaleOptions,
  type StaleItem,
  type StaleWorkItem,
} from "./content-stale.js";

export {
  scanExportArtifacts,
  exportMatchesScope,
  type ExportArtifactRef,
} from "./export-artifacts.js";

export {
  DEFAULT_QUALITY_CONFIG,
  loadQualityConfig,
  effectiveDistractorMode,
  distractorSettingsFromQuality,
} from "./quality-config.js";

export { readYamlFile, writeYamlFile } from "./yaml.js";

export {
  initMethodologyProject,
  isMethodologyProject,
  type InitOptions,
  type InitResult,
} from "./init.js";

export {
  syncPlayerAssets,
  copyPlayerTemplateInto,
  type SyncPlayerOptions,
  type SyncPlayerResult,
} from "./player-sync.js";

export {
  syncStudioAssets,
  copyStudioTemplateInto,
  type SyncStudioOptions,
  type SyncStudioResult,
} from "./studio-sync.js";

export {
  STUDIO_VIEW_SCHEMA,
  STUDIO_ACTION_SCHEMA,
  studioBridgePaths,
  pushStudioView,
  pullStudioAction,
  readStudioViewFile,
  writeStudioActionFile,
  startStudioServe,
  parseStudioViewDocument,
  parseStudioActionDocument,
  type StudioBridgePaths,
  type PushStudioViewResult,
  type PullStudioActionResult,
  type StartStudioServeOptions,
  type StudioServeHandle,
} from "./studio-bridge.js";

export {
  buildStudioCoverageView,
  pushStudioCoverage,
  type BuildStudioCoverageViewOptions,
  type PushStudioCoverageResult,
} from "./studio-coverage.js";

export { SdmError } from "./errors.js";

export { findProjectRoot, locateProject, listMethodologyProjects, PROJECT_MANIFEST } from "./project-root.js";

export {
  loadLevel,
  loadProfile,
  loadQuestions,
  assertProfileLevelMatch,
  hasLegacyRolesDirectory,
  parseLevelDocument,
  parseProfileDocument,
  profilePath,
  type LoadWarning,
} from "./loaders.js";

export {
  MIN_OK_QUESTIONS,
  DEPTH_OK_RATIO,
  statusForCount,
  countQuestionsBySkill,
  maxDifficultyBySkill,
  depthRatio,
  computeCoverage,
  type CoverageStatus,
  type SkillCoverage,
  type CoverageResult,
  type CoverageWorkItem,
} from "./coverage.js";

export {
  runCertCoverage,
  type CertCoverageOptions,
  type CertCoverageRun,
} from "./cert-coverage.js";

export {
  runCertGaps,
  type CertGapsRun,
} from "./cert-gaps.js";

export {
  listQuestions,
  type ListQuestionsOptions,
  type ListQuestionsRun,
} from "./question-list.js";

export {
  generateQuestions,
  type GenerateQuestionsOptions,
  type GenerateQuestionsResult,
  type GenerateQuestionsContext,
  type QuestionDraftStub,
} from "./question-generate.js";

export {
  ACTIVE_MIX_TYPES,
  TypeMixPresetSchema,
  parseTypeMixPreset,
  activeTypesForMix,
  assignTypesForMix,
  assertTypeAndMixExclusive,
  type TypeMixPreset,
} from "./question-type-mix.js";

export {
  skillExists,
  assertSkillExists,
  loadSkill,
  loadAllSkills,
  skillFilePath,
} from "./skills.js";

export {
  buildSkillGraph,
  buildSkillGraphFromProject,
  detectCycles,
  withProposedDepends,
  assertAcyclicDepends,
  type SkillGraph,
} from "./skill-graph.js";

export {
  inferEdgesFromContent,
  inferEdgesForProject,
  type SuggestedEdge,
} from "./skill-edge-inference.js";

export {
  runSkillGraph,
  runSkillImpact,
  SKILL_IMPACT_SCHEMA,
  type RunSkillGraphOptions,
  type RunSkillImpactOptions,
  type SkillGraphDocument,
  type SkillGraphRun,
  type SkillImpactDocument,
  type SkillImpactRun,
  type SkillImpactQuestionRef,
} from "./skill-graph-ops.js";

export {
  AUDIT_SCHEMA,
  runMethodologyAudit,
  jaccardSimilarity,
  findLexicalDuplicates,
  type AuditDocument,
  type AuditRun,
  type LexicalDuplicate,
  type AuditRecommendation,
  type WeightSumFinding,
  type PositionBiasFinding,
  type RunAuditOptions,
} from "./audit.js";

export { resolveLocale, type SdmLocale } from "./locale.js";

export {
  CORPUS_MANIFEST_SCHEMA,
  CORPUS_ARTIFACT_TYPES,
  CORPUS_ENTRY_STATUSES,
  CorpusEntrySchema,
  CorpusManifestSchema,
  scanCorpusSources,
  extractTopicCandidates,
  type CorpusArtifactType,
  type CorpusEntryStatus,
  type CorpusEntry,
  type CorpusManifest,
  type ScanCorpusOptions,
} from "./corpus-scan.js";

export {
  QUALITY_REPORT_SCHEMA,
  DENSITY_LEVELS,
  DENSITY_SYMBOL,
  MATRIX_LEGEND_RU,
  MATRIX_LEGEND_EN,
  BUILTIN_GLOSSARY_RU,
  BUILTIN_GLOSSARY_EN,
  QualityReportDocumentSchema,
  buildQualityReport,
  formatQualityReportText,
  loadQualityReport,
  saveQualityReport,
  diffQualityReports,
  qualityReportsDir,
  type DensityLevel,
  type QualityReportDocument,
  type BuildQualityReportOptions,
  type QualityReportRun,
} from "./quality-report.js";

export {
  DEFAULT_DISTRACTOR_QUALITY,
  evaluateOptionLengthQuality,
  evaluatePositionBias,
  shuffleChoiceOptions,
  shuffleQuestionOptions,
  shuffleDocumentQuestions,
  mulberry32,
  correctIndexes,
  correctOptionLength,
  isChoiceQuestion,
  type DistractorQualityMode,
  type DistractorQualitySettings,
  type LengthQualityResult,
  type PositionBiasResult,
  type ShuffledChoice,
} from "./distractor-quality.js";

export {
  SEMANTIC_INDEX_SCHEMA,
  rebuildSemanticIndex,
  searchSemanticIndex,
  semanticSimilarity,
  semanticIndexPath,
  type IndexedDocument,
  type SemanticIndex,
  type SearchHit,
} from "./semantic-index.js";

export {
  addQuestion,
  generateQuestionId,
  type AddQuestionInput,
  type AddQuestionResult,
} from "./question-add.js";

export {
  validateQuestion,
  validateQuestionDraft,
  validateQuestionLibraryDeep,
  difficultyLabel,
  throwIfValidateErrors,
  type ValidateIssue,
  type ValidateQuestionResult,
  type ValidateQuestionOptions,
  type DeepValidateIssue,
  type DeepValidateQuestionResult,
} from "./question-validate.js";

export {
  addSkill,
  linkSkill,
  parseSkillIdList,
  type AddSkillInput,
  type LinkSkillInput,
  type SkillWriteResult,
  type SkillWriteWarning,
} from "./skill-write.js";

export {
  createProfile,
  type CreateProfileInput,
  type CreateProfileResult,
} from "./profile-write.js";

export {
  createCertification,
  parseRequirementTriple,
  type CreateCertificationInput,
  type CreateCertificationResult,
} from "./cert-write.js";

export {
  patchCertification,
  type PatchCertificationInput,
  type PatchCertificationResult,
} from "./cert-patch.js";

export {
  reweightCertification,
  type ReweightCertificationInput,
  type ReweightCertificationResult,
} from "./cert-reweight.js";

export {
  WEIGHT_SUM_EPSILON,
  WEIGHT_PRECISION,
  roundWeight,
  sumWeights,
  weightSumIsValid,
  assertWeightSum,
  normalizeWeights,
  parseWeightTransfer,
  parseWeightSet,
  weightMap,
} from "./weights.js";

export {
  EXPORT_TEST_SCHEMA,
  EXPORT_MATRIX_SCHEMA,
  exportTest,
  exportMatrix,
  assembleTestDocument,
  assembleMatrixDocument,
  testDocumentToCsv,
  matrixDocumentToCsv,
  exportDocumentPayload,
  type ExportTestFormat,
  type ExportMatrixFormat,
  type ExportTestDocument,
  type ExportMatrixDocument,
  type ExportMatrixCell,
  type ExportTestOptions,
  type ExportMatrixOptions,
  type ExportTestRun,
  type ExportMatrixRun,
} from "./export.js";

export {
  EXPORT_COURSE_SCHEMA,
  COURSE_DEPTHS,
  COURSE_FORMATS,
  COURSE_LAYOUTS,
  COURSE_WARNING_CODES,
  SKILL_DESCRIPTION_MIN_CHARS,
  parseCourseDepth,
  parseCourseFormat,
  resolveCourseFormat,
  layoutForFormat,
  detectProseLocaleMixed,
  collectProseLocaleWarnings,
  orderSkillsByDepends,
  collectLearningWarnings,
  buildOverviewModule,
  seedGlossaryFromTopics,
  COURSE_OVERVIEW_SKILL_ID,
  COURSE_MODULE_KINDS,
  exportCourse,
  detectTruncation,
  TRUNCATION_WARNING_CODE,
  assertCourseContextReady,
  extractTopicsFromModules,
  mergeTopicsIntoSkill,
  suggestDescriptionFromModules,
  type CourseDepth,
  type CourseFormat,
  type CourseLayout,
  type CourseModuleKind,
  type CourseWarningCode,
  type CourseWarning,
  type CourseContentControls,
  type QuestionAnchor,
  type TeachingSkillView,
  type TeachingContext,
  type CourseLessonStub,
  type CourseModule,
  type CourseGlossaryEntry,
  type CourseFootnote,
  type ExportCourseDocument,
  type CourseScopeMeta,
  type ExportCourseOptions,
  type ExportCourseRun,
} from "./export-course.js";

export {
  labelDepth,
  formatDepthBand,
  DEPTH_BANDS,
  type DepthBandId,
  type DepthBandView,
} from "./depth-bands.js";

export {
  addTerm,
  type AddTermInput,
  type AddTermResult,
} from "./term-add.js";

export {
  listTerms,
  type ListTermsOptions,
  type ListTermsRun,
} from "./term-list.js";

export { loadTerms } from "./loaders.js";

export {
  loadTopics,
  buildTopicRegistry,
  syncTopicRegistryFromSkills,
  addTopic,
  mergeRegistryLabelsIntoSkills,
  type TopicRegistryIndex,
  type AddTopicInput,
} from "./topic-registry.js";

export {
  healCourseWarnings,
  type HealCourseResult,
} from "./course-heal.js";

export { TopicSchema, type Topic } from "./schemas.js";

export {
  hashTermContent,
  buildTermBasis,
} from "./content-basis.js";

export {
  EXPORT_KIT_SCHEMA,
  KIT_PROBE_TYPES,
  KIT_WARNING_CODES,
  parseKitFormat,
  isKitProbeType,
  isMiddlePlusLevel,
  collectKitWarnings,
  exportKit,
  renderKitHtml,
  type KitProbeType,
  type KitWarningCode,
  type KitWarning,
  type KitProbe,
  type KitModule,
  type KitGlossaryEntry,
  type KitChecklistItem,
  type ExportKitDocument,
  type ExportKitFormat,
  type ExportKitOptions,
  type ExportKitRun,
} from "./export-kit.js";

export {
  EXPORT_QUESTION_TYPES,
  applyExportTypeFilter,
  resolveExportTypeFilter,
  type ExportQuestionType,
  type ExportTypeFilter,
  type ExportTypeFilterMode,
} from "./export-type-filter.js";

export {
  applySkillFilterToRequirements,
  resolveExportSkillFilter,
  type ApplySkillFilterToRequirementsResult,
  type ExportSkillFilter,
  type ExportSkillFilterMode,
  type ResolveExportSkillFilterInput,
} from "./export-skill-filter.js";

export {
  applyExportQuestionFilter,
  resolveExportQuestionFilter,
  type ExportQuestionFilter,
  type ResolveExportQuestionFilterInput,
} from "./export-question-filter.js";

export {
  EXPORT_CONFLUENCE_SCHEMA,
  exportConfluence,
  type ExportConfluenceDocument,
  type ExportConfluenceOptions,
  type ExportConfluenceRun,
} from "./export-confluence.js";

export {
  TeamSchema,
  loadTeam,
  resolveLevelForTeam,
  teamFilePath,
  type Team,
} from "./teams.js";

export {
  EXPORT_MERMAID_SCHEMA,
  exportMermaid,
  assembleMermaidDocument,
  mermaidNodeId,
  type ExportMermaidDocument,
  type ExportMermaidNode,
  type ExportMermaidEdge,
  type ExportMermaidOptions,
  type ExportMermaidRun,
} from "./export-mermaid.js";

export {
  appendActionLog,
  withActionLog,
  redactForLog,
  rotateLogFile,
  actionLogDir,
  loadLoggingSettings,
  isLoggingEnvDisabled,
  resolveProjectRootForLog,
  DEFAULT_LOG_MAX_BYTES,
  DEFAULT_LOG_MAX_FILES,
  type ActionLogEntry,
  type ActionLogRecord,
  type ActionLogSource,
  type LoggingSettings,
} from "./action-log.js";

export {
  IntentPlanSchema,
  validateIntentPlan,
  parseIntentPlanJson,
  type IntentPlan,
  type ValidateIntentPlanResult,
} from "./intent-plan.js";

export {
  ABOUT_CLI_COMMANDS,
  ABOUT_MCP_TOOLS,
  AboutPayloadSchema,
  AboutSkillSchema,
  buildAbout,
  formatAboutText,
  getProductVersion,
  listPortableSkills,
  resolveSpecraHome,
  type AboutPayload,
  type BuildAboutOptions,
} from "./about.js";

export {
  SuggestPayloadSchema,
  SuggestItemSchema,
  SuggestLeverSchema,
  buildSuggest,
  formatSuggestText,
  type SuggestPayload,
  type SuggestItem,
  type SuggestLever,
  type BuildSuggestOptions,
} from "./suggest.js";
