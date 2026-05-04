export type ReadinessBand =
  | "Foundations Missing"
  | "Entering Algebra 1"
  | "Algebra Ready"
  | "Meets/Masters Candidate";

export type LetterGrade = "A" | "B" | "C" | "D" | "F";
export type PriorityLevel = "High" | "Medium" | "Low";

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
};

export type QuestionMapItem = {
  question_id: string;
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

export type RawAppData = {
  roster: Student[];
  diagnostics: DiagnosticResult[];
  questionMap: QuestionMapItem[];
  reflections: Reflection[];
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
  totalScore: number;
  totalPossible: number;
  percentage: number;
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

export type ClassSummary = {
  period: string;
  label: string;
  studentCount: number;
  averageScore: number;
  medianScore: number;
  foundationsMissingPct: number;
  enteringPct: number;
  algebraReadyPct: number;
  meetsMastersPct: number;
  weakestSkill: string;
  strongestSkill: string;
  interventionCount: number;
  enrichmentCount: number;
  recommendations: string[];
};

export type OverallSummary = {
  totalStudents: number;
  classCount: number;
  averageDiagnosticScore: number;
  foundationsMissingPct: number;
  algebraReadyPct: number;
  weakestSkillOverall: string;
  interventionCount: number;
  enrichmentCount: number;
};

export type DerivedData = {
  students: StudentProfile[];
  classes: ClassSummary[];
  skills: SkillMastery[];
  groups: InterventionGroup[];
  summary: OverallSummary;
};
