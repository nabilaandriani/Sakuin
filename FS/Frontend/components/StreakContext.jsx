import { createContext, useContext, useEffect, useState } from "react";

const StreakContext = createContext(null);

const STORAGE_KEY = "streakData";
const DEFAULT_STATE = {
  streakCount: 0,
  longestStreak: 0,
  totalCount: 0,
  lastActiveDate: null,
  history: [],
  maxStreak: 500,
  streakBump: 0,
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.floor((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

export function StreakProvider({ children }) {
  const [streak, setStreak] = useState(DEFAULT_STATE);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setStreak({ ...DEFAULT_STATE, ...JSON.parse(saved) });
  }, []);

  function recordTransaction() {
    setStreak((prev) => {
      const next = { ...prev };
      const today = todayStr();
      const isNewDay = next.lastActiveDate !== today;
      let streakIncreased = false;

      if (isNewDay) {
        if (!next.lastActiveDate) {
          next.streakCount = 1;
          streakIncreased = true;
        } else {
          const diff = daysBetween(next.lastActiveDate, today);
          if (diff === 1) {
            next.streakCount += 1;
            streakIncreased = true;
          } else if (diff > 1) {
            next.streakCount = 1;
            streakIncreased = true;
          }
        }

        next.lastActiveDate = today;
        next.history = [...next.history, today].slice(-7);
        next.longestStreak = Math.max(next.longestStreak, next.streakCount);

        if (next.streakCount === next.maxStreak) {
          next.streakCount = 0;
        }
      }

      next.totalCount += 1;

      if (streakIncreased) {
        next.streakBump = (next.streakBump || 0) + 1;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <StreakContext.Provider value={{ streak, recordTransaction }}>
      {children}
    </StreakContext.Provider>
  );
}

export function useStreakContext() {
  return useContext(StreakContext);
}