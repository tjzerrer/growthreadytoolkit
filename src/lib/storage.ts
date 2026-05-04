"use client";

import { defaultSettings } from "./settings";
import type { AppSettings, RawAppData } from "./types";

const DATA_KEY = "growthready:data:v1";
const SETTINGS_KEY = "growthready:settings:v1";
const NOTES_KEY = "growthready:notes:v1";

export function loadStoredData(): RawAppData | null {
  const value = localStorage.getItem(DATA_KEY);
  return value ? (JSON.parse(value) as RawAppData) : null;
}

export function saveStoredData(data: RawAppData) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export function clearStoredData() {
  localStorage.removeItem(DATA_KEY);
}

export function loadSettings(): AppSettings {
  const value = localStorage.getItem(SETTINGS_KEY);
  return value ? { ...defaultSettings, ...(JSON.parse(value) as AppSettings) } : defaultSettings;
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadNotes(): Record<string, string> {
  const value = localStorage.getItem(NOTES_KEY);
  return value ? (JSON.parse(value) as Record<string, string>) : {};
}

export function saveNote(studentId: string, note: string) {
  const notes = loadNotes();
  notes[studentId] = note;
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}
