const pool = require("../config/db");

// GET ALL
const getDreamGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `
      SELECT *
      FROM dream_goals
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch goals",
    });
  }
};

// CREATE
const createDreamGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { emoji, nama, target, terkumpul, deadline, catatan, warna } = req.body;

    const result = await pool.query(
      `
      INSERT INTO dream_goals
      (
        user_id,
        nama,
        emoji,
        warna,
        target,
        terkumpul,
        deadline,
        catatan
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        userId,
        nama,
        emoji,
        warna,
        target,
        terkumpul || 0,
        deadline,
        catatan
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create goal",
    });
  }
};

// UPDATE
const updateDreamGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { emoji, nama, target, terkumpul, deadline, catatan, warna } = req.body;

    const result = await pool.query(
      `
      UPDATE dream_goals
      SET
        nama = $1,
        emoji = $2,
        warna = $3,
        target = $4,
        terkumpul = $5,
        deadline = $6,
        catatan = $7
      WHERE
        id = $8
        AND user_id = $9
        AND COALESCE(tercapai, false) = false
      RETURNING *
      `,
      [
        nama,
        emoji,
        warna,
        target,
        terkumpul,
        deadline,
        catatan,
        id,
        userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message:
          "Impian tidak ditemukan atau sudah tercapai, sehingga tidak bisa diedit",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update goal",
    });
  }
};

// DELETE
const deleteDreamGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      `
      DELETE
      FROM dream_goals
      WHERE
        id = $1
        AND user_id = $2
      `,
      [id, userId]
    );

    res.json({
      success: true,
      message: "Goal deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete goal",
    });
  }
};

// MARK ACHIEVED
const markAchieved = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `
      UPDATE dream_goals
      SET
        tercapai = true,
        tanggal_tercapai = COALESCE(tanggal_tercapai, CURRENT_TIMESTAMP)
      WHERE
        id = $1 AND user_id = $2
      RETURNING *
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Goal tidak ditemukan" });
    }

    res.json({
      success: true,
      message: "Goal berhasil ditandai selesai",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal menandai goal",
    });
  }
};

const togglePause = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { dijeda } = req.body;

    if (typeof dijeda !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Nilai dijeda harus true atau false",
      });
    }

    const result = await pool.query(
      `
      UPDATE dream_goals
      SET dijeda = $1
      WHERE
        id = $2
        AND user_id = $3
        AND COALESCE(tercapai, false) = false
      RETURNING *
      `,
      [dijeda, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Goal tidak ditemukan atau sudah tercapai",
      });
    }

    res.json({
      success: true,
      message: dijeda ? "Goal dijeda" : "Goal dilanjutkan",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mengubah status goal",
    });
  }
};

module.exports = {
  getDreamGoals,
  createDreamGoal,
  updateDreamGoal,
  deleteDreamGoal,
  markAchieved,
  togglePause,
};