const DAY = 86400000;
const MIN_DAYS_FOR_PACE = 3;
const EXCLUDED_CATEGORIES = ["Investasi"];
const FIXED_CATEGORIES = ["Tagihan/ Kos"];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const diffDays = (a, b) => Math.round((b - a) / DAY);

function makeDate(y, m, day) {
    const first = new Date(y, m, 1);
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    return new Date(first.getFullYear(), first.getMonth(), Math.min(day, last));
}

export function getCycleRange(anchorDay, today = new Date()) {
    const t = startOfDay(today);
    let start = makeDate(t.getFullYear(), t.getMonth(), anchorDay);
    if (start > t) start = makeDate(t.getFullYear(), t.getMonth() - 1, anchorDay);
    const next = makeDate(start.getFullYear(), start.getMonth() + 1, anchorDay);
    return { start, next };
}

const SALARY_CATEGORIES = ["Gaji/ Pemasukan", "Gaji / Pemasukan"];
const isSalary = (tx) =>
    tx.type === "income" && SALARY_CATEGORIES.includes(tx.category);

export function findSalaryAnchorDay(transactions, today = new Date()) {
    const t = startOfDay(today);
    let latest = null;
    for (const tx of transactions) {
        if (!isSalary(tx)) continue;
        const d = startOfDay(new Date(tx.date));
        if (d > t) continue;
        if (!latest || d > latest) latest = d;
    }
    return latest ? latest.getDate() : null;
}

export function calculateBudgetStatus(config, transactions, today = new Date()) {
    const {
        fixedExpenses = 0,
        savingsAllocation = 0,
        anchorDay: manualAnchor,
    } = config || {};

    const autoAnchor = findSalaryAnchorDay(transactions, today);
    const anchorDay = manualAnchor || autoAnchor;

    if (!anchorDay) return { status: "kosong" };

    const { start, next } = getCycleRange(anchorDay, today);
    const t = startOfDay(today);

    const totalDays = diffDays(start, next);
    const daysLeft = diffDays(t, next);
    const daysElapsed = totalDays - daysLeft + 1;

    let salaryCycle = 0;
    let spentCycle = 0;
    let spentToday = 0;
    let fixedCycle = 0;

    for (const tx of transactions) {
        const d = startOfDay(new Date(tx.date));
        if (d < start || d >= next) continue;

        const amt = Number(tx.amount) || 0;

        if (tx.type === "income") {
            if (isSalary(tx)) salaryCycle += amt;
            continue;
        }

        if (tx.type !== "expense") continue;

        if (FIXED_CATEGORIES.includes(tx.category)) {   // baru
            fixedCycle += amt;
            continue;
        }

        if (EXCLUDED_CATEGORIES.includes(tx.category)) continue;

        spentCycle += amt;
        if (d.getTime() === t.getTime()) spentToday += amt;
    }

    const allowance = salaryCycle;
    if (allowance <= 0) return { status: "kosong" };

    const operational = allowance - savingsAllocation - fixedCycle;
    const remaining = operational - spentCycle;

    const budgetAtStartOfToday = remaining + spentToday;
    const dailyAllowance =
        Math.max(budgetAtStartOfToday, 0) / Math.max(daysLeft, 1);
    const remainingToday = dailyAllowance - spentToday;

    const tomorrowAllowance =
        daysLeft > 1 ? Math.max(remaining, 0) / (daysLeft - 1) : null;

    const plannedDaily = operational > 0 ? operational / totalDays : 0;

    const projectedSpend = (spentCycle / daysElapsed) * totalDays;
    const projectedLeftover = Math.max(operational - projectedSpend, 0);

    const pctSpent = operational > 0 ? spentCycle / operational : 0;
    const pctTime = daysElapsed / totalDays;
    const pace = pctTime > 0 ? pctSpent / pctTime : 0;

    let status = "aman";
    if (operational <= 0 || remaining <= 0) status = "defisit";
    else if (daysElapsed >= MIN_DAYS_FOR_PACE) {
        if (pace > 1.25) status = "siaga";
        else if (pace > 1.0) status = "waspada";
    }

    return {
        status, pace, allowance, operational, fixedCycle,
        spentCycle, spentToday, remaining,
        dailyAllowance, remainingToday, tomorrowAllowance, plannedDaily,
        projectedLeftover,
        daysLeft, daysElapsed, totalDays,
        anchorDay, anchorIsAuto: !manualAnchor,
        pctSpent: Math.round(pctSpent * 100),
        pctTime: Math.round(pctTime * 100),
        nextPayday: next,
        overToday: spentToday > dailyAllowance,
    };
}

export function suggestMonthlySavings(goals = [], today = new Date()) {
    const total = goals
        .filter((g) => !g.tercapai)
        .reduce((sum, g) => {
            const remaining = Math.max(Number(g.target) - Number(g.terkumpul), 0);
            if (remaining === 0 || !g.deadline) return sum;

            const dl = new Date(g.deadline);
            const months = Math.max(
                (dl.getFullYear() - today.getFullYear()) * 12 +
                (dl.getMonth() - today.getMonth()),
                1,
            );
            return sum + remaining / months;
        }, 0);

    return Math.ceil(total);
}