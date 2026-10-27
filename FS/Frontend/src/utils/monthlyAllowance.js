const pad = (value) => String(value).padStart(2, "0");

export function formatRupiah(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

export function getLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

export function toDateKey(value) {
  if (!value) return "";

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) return text.split("T")[0];

  return getLocalDateKey(parsed);
}

/** Ambil transaksi yang jatuh di bulan kalender dari `today`. */
export function filterByMonth(transactions = [], today = new Date()) {
  const monthKey = getLocalDateKey(today).slice(0, 7);

  return transactions.filter((item) => toDateKey(item.date).startsWith(monthKey));
}

export function calculateMonthlyAllowance({
  monthlyLimit,
  savingsAllocation = 0,
  transactions = [],
  today = new Date(),
}) {
  const limit = Math.max(0, Number(monthlyLimit) || 0);
  const savings = Math.min(limit, Math.max(0, Number(savingsAllocation) || 0));
  const spendLimit = limit - savings;

  const todayKey = getLocalDateKey(today);
  const totalDays = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  const daysLeft = totalDays - today.getDate() + 1;

  let spentMonth = 0;
  let spentToday = 0;

  filterByMonth(transactions, today).forEach((item) => {
    if (item.type !== "expense") return;

    const amount = Number(item.amount) || 0;

    spentMonth += amount;

    if (toDateKey(item.date) === todayKey) spentToday += amount;
  });

  const remaining = spendLimit - spentMonth;
  const startOfDayBalance = remaining + spentToday;

  const dailyAllowance =
    startOfDayBalance > 0 ? Math.floor(startOfDayBalance / daysLeft) : 0;

  const todayLeft = dailyAllowance - spentToday;

  const percentage =
    spendLimit > 0
      ? Math.min(Math.round((spentMonth / spendLimit) * 100), 100)
      : spentMonth > 0
        ? 100
        : 0;

  let level = "safe";

  if (limit === 0) level = "unset";
  else if (remaining < 0) level = "over";
  else if (percentage >= 80) level = "warning";

  return {
    limit,
    savings,
    spendLimit,
    spentMonth,
    spentToday,
    remaining,
    percentage,
    daysLeft,
    dailyAllowance,
    todayLeft,
    level,
  };
}
