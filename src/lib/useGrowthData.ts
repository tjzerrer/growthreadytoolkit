"use client";

import { useEffect, useMemo, useState } from "react";
import { deriveData } from "./calculations";
import { defaultSettings } from "./settings";
import { loadSettings, loadStoredData, saveSettings as persistSettings, saveStoredData } from "./storage";
import type { AppSettings, RawAppData } from "./types";

export function useGrowthData() {
  const [rawData, setRawData] = useState<RawAppData | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRawData(loadStoredData());
    setSettings(loadSettings());
    setReady(true);
  }, []);

  const saveData = (data: RawAppData) => {
    saveStoredData(data);
    setRawData(data);
  };

  const updateSettings = (nextSettings: AppSettings) => {
    persistSettings(nextSettings);
    setSettings(nextSettings);
  };

  const derived = useMemo(() => (rawData ? deriveData(rawData, settings) : null), [rawData, settings]);

  return { rawData, data: derived, settings, ready, saveData, updateSettings };
}
