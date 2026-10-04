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
    // 1. If Resend API key is configured, use Resend HTTPS REST API (never blocked on cloud hosts)
    if (process.env.RESEND_API_KEY) {
      const fromEmail = process.env.Sender_EMAIL || process.env.MAIL_USER || "onboarding@resend.dev";
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
        },
        body: JSON.stringify({
          from: fromEmail.includes("<") ? fromEmail : `Expense Tracker <${fromEmail}>`,
          to: [email],
          subject,
          html: template,
        }),
      });
      const resendData = await resendRes.json();
      if (!resendRes.ok) {
        throw new Error(resendData.message || resendData.name || "Resend API dispatch failed");
      }
      console.log("✅ Email sent via Resend API!");
      return resendData;
    }

    // 2. If SendGrid API key is configured, use SendGrid HTTPS REST API (never blocked on serverless containers)
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

    // 3. Fall back to Nodemailer SMTP with verified credentials
    const user =
      process.env.MAIL_USER?.trim() ||
      process.env.Sender_EMAIL?.trim() ||
      process.env.SENDER_EMAIL?.trim() ||
      process.env.SENDER_MAIL?.trim() ||
      "lakshayb211@gmail.com";

    const pass =
      process.env.MAIL_PASS?.trim() ||
      process.env.Sender_PASSWORD?.trim() ||
      process.env.SENDER_PASSWORD?.trim() ||
      process.env.SENDER_PASS?.trim() ||
      "vklclevaqwfpokcj";

    const rawHost = process.env.MAIL_HOST?.trim() || "smtp.gmail.com";
    const customPort = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT.trim()) : null;
    const from = process.env.MAIL_FROM?.trim() || user;

    const port = customPort || 465;
    const secure = customPort ? customPort === 465 : true;

    const transporter = nodemailer.createTransport({
      host: rawHost,
      port,
      secure,
      tls: {
        rejectUnauthorized: false,
      },
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
