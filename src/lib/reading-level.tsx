import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ReadingLevel = "layman" | "clinical" | "scientist";

const STORAGE_KEY = "zfhx4-reading-level";

interface ReadingLevelContextValue {
  readingLevel: ReadingLevel;
  setReadingLevel: (level: ReadingLevel) => void;
}

const ReadingLevelContext = createContext<ReadingLevelContextValue | null>(null);

export function ReadingLevelProvider({ children }: { children: ReactNode }) {
  const [readingLevel, setReadingLevelState] = useState<ReadingLevel>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "clinical" || saved === "scientist" ? saved : "layman";
  });

  const setReadingLevel = useCallback((level: ReadingLevel) => {
    setReadingLevelState(level);
    window.localStorage.setItem(STORAGE_KEY, level);
  }, []);

  const value = useMemo(() => ({ readingLevel, setReadingLevel }), [readingLevel, setReadingLevel]);
  return <ReadingLevelContext.Provider value={value}>{children}</ReadingLevelContext.Provider>;
}

export function useReadingLevel() {
  const context = useContext(ReadingLevelContext);
  if (!context) throw new Error("useReadingLevel must be used inside ReadingLevelProvider");
  return context;
}

export const readingLevelLabels: Record<ReadingLevel, string> = {
  layman: "Easy to follow",
  clinical: "For care teams",
  scientist: "Research deep dive",
};
