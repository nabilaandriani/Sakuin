import { createContext, useContext, useEffect, useState } from "react";

const StreakContext = createContext(null);

const STORAGE_KEY = "streakData";
const DEFAULT_STATE = {
  streakCount: 0,
  longestStreak: 0,
  totalCount: 0,
  lastActiveDate: null,
  history: [],
  maxStreak: 200,
  streakBump: 0,
};

export function toLocalDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

function expireIfMissed(state) {
  if (!state.lastActiveDate || state.streakCount === 0) return state;
  const diff = daysBetween(state.lastActiveDate, toLocalDateStr());
  if (diff > 1) {
    return { ...state, streakCount: 0 };
  }
  return state;
}

export function StreakProvider({ children }) {
  const [streak, setStreak] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const initial = saved
        ? { ...DEFAULT_STATE, ...JSON.parse(saved), streakBump: 0 }
        : DEFAULT_STATE;
      return expireIfMissed(initial);
    } catch {
      return DEFAULT_STATE;
    }
  });

  useEffect(() => {
    const check = () => {
      setStreak((prev) => {
        const next = expireIfMissed(prev);
        if (next !== prev) {
          const { streakBump, ...toSave } = next;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        }
        return next;
      });
    };

    check();
    const interval = setInterval(check, 60 * 1000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  function recordTransaction() {
    setStreak((prev) => {
      const next = { ...prev };
      const today = toLocalDateStr();
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
