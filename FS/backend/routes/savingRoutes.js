const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMidlleware");

const {
  getDreamGoals,
  createDreamGoal,
  updateDreamGoal,
  deleteDreamGoal,
  markAchieved 
} = require("../controller/savingController");

router.get(
  "/",
  auth,
  getDreamGoals
);

router.post(
  "/",
  auth,
  createDreamGoal
);

router.put(
  "/:id",
  auth,
  updateDreamGoal
);

router.delete(
  "/:id",
  auth,
  deleteDreamGoal
);

router.patch(
  "/:id/achieve",
  auth,
  markAchieved
);

module.exports = router;