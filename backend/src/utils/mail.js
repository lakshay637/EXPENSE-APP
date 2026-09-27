import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import dns from "dns";
import dotenv from "dotenv";
dotenv.config();

// Force Node.js DNS to prefer IPv4 over IPv6
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

export const sendMail = async (email, subject, template) => {
  try {
    // 1. If SendGrid API key is configured, use SendGrid HTTPS REST API (never blocked on serverless containers)
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY.trim());
      const fromEmail = process.env.Sender_EMAIL || process.env.MAIL_USER || "no-reply@expensapp.com";
      const msg = {
        to: email,
        from: fromEmail,
        subject,
        html: template,
      };
      const res = await sgMail.send(msg);
      console.log("✅ Email sent via SendGrid API!");
      return res;
    }

    // 2. Fall back to Nodemailer SMTP
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
      console.error("❌ SMTP error: Credentials missing in environment variables.");
      throw new Error(
        "SMTP credentials missing. Set Sender_EMAIL and Sender_PASSWORD in environment variables.",
      );
    }

    const port = customPort || 465;
    const secure = customPort ? customPort === 465 : true;

    // Strict IPv4 DNS lookup to avoid ENETUNREACH
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
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
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
