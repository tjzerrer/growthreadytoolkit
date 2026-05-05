"use client";

import { downloadCsv } from "./csv";
import { standardMapToCsvRows } from "./standards";
import type { DerivedData, QuestionStandardMap } from "./types";

export function exportGroups(data: DerivedData) {
  downloadCsv(
    "growthready-intervention-groups.csv",
    data.groups.map((group) => ({
      group: group.groupName,
      student_id: group.student.student_id,
      student_name: `${group.student.first_name} ${group.student.last_name}`,
      class_period: group.classPeriod,
      reason: group.reason,
      suggested_activity: group.suggestedActivity,
      trajectory: group.student.staarTrajectory,
      growth_indicator: group.student.growthIndicator,
    })),
  );
}

export function exportClassSummary(data: DerivedData) {
  downloadCsv(
    "growthready-class-summary.csv",
    data.classes.map((item) => ({
      class_period: item.period,
      students: item.studentCount,
      average_score: item.averageScore,
      average_percent: item.averagePercent,
      median_score: item.medianScore,
      foundations_missing_pct: item.foundationsMissingPct,
      entering_algebra_pct: item.enteringPct,
      algebra_ready_pct: item.algebraReadyPct,
      meets_masters_pct: item.meetsMastersPct,
      weakest_skill: item.weakestSkill,
      strongest_skill: item.strongestSkill,
      intervention_count: item.interventionCount,
      enrichment_count: item.enrichmentCount,
      masters_trajectory_pct: item.trajectoryPercentages["Masters Trajectory"],
      meets_trajectory_pct: item.trajectoryPercentages["Meets Trajectory"],
      approaches_trajectory_pct: item.trajectoryPercentages["Approaches Trajectory"],
      did_not_meet_risk_pct: item.trajectoryPercentages["Did Not Meet Risk"],
      dominant_trajectory: item.dominantTrajectory,
    })),
  );
}

export function exportStudents(data: DerivedData) {
  downloadCsv(
    "growthready-student-profiles.csv",
    data.students.map((student) => ({
      student_id: student.student_id,
      student_name: `${student.first_name} ${student.last_name}`,
      class_period: student.class_period,
      score: `${student.totalScore}/${student.totalPossible}`,
      percentage: student.percentage,
      grade: student.letterGrade,
      readiness_band: student.readinessBand,
      algebra_readiness_index: student.algebraReadinessIndex,
      staar_trajectory: student.staarTrajectory,
      prior_staar_performance_level: student.priorStaar?.prior_performance_level,
      growth_indicator: student.growthIndicator,
      strongest_skill: student.strongestSkill,
      weakest_skill: student.weakestSkill,
      intervention_flags: student.interventionFlags.join("; "),
      enrichment: student.enrichment,
      recommended_next_move: student.recommendedNextMove,
    })),
  );
}

export function exportSkills(data: DerivedData) {
  downloadCsv(
    "growthready-skill-mastery.csv",
    data.skills.map((skill) => ({
      skill: skill.skill,
      zone: skill.zone,
      teks: skill.teks,
      question_count: skill.questionCount,
      percent_correct: skill.percentCorrect,
      critical: skill.critical,
      priority: skill.priority,
    })),
  );
}

export function exportReportingCategoryMastery(data: DerivedData) {
  downloadCsv("growthready-reporting-category-mastery.csv", data.reportingCategories.map((category) => ({
    category: category.category,
    average: category.average,
    mastered_pct: category.statusDistribution.Mastered,
    proficient_pct: category.statusDistribution.Proficient,
    approaching_pct: category.statusDistribution.Approaching,
    struggling_pct: category.statusDistribution.Struggling,
    not_enough_evidence_pct: category.statusDistribution["Not Enough Evidence"],
    priority: category.priority,
    suggested_next_action: category.suggestedNextAction,
  })));
}

export function exportTeksMastery(data: DerivedData) {
  downloadCsv("growthready-teks-mastery.csv", data.teksProgress.map((row) => ({
    teks: row.teks,
    teacher_description: row.teacherDescription,
    skill: row.skill,
    reporting_category: row.reportingCategory,
    tagged_questions: row.taggedQuestionCount,
    students_with_evidence: row.studentsWithEvidence,
    average: row.average,
    status: row.status,
    movement: row.movement,
    priority: row.priority,
    recommended_move: row.recommendedMove,
  })));
}

export function exportBreakoutMastery(data: DerivedData) {
  downloadCsv("growthready-breakout-mastery.csv", data.breakouts.map((row) => ({
    breakout_id: row.breakoutId,
    teks: row.teks,
    teacher_description: row.teacherDescription,
    representation_type: row.representationType,
    skill_type: row.skillType,
    mapped_questions: row.mappedQuestions,
    average: row.average,
    status: row.status,
    guidance: row.guidance,
  })));
}

export function exportQuestionStandardMap(standardMap: QuestionStandardMap[] = []) {
  downloadCsv("growthready-question-to-teks-breakout-map.csv", standardMapToCsvRows(standardMap));
}
