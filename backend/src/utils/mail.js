import nodemailer from "nodemailer";

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
    console.error("Mail send failed:", error);
    throw error;
  }
};
