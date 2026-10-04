import UserModel from "./user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail as sendMailUtil } from "../utils/mail.js";
import { otpTemplate } from "../utils/otp.templete.js";
import { generateOTP } from "../utils/generateOtp.js";
import { forgotPasswordTemplate } from "../utils/forgot-templete.js";
import { setOTP, verifyOTP } from "../utils/otpStore.js";

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
    const { fullname, email, mobile, password, otp } = data || {};

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const cleanEmail = email.trim();
    try {
      const existing = await UserModel.findOne({
        email: new RegExp(`^${cleanEmail}$`, "i"),
      }).maxTimeMS(3000);

      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
    } catch (dbErr) {
      console.warn("DB lookup warning in createUser:", dbErr.message);
    }

    // Verify OTP if provided or required
    if (otp) {
      const isValidOtp = verifyOTP(cleanEmail, otp);
      if (!isValidOtp) {
        return res.status(400).json({ message: "Invalid or expired OTP. Please request a new OTP code." });
      }
    }

    await connectDB();

    const userData = {
      fullname,
      email: cleanEmail,
      mobile,
      password: await hashPassword(password),
    };

    const user = new UserModel(userData);
    await user.save();

    const token = await createToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      message: "Registration successful!",
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
    if (err && err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Email already registered", details: err.keyValue });
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

    const cleanEmail = email.trim();
    try {
      const existing = await UserModel.findOne({
        email: new RegExp(`^${cleanEmail}$`, "i"),
      }).maxTimeMS(3000);

      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
    } catch (dbErr) {
      console.warn("DB lookup warning in sendMail:", dbErr.message);
    }

    const otp = generateOTP();
    setOTP(cleanEmail, otp);

    try {
      await sendMailUtil(
        cleanEmail,
        "OTP For Signup - Expense Tracker",
        otpTemplate(otp)
      );
      res.json({
        message: "OTP sent to your email! Please check your inbox.",
      });
    } catch (mailErr) {
      console.error("Mail dispatch failed:", mailErr.message);
      res.status(500).json({
        message: `Failed to send OTP email: ${mailErr.message}`,
      });
    }
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

  const secret = process.env.AUTH_SECRET || "expense_app_default_auth_secret_2026";
  const token = jwt.sign(payload, secret, { expiresIn: "1d" });
  return token;
};

const getCookieOptions = () => {
  const isDev = process.env.ENVIRONMENT === "DEV";
  const cookieOptions = {
    maxAge: 86400000,
    httpOnly: true,
    secure: !isDev,
    sameSite: isDev ? "lax" : "none",
  };
  if (process.env.COOKIE_DOMAIN) {
    const rawDomain = process.env.COOKIE_DOMAIN.trim()
      .replace(/^https?:\/\//i, "")
      .split("/")[0]
      .split(":")[0];
    if (rawDomain) {
      cookieOptions.domain = rawDomain;
    }
  }
  return cookieOptions;
};

const setAuthCookie = (res, token) => {
  const options = getCookieOptions();
  try {
    res.cookie("authToken", token, options);
  } catch (err) {
    console.warn("Failed to set cookie with domain:", err.message);
    delete options.domain;
    try {
      res.cookie("authToken", token, options);
    } catch (e) {
      console.warn("Failed to set fallback cookie:", e.message);
    }
  }
};

const clearAuthCookie = (res) => {
  const options = getCookieOptions();
  try {
    res.clearCookie("authToken", options);
  } catch (err) {
    delete options.domain;
    try {
      res.clearCookie("authToken", options);
    } catch (e) {
      // ignore
    }
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required!" });
    }

    const cleanEmail = email.trim();
    const user = await UserModel.findOne({
      email: new RegExp(`^${cleanEmail}$`, "i"),
    });

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
    setAuthCookie(res, token);

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
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = email.trim();
    const user = await UserModel.findOne({
      email: new RegExp(`^${cleanEmail}$`, "i"),
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exist with this email." });
    }

    const secret = process.env.FORGOT_TOKEN_SECRET || "forgot_secret";
    const token = jwt.sign({ id: user._id }, secret, {
      expiresIn: "30m",
    });

    let clientDomain = req.get("origin");
    if (!clientDomain && req.get("referer")) {
      try {
        clientDomain = new URL(req.get("referer")).origin;
      } catch (e) {
        clientDomain = null;
      }
    }
    const rawDomain = (clientDomain || process.env.DOMAIN || "http://localhost:5173").replace(/\/+$/, "");
    const link = `${rawDomain}/forgot-password?token=${token}`;

    try {
      await sendMailUtil(
        cleanEmail,
        "Reset Password - Expense Tracker",
        forgotPasswordTemplate(user.fullname, link),
      );
      res.json({
        message: "Password reset link sent to your email! Please check your inbox.",
      });
    } catch (mailErr) {
      console.error("SMTP email send error:", mailErr.message);
      res.status(500).json({
        message: `Failed to send email: ${mailErr.message}`,
      });
    }
  } catch (err) {
    console.error("forgotPassword error:", err);
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
    clearAuthCookie(res);
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

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await isValidPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return res.json({ message: "Password changed successfully!" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


