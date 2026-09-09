const express = require("express");

const router = express.Router();

const {
  getProfile,
  updateProfile,
  updatePassword,
} = require("../controller/profileController");

const authMiddleware = require("../middleware/authMidlleware");

// GET PROFILE
router.get("/", authMiddleware, getProfile);

// UPDATE PROFILE
router.put("/", authMiddleware, updateProfile);

// UPDATE PASSWORD
router.put("/password", authMiddleware, updatePassword);

module.exports = router;