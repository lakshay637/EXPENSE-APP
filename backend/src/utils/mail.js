import nodemailer from "nodemailer";
import dns from "dns";
import dotenv from "dotenv";
dotenv.config();

// Force Node.js DNS to prefer IPv4 over IPv6 across the entire process
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
        "SMTP credentials missing. Set Sender_EMAIL and Sender_PASSWORD in Environment Variables.",
      );
    }

    const port = customPort || 465;
    const secure = customPort ? customPort === 465 : true;

    // Force strict IPv4 DNS resolution to prevent ENETUNREACH on serverless containers without IPv6 routing
    const forceIPv4Lookup = (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4, all: false }, (err, address) => {
        if (err) return callback(err);
        callback(null, address, 4);
      });
    };

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      family: 4,
      lookup: forceIPv4Lookup,
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
