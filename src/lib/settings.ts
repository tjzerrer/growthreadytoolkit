import type { AppSettings, LetterGrade, StaarTrajectory } from "./types";

export const defaultSettings: AppSettings = {
  gradeCutoffs: { A: 90, B: 80, C: 70, D: 60, F: 0 },
  readinessBands: {
    foundationsMax: 8,
    enteringMax: 12,
    readyMax: 16,
  },
  criticalQuestionThreshold: 3,
  skillMasteryThreshold: 80,
  classLabels: {},
  trajectory: {
    mastersCutoff: 85,
    meetsCutoff: 70,
    approachesCutoff: 50,
    didNotMeetCutoff: 0,
    badges: {
      "Masters Trajectory": { name: "Masters Trajectory", color: "blue", icon: "shield" },
      "Meets Trajectory": { name: "Meets Trajectory", color: "green", icon: "badge" },
      "Approaches Trajectory": { name: "Approaches Trajectory", color: "yellow", icon: "badge" },
      "Did Not Meet Risk": { name: "Did Not Meet Risk", color: "red", icon: "badge" },
    },
  },
};

export const gradeOrder: LetterGrade[] = ["A", "B", "C", "D", "F"];
export const trajectoryOrder: StaarTrajectory[] = ["Masters Trajectory", "Meets Trajectory", "Approaches Trajectory", "Did Not Meet Risk"];
