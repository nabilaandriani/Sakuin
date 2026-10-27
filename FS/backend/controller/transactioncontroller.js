const pool = require("../config/db");

const applyToDream = async (client, tx, sign) => {
  if (tx.type !== "expense" || !tx.saving_id) return;

  const result = await client.query(
    `
    UPDATE dream_goals
    SET terkumpul = GREATEST(COALESCE(terkumpul, 0) + $1::numeric, 0)
    WHERE id = $2
      AND user_id = $3
    `,
    [sign * Number(tx.amount), tx.saving_id, tx.user_id]
  );

  if (sign > 0 && result.rowCount === 0) {
    const error = new Error("Impian tujuan tidak ditemukan");
    error.status = 404;
    throw error;
  }
};

const sendError = (res, error, fallbackMessage) => {
  console.error(error);

  res.status(error.status || 500).json({
    success: false,
    message: error.status ? error.message : fallbackMessage,
  });
};

const resolveSavingId = (type, savingId) =>
  type === "expense" && savingId ? savingId : null;

// GET
const getTransactions = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log("USER ID SUMMARY:", userId);

    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// POST
const createTransaction = async (req, res) => {
  const { title, category, amount, type, date, user_id } = req.body;
  const saving_id = resolveSavingId(type, req.body.saving_id);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const newTx = await client.query(
      `
      INSERT INTO transactions
      (title, category, amount, type, date, user_id, saving_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [title, category, amount, type, date, user_id, saving_id]
    );

    await applyToDream(client, newTx.rows[0], +1);

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      data: newTx.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    sendError(res, error, "Gagal menyimpan data");
  } finally {
    client.release();
  }
};

// PUT
const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { title, category, amount, type, date, user_id } = req.body;
  const saving_id = resolveSavingId(type, req.body.saving_id);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const oldResult = await client.query(
      "SELECT * FROM transactions WHERE id = $1 AND user_id = $2 FOR UPDATE",
      [id, user_id]
    );

    const oldTx = oldResult.rows[0];

    if (!oldTx) {
      const error = new Error("Transaksi tidak ditemukan");
      error.status = 404;
      throw error;
    }

    await applyToDream(client, oldTx, -1);

    const updated = await client.query(
      `
      UPDATE transactions
      SET
        title = $1,
        category = $2,
        amount = $3,
        type = $4,
        date = $5,
        saving_id = $6
      WHERE id = $7
        AND user_id = $8
      RETURNING *
      `,
      [title, category, amount, type, date, saving_id, id, user_id]
    );

    await applyToDream(client, updated.rows[0], +1);

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Transaksi berhasil diupdate!",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    sendError(res, error, "Gagal mengupdate data");
  } finally {
    client.release();
  }
};

// DELETE
const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const oldResult = await client.query(
      "SELECT * FROM transactions WHERE id = $1 AND user_id = $2 FOR UPDATE",
      [id, userId]
    );

    const oldTx = oldResult.rows[0];

    if (!oldTx) {
      const error = new Error("Transaksi tidak ditemukan");
      error.status = 404;
      throw error;
    }

    await applyToDream(client, oldTx, -1);

    await client.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Transaksi berhasil dihapus!",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    sendError(res, error, "Gagal menghapus data");
  } finally {
    client.release();
  }
};

// SUMMARY
const getSummary = async (req, res) => {
  try {
    const { userId } = req.query;

    const result = await pool.query(
      `
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) AS income,
        COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS expense
      FROM transactions
      WHERE user_id = $1
      `,
      [userId]
    );

    const income = Number(result.rows[0].income);
    const expense = Number(result.rows[0].expense);

    res.json({
      success: true,
      totalIncome: income,
      totalExpense: expense,
      netSurplus: income - expense,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal ambil summary",
    });
  }
};

module.exports = {
  getTransactions,
  getSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
