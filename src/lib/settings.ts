import type { AppSettings, LetterGrade } from "./types";

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
};

export const gradeOrder: LetterGrade[] = ["A", "B", "C", "D", "F"];
