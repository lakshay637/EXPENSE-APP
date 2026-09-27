import env from "dotenv";
env.config();

export const forgotPasswordTemplate = (fullname, link) => {
  const supportEmail =
    process.env.Sender_EMAIL ||
    process.env.MAIL_USER ||
    process.env.SENDER_EMAIL ||
    "support@expenseapp.com";
  const cleanLink = link ? link.trim() : "#";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Reset your password</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Helvetica,Arial,sans-serif;">
    <div style="display:none;max-height:0px;overflow:hidden;mso-hide:all;">
      Reset your password — this link expires in 30 minutes.
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.08);">
            <tr>
              <td style="padding:24px;text-align:center;background:#ffffff;border-bottom:1px solid #f1f5f9;">
                <h1 style="margin:0;font-size:22px;font-weight:700;color:#FF735C;">💰 Expense Tracker</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 24px 20px;color:#374151;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
                  Hi <strong>${fullname || 'User'}</strong>,
                </p>

                <p style="margin:0 0 20px;font-size:16px;line-height:1.5;">
                  We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>30 minutes</strong>.
                </p>

                <table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
                  <tr>
                    <td align="center">
                      <a href="${cleanLink}"
                         style="
                           display:inline-block;
                           padding:14px 28px;
                           font-size:16px;
                           font-weight:bold;
                           color:#ffffff;
                           text-decoration:none;
                           border-radius:8px;
                           background:#FF735C;
                           border:1px solid #FF735C;
                         "
                         target="_blank"
                         rel="noopener noreferrer">
                        Reset My Password
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0 8px;font-size:14px;line-height:1.5;color:#6b7280;">
                  If the button above does not work, copy and paste this link into your browser:
                </p>

                <p style="word-break:break-all;margin:0 0 24px;font-size:13px;color:#2563eb;">
                  <a href="${cleanLink}" style="color:#2563eb;text-decoration:underline;" target="_blank" rel="noopener noreferrer">
                    ${cleanLink}
                  </a>
                </p>

                <p style="margin:0;font-size:14px;line-height:1.5;color:#6b7280;">
                  If you didn't request a password reset, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 24px;background:#f8fafc;color:#9ca3af;font-size:13px;text-align:center;border-top:1px solid #f1f5f9;">
                <div>Expense Tracker Support</div>
                <div style="margin-top:4px;">
                  Need help? Email <a href="mailto:${supportEmail}" style="color:#64748b;text-decoration:underline;">${supportEmail}</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
