import nodemailer from "nodemailer";
import dns from "dns";
import dotenv from "dotenv";
dotenv.config();

// Force Node to prefer IPv4 over IPv6 for outbound SMTP connections (resolves ENETUNREACH on cloud hosts)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

export const sendMail = async (email, subject, template) => {
  try {
    const host = process.env.MAIL_HOST?.trim() || "smtp.gmail.com";
    const port = Number(process.env.MAIL_PORT?.trim() || 587);
    const secure =
      process.env.MAIL_SECURE?.trim().toLowerCase() === "true" || port === 465;
    const user =
      process.env.MAIL_USER?.trim() || process.env.Sender_EMAIL?.trim();
    const pass =
      process.env.MAIL_PASS?.trim() || process.env.Sender_PASSWORD?.trim();
    const from = process.env.MAIL_FROM?.trim() || user;

    if (!user || !pass) {
      throw new Error(
        "SMTP credentials are not configured. Set MAIL_USER/MAIL_PASS or Sender_EMAIL/Sender_PASSWORD in your .env file.",
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      family: 4,
      connectionTimeout: 7000,
      greetingTimeout: 7000,
      socketTimeout: 7000,
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to: email,
      subject,
      html: template,
    });

    return info;
  } catch (error) {
    console.error("Mail send failed:", error.message);
    throw error;
  }
};
