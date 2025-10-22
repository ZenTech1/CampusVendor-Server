import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: `gmail`,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export async function sendOTP(name, email, OTP) {
  const emailTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; }
      .otp-box { background-color: #e8f5e8; padding: 10px; font-size: 18px; width: fit-content; border-radius: 5px; }
    </style>
  </head>
  <body>
    <h2>Welcome to CampusVendor, ${name}!</h2>
    <p>Your OTP is:</p>
    <div class="otp-box">${OTP}</div>
    <p><strong>Do not share this code with anyone.</strong></p>
  </body>
  </html>
`;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "YOUR CAMPUS VENDOR OTP",
    html: emailTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
