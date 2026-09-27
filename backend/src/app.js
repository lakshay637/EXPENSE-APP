import express from 'express';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import userRouter from "./user/user.routes.js";
import expenseRouter from "./expense/expense.routes.js";
import { connectDB } from "./db.js";

dotenv.config();

const app = express();

// Middleware to ensure DB connection before handling API routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:") || origin === process.env.DOMAIN || origin.endsWith(".netlify.app")) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: false }));

app.use("/api/user", userRouter);
app.use("/api/expense", expenseRouter);

export default app;
