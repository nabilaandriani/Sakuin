const pool =
require("../config/db");

// GET PROFILE
const getProfile =
async (req, res) => {

  try {

    if (!req.user) {
      return res
      .status(401)
      .json({
        success: false,
        message:
          "Unauthorized"
      });
    }

    const userId =
      req.user.id;

    const result =
      await pool.query(
        `
        SELECT
          id,
          name,
          email,
          phone
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

    res.json({
      success: true,
      data:
        result.rows[0]
    });

  } catch (error) {

    console.error(
      error
    );

    res.status(500)
    .json({
      success: false,
      message:
      "Server error"
    });
  }
};


// UPDATE PROFILE
const updateProfile =
async (req, res) => {

  try {

    const userId =
      req.user.id;

    const {
      name,
      email,
      phone
    } = req.body;

    const result =
      await pool.query(
        `
        UPDATE users
        SET
          name = $1,
          email = $2,
          phone = $3
        WHERE id = $4
        RETURNING *
        `,
        [
          name,
          email,
          phone,
          userId
        ]
      );

    res.json({
      success: true,
      data:
        result.rows[0]
    });

  } catch (error) {

    console.error(
      error
    );

    res.status(500)
    .json({
      success: false,
      message:
      "Server error"
    });
  }
};


// UPDATE PASSWORD
const updatePassword =
async (req, res) => {

  try {

    const userId =
      req.user.id;

    const {
      oldPassword,
      newPassword
    } = req.body;

    const user =
      await pool.query(
        `
        SELECT password
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

    if (
      user.rows[0]
      .password !==
      oldPassword
    ) {

      return res
      .status(400)
      .json({
        success: false,
        message:
        "Password lama salah"
      });
    }

    await pool.query(
      `
      UPDATE users
      SET password = $1
      WHERE id = $2
      `,
      [
        newPassword,
        userId
      ]
    );

    res.json({
      success: true,
      message:
      "Password updated"
    });

  } catch (error) {

    console.error(
      error
    );

    res.status(500)
    .json({
      success: false,
      message:
      "Server error"
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword
};