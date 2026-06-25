const nodemailer = require("nodemailer");
const logger = require("../config/logger");
const { withRetry, logIntegrationFailure } = require("./integration");

let transporter = null;

function isSmtpConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function getFromAddress() {
  return process.env.EMAIL_FROM || process.env.EMAIL_USER || "XOXO Travels <noreply@xoxo.travel>";
}

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

async function sendViaResend({ to, subject, html, text }) {
  return withRetry(
    async () => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: getFromAddress(),
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        const err = new Error("Resend API error");
        err.statusCode = res.status;
        logger.error("Resend API error", { status: res.status, body });
        throw err;
      }

      const data = await res.json();
      return { messageId: data.id, provider: "resend" };
    },
    { label: "resend:send", maxAttempts: 3 }
  );
}

/**
 * Sends an email via Resend (preferred) or SMTP.
 * Gracefully skips when no provider is configured (development).
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) return { skipped: true, reason: "no recipient" };

  try {
    if (isResendConfigured()) {
      const result = await sendViaResend({ to, subject, html, text });
      logger.info("Email sent via Resend", { to, subject, messageId: result.messageId });
      return result;
    }

    if (isSmtpConfigured()) {
      const info = await withRetry(
        () =>
          getTransporter().sendMail({
            from: getFromAddress(),
            to,
            subject,
            text,
            html,
          }),
        { label: "smtp:send", maxAttempts: 2 }
      );
      logger.info("Email sent via SMTP", { to, subject, messageId: info.messageId });
      return { messageId: info.messageId, provider: "smtp" };
    }

    logger.debug("Email skipped — no provider configured", { to, subject });
    return { skipped: true, reason: "email not configured" };
  } catch (err) {
    logIntegrationFailure("email", err, { to, subject });
    return { skipped: true, reason: err.message };
  }
};

function getEmailStatus() {
  return {
    resend: isResendConfigured(),
    smtp: isSmtpConfigured(),
    configured: isResendConfigured() || isSmtpConfigured(),
    provider: isResendConfigured() ? "resend" : isSmtpConfigured() ? "smtp" : "none",
    from: getFromAddress(),
  };
}

module.exports = { sendEmail, isSmtpConfigured, isResendConfigured, getEmailStatus };
