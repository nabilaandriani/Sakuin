const express =
  require('express');

const router =
  express.Router();

const {
  register,
  verifyOtp,
  login,
  sendResetOtp,
  verifyResetOtp,
  resetPassword
} = require(
  '../controller/authController'
);

// REGISTER
router.post(
  '/register',
  register
);

// VERIFY OTP REGISTER
router.post(
  '/verify-otp',
  verifyOtp
);

// LOGIN
router.post(
  '/login',
  login
);

// FORGOT PASSWORD
router.post(
  '/forgot-password',
  sendResetOtp
);

// VERIFY RESET OTP
router.post(
  '/verify-reset-otp',
  verifyResetOtp
);

// RESET PASSWORD
router.post(
  '/reset-password',
  resetPassword
);

module.exports =
  router;