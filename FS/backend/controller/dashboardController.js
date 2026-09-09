const pool = require("../config/db");

// GET /api/dashboard
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User belum terautentikasi",
      });
    }

    // =========================
    // TOTAL PEMASUKAN
    // =========================
    const incomeResult = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total_income
      FROM transactions
      WHERE user_id = $1
        AND type = 'income'
      `,
      [userId]
    );

    // =========================
    // TOTAL PENGELUARAN
    // =========================
    const expenseResult = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total_expense
      FROM transactions
      WHERE user_id = $1
        AND type = 'expense'
      `,
      [userId]
    );

    // =========================
    // TRANSAKSI TERBARU
    // Karena tabel tidak punya created_at,
    // gunakan id sebagai urutan terbaru.
    // =========================
    const recentResult = await pool.query(
      `
      SELECT id, title, category, amount, type, date, user_id
      FROM transactions
      WHERE user_id = $1
      ORDER BY id DESC
      LIMIT 5
      `,
      [userId]
    );

    // =========================
    // RINGKASAN KATEGORI
    // =========================
    const categoryResult = await pool.query(
      `
      SELECT
        category,
        COALESCE(SUM(amount), 0) AS total
      FROM transactions
      WHERE user_id = $1
        AND type = 'expense'
      GROUP BY category
      ORDER BY total DESC
      `,
      [userId]
    );

    // =========================
    // KONVERSI HASIL
    // =========================
    const totalIncome = Number(
      incomeResult.rows[0]?.total_income || 0
    );

    const totalExpense = Number(
      expenseResult.rows[0]?.total_expense || 0
    );

    const netBalance = totalIncome - totalExpense;

    // =========================
    // RESPONSE
    // =========================
    return res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance,
        recentTransactions: recentResult.rows,
        categories: categoryResult.rows,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : undefined,
    });
  }
};

module.exports = {
  getDashboardSummary,
};