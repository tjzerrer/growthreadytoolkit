import { defaultSettings, gradeOrder } from "./settings";
import type {
  AppSettings,
  ClassSummary,
  DerivedData,
  DiagnosticResult,
  InterventionGroup,
  LetterGrade,
  PriorityLevel,
  QuestionMapItem,
  RawAppData,
  ReadinessBand,
  SkillMastery,
  StudentProfile,
} from "./types";

const round = (value: number) => Math.round(value * 10) / 10;
const pct = (correct: number, total: number) => (total ? round((correct / total) * 100) : 0);

export function getLetterGrade(percentage: number, settings: AppSettings = defaultSettings): LetterGrade {
  return gradeOrder.find((grade) => percentage >= settings.gradeCutoffs[grade]) ?? "F";
}

export function getReadinessBand(score: number, settings: AppSettings = defaultSettings): ReadinessBand {
  if (score <= settings.readinessBands.foundationsMax) return "Foundations Missing";
  if (score <= settings.readinessBands.enteringMax) return "Entering Algebra 1";
  if (score <= settings.readinessBands.readyMax) return "Algebra Ready";
  return "Meets/Masters Candidate";
}

export function getPriority(percentCorrect: number, critical: boolean): PriorityLevel {
  if (critical && percentCorrect < 70) return "High";
  if (percentCorrect < 80) return "Medium";
  return "Low";
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : round((sorted[middle - 1] + sorted[middle]) / 2);
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function masteryForQuestions(result: DiagnosticResult, questions: QuestionMapItem[]) {
  const attempted = questions.filter((q) => result.attemptedQuestions?.[q.question_id] ?? true);
  const correct = attempted.reduce((sum, q) => sum + Number(result.answers[q.question_id] ?? 0), 0);
  const possible = attempted.reduce((sum, q) => sum + (result.possiblePoints?.[q.question_id] ?? q.points_possible ?? 1), 0);
  return pct(correct, possible);
}

function bestAndWorst(entries: Record<string, number>) {
  const sorted = Object.entries(entries).sort((a, b) => b[1] - a[1]);
  return {
    strongest: sorted[0]?.[0] ?? "Not enough data",
    weakest: sorted[sorted.length - 1]?.[0] ?? "Not enough data",
  };
}

function buildSkillMasteryForStudents(
  diagnostics: DiagnosticResult[],
  questionMap: QuestionMapItem[],
  settings: AppSettings,
): SkillMastery[] {
  const scoredDiagnostics = diagnostics.filter((d) => (d.attemptedQuestionCount ?? Object.keys(d.answers).length) > 0);
  const skills = unique(questionMap.map((q) => q.skill));
  const classPeriods = unique(diagnostics.map((d) => d.class_period));

  return skills.map((skill) => {
    const questions = questionMap.filter((q) => q.skill === skill);
    const correct = scoredDiagnostics.reduce(
      (sum, result) =>
        sum +
        questions.reduce((inner, q) => {
          const attempted = result.attemptedQuestions?.[q.question_id] ?? true;
          return inner + (attempted ? Number(result.answers[q.question_id] ?? 0) : 0);
        }, 0),
      0,
    );
    const total = scoredDiagnostics.reduce(
      (sum, result) =>
        sum +
        questions.reduce((inner, q) => {
          const attempted = result.attemptedQuestions?.[q.question_id] ?? true;
          return inner + (attempted ? (result.possiblePoints?.[q.question_id] ?? q.points_possible ?? 1) : 0);
        }, 0),
      0,
    );
    const percentCorrect = pct(correct, total);
    const critical = questions.some((q) => q.critical);
    const byClass = Object.fromEntries(
      classPeriods.map((period) => {
        const classDiagnostics = diagnostics.filter((d) => d.class_period === period);
        const scoredClassDiagnostics = classDiagnostics.filter((d) => (d.attemptedQuestionCount ?? Object.keys(d.answers).length) > 0);
        const classCorrect = classDiagnostics.reduce(
          (sum, result) =>
            sum +
            questions.reduce((inner, q) => {
              const attempted = result.attemptedQuestions?.[q.question_id] ?? true;
              return inner + (attempted ? Number(result.answers[q.question_id] ?? 0) : 0);
            }, 0),
          0,
        );
        const classPossible = scoredClassDiagnostics.reduce(
          (sum, result) =>
            sum +
            questions.reduce((inner, q) => {
              const attempted = result.attemptedQuestions?.[q.question_id] ?? true;
              return inner + (attempted ? (result.possiblePoints?.[q.question_id] ?? q.points_possible ?? 1) : 0);
            }, 0),
          0,
        );
        return [period, pct(classCorrect, classPossible)];
      }),
    );

    return {
      skill,
      zone: unique(questions.map((q) => q.zone)).join(", "),
      teks: unique(questions.map((q) => q.teks)).join(", "),
      questionCount: questions.length,
      percentCorrect,
      byClass,
      critical,
      priority: getPriority(percentCorrect, critical || percentCorrect < settings.skillMasteryThreshold),
    };
  });
}

function recommendedMove(flags: string[], enrichment: boolean, weakestZone: string) {
  if (enrichment) return "Assign enrichment with multi-representation linear modeling and non-routine problem solving.";
  if (flags.includes("Equation Support")) return "Start a short equation fluency mini-cycle with error analysis and daily checks.";
  if (flags.includes("Number Sense Support")) return "Use daily 5-minute number sense warm-ups with quick feedback.";
  if (flags.includes("Graphing/Slope Support")) return "Practice graph interpretation routines and slope from context.";
  if (flags.includes("Function Thinking Support")) return "Use input-output, pattern, and function notation routines.";
  return `Use targeted practice on ${weakestZone} and reassess with a short exit ticket.`;
}

function buildStudentProfile(
  result: DiagnosticResult,
  questionMap: QuestionMapItem[],
  appData: RawAppData,
  settings: AppSettings,
): StudentProfile {
  const attemptedQuestionCount = result.attemptedQuestionCount ?? questionMap.filter((q) => result.attemptedQuestions?.[q.question_id] ?? true).length;
  const incomplete = Boolean(result.incomplete || attemptedQuestionCount === 0);
  const totalPossible = result.totalPointsPossible ?? questionMap.reduce((sum, q) => {
    const attempted = result.attemptedQuestions?.[q.question_id] ?? true;
    return sum + (attempted ? (result.possiblePoints?.[q.question_id] ?? q.points_possible ?? 1) : 0);
  }, 0);
  const totalScore = result.totalPointsEarned ?? questionMap.reduce((sum, q) => {
    const attempted = result.attemptedQuestions?.[q.question_id] ?? true;
    return sum + (attempted ? Number(result.answers[q.question_id] ?? 0) : 0);
  }, 0);
  const percentage = pct(totalScore, totalPossible);
  const letterGrade = getLetterGrade(percentage, settings);
  const readinessEquivalentScore = round((percentage / 100) * 20);
  const readinessBand = incomplete ? "Foundations Missing" : getReadinessBand(readinessEquivalentScore, settings);
  const criticalQuestions = questionMap.filter((q) => q.critical);
  const missedCriticalQuestions = criticalQuestions
    .filter((q) => (result.attemptedQuestions?.[q.question_id] ?? true) && Number(result.answers[q.question_id] ?? 0) < (result.possiblePoints?.[q.question_id] ?? q.points_possible ?? 1))
    .map((q) => `${q.question_id}: ${q.skill}`);

  const zones = unique(questionMap.map((q) => q.zone));
  const zoneMastery = Object.fromEntries(zones.map((zone) => [zone, masteryForQuestions(result, questionMap.filter((q) => q.zone === zone))]));
  const zoneRank = bestAndWorst(zoneMastery);

  const skillRows = buildSkillMasteryForStudents([result], questionMap, settings);
  const skillRank = bestAndWorst(Object.fromEntries(skillRows.map((row) => [row.skill, row.percentCorrect])));
  const equations = questionMap.filter((q) => q.zone === "Equations");
  const numberSense = questionMap.filter((q) => q.zone === "Number Sense");
  const graphing = questionMap.filter((q) => q.zone === "Graphing");
  const functions = questionMap.filter((q) => q.zone === "Functions");

  const interventionFlags: string[] = [];
  if (!incomplete && (percentage < 50 || missedCriticalQuestions.length >= settings.criticalQuestionThreshold)) interventionFlags.push("Immediate Intervention");
  if (!incomplete && equations.length && masteryForQuestions(result, equations) < 60) {
    interventionFlags.push("Equation Support");
  }
  if (!incomplete && numberSense.length && masteryForQuestions(result, numberSense) < 60) interventionFlags.push("Number Sense Support");
  if (!incomplete && graphing.length && masteryForQuestions(result, graphing) < 60) interventionFlags.push("Graphing/Slope Support");
  if (!incomplete && functions.length && masteryForQuestions(result, functions) < 60) interventionFlags.push("Function Thinking Support");

  const enrichment = !incomplete && percentage >= 85 && missedCriticalQuestions.length <= 1;
  const recommendedNextMove = recommendedMove(interventionFlags, enrichment, zoneRank.weakest);
  const reflection = appData.reflections.find((item) => item.student_id === result.student_id);
  const parentSummary = `${result.first_name} is beginning Algebra 1 with strength in ${skillRank.strongest}. The main area for growth is ${skillRank.weakest}. The recommended next step is ${recommendedNextMove} We will continue tracking progress through short checks and targeted practice.`;

  return {
    ...result,
    attemptedQuestionCount,
    incomplete,
    totalScore,
    totalPossible,
    percentage,
    letterGrade,
    readinessBand,
    strongestSkill: skillRank.strongest,
    weakestSkill: skillRank.weakest,
    strongestZone: zoneRank.strongest,
    weakestZone: zoneRank.weakest,
    missedCriticalQuestions,
    criticalMissedCount: missedCriticalQuestions.length,
    skillMastery: skillRows,
    zoneMastery,
    interventionFlags,
    enrichment,
    recommendedNextMove,
    reflection,
    parentSummary,
  };
}

function buildGroups(students: StudentProfile[]): InterventionGroup[] {
  const activities: Record<string, string> = {
    "Immediate Intervention": "Small-group reteach with prerequisite skill checklist and a 5-question recheck.",
    "Equation Support": "Three-day equation fluency mini-cycle: model, practice, error analysis.",
    "Number Sense Support": "Daily number sense warm-ups focused on integers, fractions, percents, and order of operations.",
    "Graphing/Slope Support": "Graph interpretation routine plus slope-from-points and slope-from-context practice.",
    "Function Thinking Support": "Function table, notation, and pattern-rule task set.",
    Enrichment: "Multi-representation linear modeling task with non-routine extension questions.",
    "No Data / Not Started": "Check assignment access, login status, and whether the student needs time to begin the diagnostic.",
  };

  return students.flatMap((student) => {
    if (student.incomplete) {
      return [{
        groupName: "No Data / Not Started",
        student,
        classPeriod: student.class_period || "Unassigned",
        reason: student.class_period === "Unassigned" ? "No section or no scored attempts in the export." : "No scored attempts in the export.",
        suggestedActivity: activities["No Data / Not Started"],
      }];
    }
    const interventionRows = student.interventionFlags.map((flag) => ({
      groupName: flag,
      student,
      classPeriod: student.class_period,
      reason: flag === "Immediate Intervention" ? `${student.totalScore}/${student.totalPossible}, ${student.criticalMissedCount} critical missed` : `Weakest zone: ${student.weakestZone}`,
      suggestedActivity: activities[flag],
    }));
    return student.enrichment
      ? [
          ...interventionRows,
          {
            groupName: "Enrichment",
            student,
            classPeriod: student.class_period,
            reason: `${student.percentage}% overall with ${student.criticalMissedCount} critical question(s) missed`,
            suggestedActivity: activities.Enrichment,
          },
        ]
      : interventionRows;
  });
}

function classRecommendations(students: StudentProfile[], questionMap: QuestionMapItem[]) {
  const resultMap = Object.fromEntries(students.map((s) => [s.student_id, s]));
  const missPctForZone = (zone: string) => {
    const questions = questionMap.filter((q) => q.zone === zone);
    const scoredStudents = students.filter((student) => !student.incomplete);
    const possible = questions.reduce(
      (sum, question) =>
        sum +
        scoredStudents.reduce((inner, student) => {
          const attempted = resultMap[student.student_id].attemptedQuestions?.[question.question_id] ?? true;
          return inner + (attempted ? (resultMap[student.student_id].possiblePoints?.[question.question_id] ?? question.points_possible ?? 1) : 0);
        }, 0),
      0,
    );
    const missed = students.reduce(
      (sum, student) =>
        sum +
        questions.reduce((inner, q) => {
          if (student.incomplete) return inner;
          const attempted = resultMap[student.student_id].attemptedQuestions?.[q.question_id] ?? true;
          const possibleForQuestion = resultMap[student.student_id].possiblePoints?.[q.question_id] ?? q.points_possible ?? 1;
          return inner + (attempted ? possibleForQuestion - Number(resultMap[student.student_id].answers[q.question_id] ?? 0) : 0);
        }, 0),
      0,
    );
    return pct(missed, possible);
  };

  const recs: string[] = [];
  if (missPctForZone("Equations") > 50) recs.push("Run a 3-day equation fluency mini-cycle.");
  if (missPctForZone("Number Sense") > 40) recs.push("Add daily 5-minute number sense warm-ups.");
  if (missPctForZone("Graphing") > 40) recs.push("Use graph interpretation routines and slope-from-context practice.");
  if (students.filter((s) => s.readinessBand === "Meets/Masters Candidate").length / Math.max(students.length, 1) > 0.25) {
    recs.push("Offer enrichment tied to multi-representation linear modeling and non-routine problems.");
  }
  return recs.length ? recs : ["Use the weakest-skill group for targeted reteach, then reassess with a short exit ticket."];
}

function buildClassSummaries(students: StudentProfile[], questionMap: QuestionMapItem[], settings: AppSettings): ClassSummary[] {
  return unique(students.map((s) => s.class_period)).map((period) => {
    const classStudents = students.filter((s) => s.class_period === period);
    const scoredClassStudents = classStudents.filter((s) => !s.incomplete);
    const skillAverages = Object.fromEntries(
      unique(questionMap.map((q) => q.skill)).map((skill) => [
        skill,
        round(scoredClassStudents.reduce((sum, student) => sum + (student.skillMastery.find((row) => row.skill === skill)?.percentCorrect ?? 0), 0) / Math.max(scoredClassStudents.length, 1)),
      ]),
    );
    const skillRank = bestAndWorst(skillAverages);
    return {
      period,
      label: settings.classLabels[period] || (period === "Unassigned" ? "Unassigned" : `Period ${period}`),
      studentCount: classStudents.length,
      averageScore: round(scoredClassStudents.reduce((sum, s) => sum + s.totalScore, 0) / Math.max(scoredClassStudents.length, 1)),
      averagePercent: round(scoredClassStudents.reduce((sum, s) => sum + s.percentage, 0) / Math.max(scoredClassStudents.length, 1)),
      medianScore: median(scoredClassStudents.map((s) => s.totalScore)),
      foundationsMissingPct: pct(classStudents.filter((s) => s.readinessBand === "Foundations Missing").length, classStudents.length),
      enteringPct: pct(classStudents.filter((s) => s.readinessBand === "Entering Algebra 1").length, classStudents.length),
      algebraReadyPct: pct(classStudents.filter((s) => s.readinessBand === "Algebra Ready").length, classStudents.length),
      meetsMastersPct: pct(classStudents.filter((s) => s.readinessBand === "Meets/Masters Candidate").length, classStudents.length),
      weakestSkill: skillRank.weakest,
      strongestSkill: skillRank.strongest,
      interventionCount: classStudents.filter((s) => s.interventionFlags.length).length,
      enrichmentCount: classStudents.filter((s) => s.enrichment).length,
      recommendations: classRecommendations(classStudents, questionMap),
    };
  });
}

export function deriveData(appData: RawAppData, settings: AppSettings = defaultSettings): DerivedData {
  const diagnostics = appData.diagnostics.length ? appData.diagnostics : [];
  const questionMap = appData.questionMap;
  const students = diagnostics.map((result) => buildStudentProfile(result, questionMap, appData, settings));
  const skills = buildSkillMasteryForStudents(diagnostics, questionMap, settings).sort((a, b) => a.percentCorrect - b.percentCorrect);
  const classes = buildClassSummaries(students, questionMap, settings);
  const groups = buildGroups(students);
  const scoredStudents = students.filter((student) => !student.incomplete);
  const summary = {
    totalStudents: students.length,
    classCount: classes.length,
    averageDiagnosticScore: round(scoredStudents.reduce((sum, s) => sum + s.totalScore, 0) / Math.max(scoredStudents.length, 1)),
    averageDiagnosticPercent: round(scoredStudents.reduce((sum, s) => sum + s.percentage, 0) / Math.max(scoredStudents.length, 1)),
    foundationsMissingPct: pct(students.filter((s) => s.readinessBand === "Foundations Missing").length, students.length),
    algebraReadyPct: pct(students.filter((s) => s.readinessBand === "Algebra Ready" || s.readinessBand === "Meets/Masters Candidate").length, students.length),
    weakestSkillOverall: skills[0]?.skill ?? "Not enough data",
    interventionCount: students.filter((s) => s.interventionFlags.length).length,
    enrichmentCount: students.filter((s) => s.enrichment).length,
  };

  return { students, classes, skills, groups, summary };
}
