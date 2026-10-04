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
  let errors = [];

  // 1. If Resend API key is configured, use Resend HTTPS REST API (Port 443, never firewalled)
  if (process.env.RESEND_API_KEY) {
    try {
      // NOTE: Resend testing tier strictly requires from: "onboarding@resend.dev" (or custom verified domain)
      const resendFrom = process.env.RESEND_FROM?.trim() || "onboarding@resend.dev";
      const fromString = resendFrom.includes("<") ? resendFrom : `Expense Tracker <${resendFrom}>`;
      
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
        },
        body: JSON.stringify({
          from: fromString,
          to: [email],
          subject,
          html: template,
        }),
      });

      const resendData = await resendRes.json();
      if (resendRes.ok && resendData.id) {
        console.log("✅ Email sent via Resend API! ID:", resendData.id);
        return resendData;
      } else {
        const msg = resendData.message || resendData.name || "Resend API returned error";
        console.warn("⚠️ Resend API warning:", msg);
        errors.push(`Resend: ${msg}`);
      }
    } catch (err) {
      console.warn("⚠️ Resend API exception:", err.message);
      errors.push(`Resend: ${err.message}`);
    }
  }

  // 2. If Brevo API key is configured, use Brevo HTTPS REST API (Port 443, allowed on all cloud hosts)
  if (process.env.BREVO_API_KEY) {
    try {
      const senderEmail = process.env.Sender_EMAIL?.trim() || process.env.MAIL_USER?.trim() || "lakshayb211@gmail.com";
      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": process.env.BREVO_API_KEY.trim(),
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Expense Tracker", email: senderEmail },
          to: [{ email }],
          subject,
          htmlContent: template,
        }),
      });

      const brevoData = await brevoRes.json();
      if (brevoRes.ok) {
        console.log("✅ Email sent via Brevo API! MessageId:", brevoData.messageId);
        return brevoData;
      } else {
        const msg = brevoData.message || "Brevo API returned error";
        console.warn("⚠️ Brevo API warning:", msg);
        errors.push(`Brevo: ${msg}`);
      }
    } catch (err) {
      console.warn("⚠️ Brevo API exception:", err.message);
      errors.push(`Brevo: ${err.message}`);
    }
  }

  // 3. If SendGrid API key is configured, use SendGrid HTTPS REST API
  if (process.env.SENDGRID_API_KEY) {
    try {
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
    } catch (err) {
      console.warn("⚠️ SendGrid API exception:", err.message);
      errors.push(`SendGrid: ${err.message}`);
    }
  }

  // 4. Nodemailer SMTP Fallback (Works on localhost & environments allowing outbound SMTP)
  try {
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

    const isGmail = rawHost.includes("gmail") || user.endsWith("@gmail.com");
    const transportConfig = isGmail
      ? {
          service: "gmail",
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
          auth: {
            user,
            pass,
          },
        }
      : {
          host: rawHost,
          port,
          secure,
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
          auth: {
            user,
            pass,
          },
        };

    const transporter = nodemailer.createTransport(transportConfig);

    const info = await transporter.sendMail({
      from: `Expense Tracker <${from}>`,
      to: email,
      subject,
      html: template,
    });

    console.log("✅ Email dispatched via Nodemailer SMTP! MessageId:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Nodemailer SMTP failed:", err.message);
    errors.push(`SMTP: ${err.message}`);
  }

  throw new Error(`Email delivery failed across all available providers. Details: ${errors.join(" | ")}`);
};
