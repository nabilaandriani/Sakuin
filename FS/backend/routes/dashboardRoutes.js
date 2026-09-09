const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMidlleware");
const { getDashboardSummary } = require("../controller/dashboardController");

router.get("/", auth, getDashboardSummary);

module.exports = router;