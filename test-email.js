require("dotenv").config();
const sendEmail = require("./utils/mailer");

(async () => {
  try {
    await sendEmail({
      to: process.env.GMAIL_USER,
      subject: " Test Email from Freelance API",
      html: "<h1> Email is working!</h1><p>This is a test from your local app.</p>",
    });
    console.log(" Email sent successfully");
  } catch (err) {
    console.error(" Failed to send email:", err);
  }
})();