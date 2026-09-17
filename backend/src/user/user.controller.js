import UserModel from "./user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendMail as sendMailUtil } from "../utils/mail.js";
import { otpTemplate } from "../utils/otp.templete.js";
import { generateOTP } from "../utils/generateOtp.js";
import { forgotPasswordTemplate } from "../utils/forgot-templete.js";

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const isValidPassword = async (inputPassword, storedPassword) => {
  try {
    if (await bcrypt.compare(inputPassword, storedPassword)) {
      return true;
    }
  } catch (error) {
    // Ignore invalid bcrypt hashes and fall back to direct comparison
  }

  return inputPassword === storedPassword;
};

export const createUser = async (req, res) => {
  try {
    const data = req.body;

    // prevent duplicate emails
    if (!data?.email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existing = await UserModel.findOne({ email: data.email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const userData = { ...data };
    if (userData.password) {
      userData.password = await hashPassword(userData.password);
    }

    const user = new UserModel(userData);
    await user.save();
    res.json(user);
  } catch (err) {
    // handle duplicate-key race condition
    if (err && err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Duplicate value", details: err.keyValue });
    }
    res.status(500).json({ message: err.message });
  }
};

export const sendMail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    // do not send OTP if email already registered
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const otp = generateOTP();
    await sendMailUtil(email, "OTP For Signup", otpTemplate(otp));

    const response = { message: "Email sent successfully" };
    if (process.env.ENVIRONMENT === "DEV") {
      response.otp = otp;
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createToken = async (user) => {
  const payload = {
    id: user._id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.AUTH_SECRET, { expiresIn: "1d" });
  return token;
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found!" });

    const isLogged = await isValidPassword(password, user.password);
    if (!isLogged) {
      return res.status(401).json({ message: "Incorrect password!" });
    }

    if (password === user.password) {
      await UserModel.updateOne(
        { _id: user._id },
        { password: await hashPassword(password) },
      );
    }

    const token = await createToken(user);
    res.cookie("authToken", token, {
      maxAge: 86400000,
      domain:
        process.env.ENVIRONMENT === "DEV" ? "localhost" : process.env.DOMAIN,
      secure: process.env.ENVIRONMENT === "DEV" ? false : true,
      httpOnly: true,
    });
    res.json({
      message: "Login success",
      role: user.role,
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        monthlyBudget: user.monthlyBudget || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const secret = process.env.FORGOT_TOKEN_SECRET || "forgot_secret";
    const token = jwt.sign({ id: user._id }, secret, {
      expiresIn: "15m",
    });
    const domain = process.env.DOMAIN || "http://localhost:5173";
    const link = `${domain}/forgot-password?token=${token}`;

    let sent = false;
    try {
      sent = await sendMailUtil(
        email,
        "Reset Password",
        forgotPasswordTemplate(user.fullname, link),
      );
    } catch (mailErr) {
      console.error("Mail send error:", mailErr.message);
    }

    const response = {
      message: "Please check your email to reset your password",
    };

    if (process.env.ENVIRONMENT === "DEV" || !sent) {
      response.resetLink = link;
      response.message = "Password reset link generated. Check email or click below.";
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    const secret = process.env.FORGOT_TOKEN_SECRET || "forgot_secret";
    const decoded = jwt.verify(token, secret);

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found or link expired." });
    }

    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    await user.save();

    return res.json({ message: "Password reset successful! You can now log in with your new password." });
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired reset link. Please request a new password reset." });
  }
};


export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User profile not found." });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("authToken");
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullname, mobile, monthlyBudget } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (fullname !== undefined) user.fullname = fullname;
    if (mobile !== undefined) user.mobile = mobile;
    if (monthlyBudget !== undefined) user.monthlyBudget = Number(monthlyBudget);

    await user.save();
    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

