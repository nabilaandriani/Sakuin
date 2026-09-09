const express =
require("express");

const router =
express.Router();

const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require(
  "../controllers/transactionController"
);

// SUMMARY
router.get(
  "/summary",
  getSummary
);

// GET ALL
router.get(
  "/",
  getTransactions
);

// CREATE
router.post(
  "/",
  createTransaction
);

// UPDATE
router.put(
  "/:id",
  updateTransaction
);

// DELETE
router.delete(
  "/:id",
  deleteTransaction
);

module.exports =
router;