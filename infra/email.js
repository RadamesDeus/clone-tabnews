import nodemailer from "nodemailer";

async function sendEmail(mailOptions) {
  return await transporter.sendMail(mailOptions);
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT,
  secure: process.env.NODE_ENV === "production" ? true : false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  },
});

const email = {
  sendEmail,
};

export default email;
