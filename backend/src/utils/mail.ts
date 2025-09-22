const nodemailer = require("nodemailer");
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});

// Verify connection
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

/**
 * Sends an email
 * @param to Recipient email address
 * @param subject Email subject
 * @param message Email message (plain text or HTML)
 */
export const mailSender = async (
  to: string,
  subject: string,
  message: string
) => {
  const mailOptions = {
    from: `"Authentic" <${process.env.SENDER_EMAIL}>`,
    to,
    subject,
    text: message,
    html: `<p>${message}</p>`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent:", info.messageId);
  return info;
};
