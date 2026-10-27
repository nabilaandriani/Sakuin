import { useCallback, useEffect, useState } from "react";

const storageKey = (userId) => `cerminsaku_budget_limit_${userId}`;

function readLimit(userId) {
  if (!userId) return 0;

  try {
    return Number(localStorage.getItem(storageKey(userId))) || 0;
  } catch {
    return 0;
  }
}

export function useMonthlyBudget(userId) {
  const [monthlyLimit, setLimit] = useState(() => readLimit(userId));

  useEffect(() => {
    setLimit(readLimit(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;

    const handleStorage = (event) => {
      if (event.key === storageKey(userId)) setLimit(readLimit(userId));
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [userId]);

  const setMonthlyLimit = useCallback(
    (value) => {
      const next = Math.max(0, Number(value) || 0);

      if (userId) {
        try {
          localStorage.setItem(storageKey(userId), String(next));
        } catch (error) {
          console.error("Gagal menyimpan jatah bulanan:", error);
        }
      }

      setLimit(next);
    },
    [userId],
  );

  return { monthlyLimit, setMonthlyLimit };
}
