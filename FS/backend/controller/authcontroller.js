const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const jwt = require("jsonwebtoken");

console.log(
  "MAIL_USER:",
  process.env.MAIL_USER
);

console.log(
  "MAIL_PASS:",
  process.env.MAIL_PASS
);
// EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// 1. REGISTER + KIRIM OTP
const register = async (req, res) => {
  try {
    const { name, email, password } =
      req.body;

    const userExist =
      await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

    if (
      userExist.rows.length > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Email sudah terdaftar!'
      });
    }

    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );

    // generate OTP
    const otp =
      otpGenerator.generate(6, {
        upperCaseAlphabets:
          false,
        lowerCaseAlphabets:
          false,
        specialChars: false
      });

    const otpExpired =
      new Date(
        Date.now() +
        5 * 60 * 1000
      );

    await pool.query(
      `
      INSERT INTO users
      (
        name,
        email,
        password,
        otp,
        otp_expired_at,
        is_verified
      )
      VALUES
      ($1, $2, $3, $4, $5, false)
      `,
      [
        name,
        email,
        hashedPassword,
        otp,
        otpExpired
      ]
    );

    // kirim email OTP
    await transporter.sendMail({
      from:
        `"CerminSaku" <${process.env.MAIL_USER}>`,
      to: email,
      subject:
        'Verifikasi OTP CerminSaku',
      html: `
      <div style="
        font-family: Arial;
        padding: 24px;
        background:#f8fafc;
      ">
        <h2 style="
          color:#0E4834;
        ">
          Verifikasi Akun
          CerminSaku
        </h2>

        <p>
          Halo ${name},
        </p>

        <p>
          Gunakan kode OTP
          berikut:
        </p>

        <div style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:8px;
          color:#10B981;
          margin:24px 0;
        ">
          ${otp}
        </div>

        <p>
          OTP berlaku
          selama
          <b>5 menit</b>
        </p>
      </div>
      `
    });

    res.status(200).json({
      success: true,
      message:
        'OTP berhasil dikirim!',
      email
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        'Terjadi kesalahan server'
    });
  }
};

// 2. VERIFY OTP
const verifyOtp = async (
  req,
  res
) => {
  try {
    const { email, otp } =
      req.body;

    const user =
      await pool.query(
        `
        SELECT *
        FROM users
        WHERE email = $1
        `,
        [email]
      );

    if (
      user.rows.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'User tidak ditemukan'
      });
    }

    const userData =
      user.rows[0];

    // cek OTP
    if (
      userData.otp !== otp
    ) {
      return res.status(400).json({
        success: false,
        message:
          'OTP salah!'
      });
    }

    // cek expired
    if (
      new Date() >
      new Date(
        userData.otp_expired_at
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'OTP sudah expired!'
      });
    }

    // verified
    await pool.query(
      `
      UPDATE users
      SET
      is_verified = true,
      otp = null,
      otp_expired_at = null
      WHERE email = $1
      `,
      [email]
    );

    res.status(200).json({
      success: true,
      message:
        'Email berhasil diverifikasi!'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        'Terjadi kesalahan server'
    });
  }
};

// 3. LOGIN
const login = async (
  req,
  res
) => {
  try {
    const {
      email,
      password
    } = req.body;

    const user =
      await pool.query(
        `
        SELECT *
        FROM users
        WHERE email = $1
        `,
        [email]
      );

    if (
      user.rows.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Akun tidak ditemukan!'
      });
    }

    // cek verified
    if (
      !user.rows[0]
        .is_verified
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Verifikasi email terlebih dahulu!'
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.rows[0]
          .password
      );

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message:
          'Password salah!'
      });
    }

const token = jwt.sign(
  {
    id:
      user.rows[0].id,

    email:
      user.rows[0].email
  },

  process.env.JWT_SECRET,

  {
    expiresIn:
      "7d"
  }
);

res.status(200).json({
  success: true,

  message:
    "Login berhasil!",

  token,

  data: {
    id:
      user.rows[0].id,

    name:
      user.rows[0].name,

    email:
      user.rows[0].email
  }
});

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        'Terjadi kesalahan server'
    });
  }
};
// KIRIM OTP RESET PASSWORD
const sendResetOtp =
  async (req, res) => {

    try {

      const { email } =
        req.body;

      const user =
        await pool.query(
          `
          SELECT *
          FROM users
          WHERE email = $1
          `,
          [email]
        );

      if (
        user.rows.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email tidak ditemukan!"
        });
      }

      const otp =
        otpGenerator.generate(
          6,
          {
            upperCaseAlphabets:
              false,

            lowerCaseAlphabets:
              false,

            specialChars:
              false
          }
        );

      const otpExpired =
        new Date(
          Date.now() +
          5 * 60 * 1000
        );

      await pool.query(
        `
        UPDATE users
        SET
        otp = $1,
        otp_expired_at = $2
        WHERE email = $3
        `,
        [
          otp,
          otpExpired,
          email
        ]
      );

      // KIRIM EMAIL
      await transporter.sendMail({
        from:
          `"CerminSaku" <${process.env.MAIL_USER}>`,

        to: email,

        subject:
          "Reset Password CerminSaku",

        html: `
        <div style="
          font-family:Arial;
          padding:24px;
          background:#f8fafc;
        ">
          <h2 style="
            color:#10B981;
          ">
            Reset Password
          </h2>

          <p>
            Gunakan kode OTP berikut:
          </p>

          <div style="
            font-size:32px;
            font-weight:bold;
            letter-spacing:8px;
            color:#10B981;
            margin:24px 0;
          ">
            ${otp}
          </div>

          <p>
            OTP berlaku
            <b>5 menit</b>
          </p>
        </div>
        `
      });

      res.status(200).json({
        success: true,
        message:
          "OTP berhasil dikirim!"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Terjadi kesalahan server"
      });
    }
};

// RESET PASSWORD
const resetPassword =
  async (req, res) => {
    try {
      const {
        email,
        newPassword
      } = req.body;

      const user =
        await pool.query(
          `
          SELECT *
          FROM users
          WHERE email = $1
          `,
          [email]
        );

      if (
        user.rows.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Email tidak ditemukan!'
        });
      }

      const salt =
        await bcrypt.genSalt(10);

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          salt
        );

      await pool.query(
        `
        UPDATE users
        SET password = $1
        WHERE email = $2
        `,
        [
          hashedPassword,
          email
        ]
      );

      res.status(200).json({
        success: true,
        message:
          'Password berhasil diperbarui!'
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          'Terjadi kesalahan server'
      });
    }
};

// VERIFY OTP RESET PASSWORD
const verifyResetOtp =
  async (req, res) => {

    try {

      const {
        email,
        otp
      } = req.body;

      const user =
        await pool.query(
          `
          SELECT *
          FROM users
          WHERE email = $1
          `,
          [email]
        );

      if (
        user.rows.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "User tidak ditemukan!"
        });
      }

      const userData =
        user.rows[0];

      if (
        userData.otp !== otp
      ) {
        return res.status(400).json({
          success: false,
          message:
            "OTP salah!"
        });
      }

      if (
        new Date() >
        new Date(
          userData
          .otp_expired_at
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "OTP expired!"
        });
      }

      res.status(200).json({
        success: true,
        message:
          "OTP valid!"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Server error"
      });
    }
};

module.exports = {
  register,
  verifyOtp,
  login,
  sendResetOtp,
  verifyResetOtp,
  resetPassword
};