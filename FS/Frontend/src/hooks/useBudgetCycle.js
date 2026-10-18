import { useState, useCallback } from "react";

export function useBudgetCycle(userId) {
  const key = `cerminsaku_cycle_${userId}`;

  const [config, setConfig] = useState(() => {
    if (!userId) return null;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const saveConfig = useCallback(
    (next) => {
      setConfig(next);
      localStorage.setItem(key, JSON.stringify(next));
    },
    [key],
  );

  return { config, saveConfig };
}