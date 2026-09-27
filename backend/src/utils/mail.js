import nodemailer from "nodemailer";
import dns from "dns";
import dotenv from "dotenv";
dotenv.config();

// Force Node to prefer IPv4 over IPv6 for outbound SMTP connections
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

export const sendMail = async (email, subject, template) => {
  try {
    const user =
      process.env.MAIL_USER?.trim() ||
      process.env.Sender_EMAIL?.trim() ||
      process.env.SENDER_EMAIL?.trim() ||
      process.env.SENDER_MAIL?.trim();

    const pass =
      process.env.MAIL_PASS?.trim() ||
      process.env.Sender_PASSWORD?.trim() ||
      process.env.SENDER_PASSWORD?.trim() ||
      process.env.SENDER_PASS?.trim();

    const host = process.env.MAIL_HOST?.trim() || "smtp.gmail.com";
    const customPort = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT.trim()) : null;
    const from = process.env.MAIL_FROM?.trim() || user;

    if (!user || !pass) {
      console.error("❌ SMTP error: Credentials missing in environment variables. Set Sender_EMAIL and Sender_PASSWORD on Netlify / Render.");
      throw new Error(
        "SMTP credentials are not configured on cloud server. Set Sender_EMAIL and Sender_PASSWORD environment variables.",
      );
    }

    // Try Port 465 (SSL) first as it is standard and unblocked on cloud hosts like Render & Netlify
    const port = customPort || 465;
    const secure = customPort ? customPort === 465 : true;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      family: 4,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `Expense Tracker <${from}>`,
      to: email,
      subject,
      html: template,
    });

    console.log("✅ Email dispatched successfully! MessageId:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Mail send failed:", error.message);
    throw error;
  }
};
