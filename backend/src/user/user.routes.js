import { Router } from "express";
import {
  createUser,
  login,
  sendMail,
  forgotPassword,
  resetPassword,
  getMe,
  logoutUser,
  updateProfile,
} from "./user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const userRouter = Router();

//@post /api/user/signup
userRouter.post("/signup", createUser);

//@post /api/user/login
userRouter.post("/login", login);

//@post /api/user/send-mail
userRouter.post("/send-mail", sendMail);

//@post /api/user/forgot-password
userRouter.post("/forgot-password", forgotPassword);

//@post /api/user/reset-password
userRouter.post("/reset-password", resetPassword);

//@get /api/user/me
userRouter.get("/me", authMiddleware, getMe);

//@post /api/user/logout
userRouter.post("/logout", authMiddleware, logoutUser);

//@put /api/user/profile
userRouter.put("/profile", authMiddleware, updateProfile);

export default userRouter;
