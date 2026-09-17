import { model, Schema } from "mongoose";

const expenseSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: ["expense", "income"],
      default: "expense",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: "Other",
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Credit Card", "Debit Card", "UPI / NetBanking", "Other"],
      default: "Cash",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

const ExpenseModel = model("Expense", expenseSchema);
export default ExpenseModel;
