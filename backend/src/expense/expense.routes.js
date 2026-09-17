import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpenseStats,
  updateExpense,
  deleteExpense,
  exportExpenses,
  getAIAdvisor,
  scanReceipt,
} from "./expense.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const expenseRouter = Router();

// Protect all expense routes
expenseRouter.use(authMiddleware);

expenseRouter.post("/", createExpense);
expenseRouter.get("/", getExpenses);
expenseRouter.get("/stats", getExpenseStats);
expenseRouter.get("/export", exportExpenses);
expenseRouter.post("/ai-advisor", getAIAdvisor);
expenseRouter.post("/scan-receipt", scanReceipt);
expenseRouter.put("/:id", updateExpense);
expenseRouter.delete("/:id", deleteExpense);

export default expenseRouter;

