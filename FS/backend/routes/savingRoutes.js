const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMidlleware");

const {
  getDreamGoals,
  createDreamGoal,
  updateDreamGoal,
  deleteDreamGoal,
  markAchieved,
  togglePause,
} = require("../controller/savingController");

console.log("savingRoutes dimuat, togglePause:", typeof togglePause);  

router.get("/", auth, getDreamGoals);

router.post("/", auth, createDreamGoal);

router.put("/:id", auth, updateDreamGoal);

router.delete("/:id", auth, deleteDreamGoal);

router.patch("/:id/achieve", auth, markAchieved);

router.patch("/:id/pause", auth, togglePause);

module.exports = router;