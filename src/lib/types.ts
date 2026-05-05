export type ReadinessBand =
  | "Foundations Missing"
  | "Entering Algebra 1"
  | "Algebra Ready"
  | "Meets/Masters Candidate";

export type LetterGrade = "A" | "B" | "C" | "D" | "F";
export type PriorityLevel = "High" | "Medium" | "Low";
export type StaarTrajectory =
  | "Masters Trajectory"
  | "Meets Trajectory"
  | "Approaches Trajectory"
  | "Did Not Meet Risk";
export type GrowthIndicator = "Accelerating" | "On Track" | "Flat" | "At Risk" | "Unknown";
export type TeksStatus = "Mastered" | "Proficient" | "Approaching" | "Struggling" | "Not Enough Evidence";
export type TeksMovement = "Improving" | "Stable" | "Slipping" | "Stuck" | "Not Enough Evidence";
export type TeksPriority = "High Priority" | "Medium Priority" | "Low Priority" | "Watch";
export type EvidenceType = "Current" | "Spiral Recent" | "Spiral Older" | "Prerequisite" | "Enrichment" | "Assessment";
export type AssignmentType = "Diagnostic" | "Practice" | "Spiral Review" | "Quiz/Checkpoint" | "Test/Common Assessment" | "Teacher-Scored Work";
export type ReadinessType = "Readiness" | "Supporting";
export type RepresentationType = "table" | "graph" | "equation" | "verbal" | "real-world" | "symbolic" | "multiple representations" | "unknown";
export type BreakoutSkillType = "solve" | "write" | "graph" | "interpret" | "identify" | "evaluate" | "simplify" | "transform" | "model" | "justify" | "unknown";

export const reportingCategories = [
  "Number and Algebraic Methods",
  "Describing and Graphing Linear Functions, Equations and Inequalities",
  "Writing and Solving Linear Functions, Equations and Inequalities",
  "Quadratic Functions and Equations",
  "Exponential Functions and Equations",
] as const;

export type ReportingCategory = (typeof reportingCategories)[number];

export type Student = {
  student_id: string;
  first_name: string;
  last_name: string;
  class_period: string;
};

export type ClassPeriod = {
  period: string;
  label: string;
};

export type DiagnosticResult = Student & {
  answers: Record<string, number>;
  possiblePoints?: Record<string, number>;
  attemptedQuestions?: Record<string, boolean>;
  totalPointsEarned?: number;
  totalPointsPossible?: number;
  attemptedQuestionCount?: number;
  incomplete?: boolean;
  source?: "simple" | "myopenmath";
  email?: string;
  student_name?: string;
};

export type QuestionMapItem = {
  question_id: string;
  question_label?: string;
  myopenmath_question_id?: string;
  points_possible?: number;
  skill: string;
  teks: string;
  zone: string;
  critical: boolean;
  reporting_category?: ReportingCategory | string;
  evidence_type?: EvidenceType;
  assignment_type?: AssignmentType;
  assignment_key?: string;
  custom_weight?: number;
  teacher_description?: string;
  breakout_id?: string;
};

export type QuestionStandardMap = {
  question_label: string;
  mom_question_id: string;
  standard_code: string;
  breakout_id?: string;
  teacher_description: string;
  skill_category: string;
  reporting_category: ReportingCategory | string;
  evidence_type: EvidenceType;
  critical: boolean;
  custom_weight?: number;
};

export type StaarBlueprintCategory = {
  id: string;
  name: ReportingCategory;
  readinessStandards: number;
  supportingStandards: number;
  questions: string;
  points: string;
  priority: "Medium" | "Medium-High" | "High" | "Highest";
};

export type AlgebraTeks = {
  teks_code: string;
  teks_description: string;
  reporting_category_id: string;
  readiness_or_supporting: ReadinessType;
  student_friendly_skill: string;
  default_zone: string;
};

export type TeksBreakout = {
  breakout_id: string;
  teks_code: string;
  breakout_description: string;
  teacher_friendly_description: string;
  representation_type: RepresentationType;
  skill_type: BreakoutSkillType;
};

export type Reflection = {
  student_id: string;
  confidence_rating?: string;
  goal?: string;
  concern?: string;
  preferred_support?: string;
};

export type PriorStaarRecord = {
  student_id: string;
  prior_staar_year?: string;
  prior_staar_test?: string;
  prior_scale_score?: string;
  prior_performance_level?: string;
  prior_growth_level?: string;
  notes?: string;
};

export type RawAppData = {
  roster: Student[];
  diagnostics: DiagnosticResult[];
  questionMap: QuestionMapItem[];
  reflections: Reflection[];
  priorStaar?: PriorStaarRecord[];
  assignmentType?: AssignmentType;
  teksOverrides?: TeksOverride[];
  standardMap?: QuestionStandardMap[];
};

export type TeksOverride = {
  student_id: string;
  teks: string;
  status: TeksStatus;
};

export type AppSettings = {
  gradeCutoffs: Record<LetterGrade, number>;
  readinessBands: {
    foundationsMax: number;
    enteringMax: number;
    readyMax: number;
  };
  criticalQuestionThreshold: number;
  skillMasteryThreshold: number;
  classLabels: Record<string, string>;
  trajectory: {
    mastersCutoff: number;
    meetsCutoff: number;
    approachesCutoff: number;
    didNotMeetCutoff: number;
    badges: Record<StaarTrajectory, { name: string; color: "blue" | "green" | "yellow" | "red"; icon: string }>;
  };
};

export type SkillMastery = {
  skill: string;
  zone: string;
  teks: string;
  questionCount: number;
  percentCorrect: number;
  byClass: Record<string, number>;
  critical: boolean;
  priority: PriorityLevel;
};

export type TeksProgress = {
  teks: string;
  skill: string;
  teacherDescription: string;
  reportingCategory: string;
  taggedQuestionCount: number;
  studentsWithEvidence: number;
  status: TeksStatus;
  average: number;
  masteredPct: number;
  proficientPct: number;
  approachingPct: number;
  strugglingPct: number;
  notEnoughEvidencePct: number;
  movement: TeksMovement;
  priority: TeksPriority;
  recommendedMove: string;
  critical: boolean;
  studentStatuses: Record<string, TeksStatus>;
};

export type BreakoutProgress = {
  breakoutId: string;
  teks: string;
  breakoutDescription: string;
  teacherDescription: string;
  representationType: RepresentationType;
  skillType: BreakoutSkillType;
  mappedQuestions: number;
  average: number;
  status: TeksStatus;
  masteredPct: number;
  proficientPct: number;
  approachingPct: number;
  strugglingPct: number;
  notEnoughEvidencePct: number;
  guidance: string;
};

export type StudentTeksProgress = {
  teks: string;
  skill: string;
  teacherDescription: string;
  reportingCategory: string;
  status: TeksStatus;
  movement: TeksMovement;
  evidenceCount: number;
  assignmentCount: number;
  recentAverage: number;
  overallAverage: number;
  recommendedNextSkill: string;
  teacherOverride?: TeksStatus;
};

export type StudentBreakoutProgress = {
  breakoutId: string;
  teks: string;
  teacherDescription: string;
  status: TeksStatus;
  evidenceCount: number;
  average: number;
};

export type ClassTeksSummary = {
  topPriorityTeks: TeksProgress[];
  strongestTeks: TeksProgress[];
  interventionByTeks: { teks: string; skill: string; teacherDescription: string; students: Student[] }[];
  enrichmentByTeks: { teks: string; skill: string; teacherDescription: string; students: Student[] }[];
};

export type ReportingCategoryProgress = {
  category: string;
  average: number;
  statusDistribution: Record<TeksStatus, number>;
  movement: TeksMovement;
  priority: TeksPriority;
  suggestedNextAction: string;
};

export type StudentProfile = Student & {
  answers: Record<string, number>;
  possiblePoints?: Record<string, number>;
  attemptedQuestions?: Record<string, boolean>;
  attemptedQuestionCount: number;
  incomplete: boolean;
  email?: string;
  student_name?: string;
  totalScore: number;
  totalPossible: number;
  percentage: number;
  algebraReadinessIndex: number;
  staarTrajectory: StaarTrajectory;
  letterGrade: LetterGrade;
  readinessBand: ReadinessBand;
  strongestSkill: string;
  weakestSkill: string;
  strongestZone: string;
  weakestZone: string;
  missedCriticalQuestions: string[];
  criticalMissedCount: number;
  skillMastery: SkillMastery[];
  zoneMastery: Record<string, number>;
  interventionFlags: string[];
  enrichment: boolean;
  recommendedNextMove: string;
  priorStaar?: PriorStaarRecord;
  growthIndicator: GrowthIndicator;
  evidenceTable: { evidence: string; value: string; note: string }[];
  reflection?: Reflection;
  parentSummary: string;
  teksProgress: StudentTeksProgress[];
  strongestTeks: string;
  weakestTeks: string;
  nextRecommendedSkill: string;
  reportingCategoryStatus: ReportingCategoryProgress[];
  breakoutProgress: StudentBreakoutProgress[];
  strongestReportingCategory: string;
  weakestReportingCategory: string;
  highestPriorityTeks: string;
  highestPriorityBreakout: string;
};

export type InterventionGroup = {
  groupName: string;
  student: StudentProfile;
  classPeriod: string;
  reason: string;
  suggestedActivity: string;
};

export type MyOpenMathDetectedQuestion = {
  question_id: string;
  question_label: string;
  myopenmath_question_id: string;
  points_possible: number;
  pointsColumnIndex: number;
  timeSpentColumnIndex?: number;
};

export type MyOpenMathPreviewStudent = {
  student_name: string;
  section: string;
  email: string;
  attemptedQuestionCount: number;
  totalPointsEarned: number;
  totalPointsPossible: number;
  percentScore: number;
  incomplete: boolean;
};

export type MyOpenMathParseResult = {
  diagnostics: DiagnosticResult[];
  detectedQuestions: MyOpenMathDetectedQuestion[];
  previewStudents: MyOpenMathPreviewStudent[];
  errors: string[];
};

export type ClassSummary = {
  period: string;
  label: string;
  studentCount: number;
  averageScore: number;
  averagePercent: number;
  medianScore: number;
  foundationsMissingPct: number;
  enteringPct: number;
  algebraReadyPct: number;
  meetsMastersPct: number;
  weakestSkill: string;
  strongestSkill: string;
  interventionCount: number;
  enrichmentCount: number;
  trajectoryCounts: Record<StaarTrajectory, number>;
  trajectoryPercentages: Record<StaarTrajectory, number>;
  dominantTrajectory: StaarTrajectory;
  recommendations: string[];
  teksSummary: ClassTeksSummary;
  categoryMastery: ReportingCategoryProgress[];
  weakBreakouts: BreakoutProgress[];
  strongBreakouts: BreakoutProgress[];
  spiralRetentionWarnings: string[];
};

export type OverallSummary = {
  totalStudents: number;
  classCount: number;
  averageDiagnosticScore: number;
  averageDiagnosticPercent: number;
  foundationsMissingPct: number;
  algebraReadyPct: number;
  weakestSkillOverall: string;
  interventionCount: number;
  enrichmentCount: number;
  trajectoryCounts: Record<StaarTrajectory, number>;
  highestDidNotMeetRiskClasses: { period: string; label: string; percentage: number }[];
  highestMastersClasses: { period: string; label: string; percentage: number }[];
};

export type DerivedData = {
  students: StudentProfile[];
  classes: ClassSummary[];
  skills: SkillMastery[];
  teksProgress: TeksProgress[];
  reportingCategories: ReportingCategoryProgress[];
  breakouts: BreakoutProgress[];
  groups: InterventionGroup[];
  summary: OverallSummary;
};
