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
  groups: InterventionGroup[];
  summary: OverallSummary;
};
