import express from 'express';
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.listen(5050,()=>console.log("Server is running on port 5050"));

// database connection
import mongoose from "mongoose";
mongoose.connect(process.env.DB_URL)
.then(()=>console.log("Database connected!"))
.catch(()=>console.log("Database not connected!"));

import cookieParser from "cookie-parser";
import cors from "cors";
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:") || origin === process.env.DOMAIN) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true
}));

// app level middleware
import morgan from "morgan";
app.use(morgan('dev'));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: false }));

// route level middleware
import userRouter from "./user/user.routes.js";
app.use("/api/user",userRouter);

import expenseRouter from "./expense/expense.routes.js";
app.use("/api/expense", expenseRouter);

