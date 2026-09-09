const pool = require('../config/db');

// 1. GET
const getTransactions = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log(
      "USER ID SUMMARY:",
      userId
    );

    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY id DESC',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
};

// 2. POST
const createTransaction = async (req, res) => {
  try {
    const {
      title,
      category,
      amount,
      type,
      date,
      user_id
    } = req.body;

    const newTx = await pool.query(
      `
      INSERT INTO transactions
      (title, category, amount, type, date, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        title,
        category,
        amount,
        type,
        date,
        user_id
      ]
    );

    res.status(201).json({
      success: true,
      data: newTx.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal menyimpan data"
    });
  }
};

// 3. PUT
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      category,
      amount,
      type,
      date,
      user_id
    } = req.body;

    await pool.query(
      `
      UPDATE transactions
      SET
        title = $1,
        category = $2,
        amount = $3,
        type = $4,
        date = $5
      WHERE id = $6
      AND user_id = $7
      `,
      [
        title,
        category,
        amount,
        type,
        date,
        id,
        user_id
      ]
    );

    res.status(200).json({
      success: true,
      message: "Transaksi berhasil diupdate!"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mengupdate data"
    });
  }
};

// 4. DELETE
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.status(200).json({
      success: true,
      message: "Transaksi berhasil dihapus!"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus data"
    });
  }
};

const getSummary = async (
  req,
  res
) => {
  try {

    const { userId } =
      req.query;

    const result =
      await pool.query(
        `
        SELECT
          COALESCE(
            SUM(amount)
            FILTER (
              WHERE type = 'income'
            ),
            0
          ) AS income,

          COALESCE(
            SUM(amount)
            FILTER (
              WHERE type = 'expense'
            ),
            0
          ) AS expense

        FROM transactions
        WHERE user_id = $1
        `,
        [userId]
      );

    const income =
      Number(
        result.rows[0]
        .income
      );

    const expense =
      Number(
        result.rows[0]
        .expense
      );

    res.json({
      success: true,

      totalIncome:
        income,

      totalExpense:
        expense,

      netSurplus:
        income -
        expense,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message:
      "Gagal ambil summary",
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