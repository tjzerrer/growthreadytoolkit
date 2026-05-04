"use client";

import { downloadCsv } from "./csv";
import type { DerivedData } from "./types";

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
      median_score: item.medianScore,
      foundations_missing_pct: item.foundationsMissingPct,
      entering_algebra_pct: item.enteringPct,
      algebra_ready_pct: item.algebraReadyPct,
      meets_masters_pct: item.meetsMastersPct,
      weakest_skill: item.weakestSkill,
      strongest_skill: item.strongestSkill,
      intervention_count: item.interventionCount,
      enrichment_count: item.enrichmentCount,
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
