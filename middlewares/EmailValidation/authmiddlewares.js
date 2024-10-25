const nodemailer = require("nodemailer");

async function verificationMail(userEmail, userName, verificationCode) {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.NODEMAILER_EMAIL, // Use UPPERCASE for env variables
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: '"Vibb Support" <support@vibb.com>', // Adjusted sender name and email
      to: userEmail, // recipient's email
      subject: "Welcome to vibb - Verify Your Account", // Subject line
      text: `Welcome to vibb, ${userName}. Your verification code is: ${verificationCode}`, // plain text body
      html: `
            <html>
            <head>
              <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #4CAF50;
                }
                p {
                    font-size: 16px;
                    line-height: 1.6;
                }
                .code {
                    background-color: #f7f7f7;
                    border: 1px solid #ddd;
                    padding: 10px;
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    letter-spacing: 2px;
                    margin: 20px 0;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    color: #777;
                    text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Welcome to Vibb, ${userName}!</h1>
                <p>Thank you for signing up for Vibb, your personal podcasting app. We’re excited to have you on board!</p>
                <p>Please use the following verification code to complete your registration:</p>
                <div class="code">${verificationCode}</div>
                <p>Once you've entered this code in the app, your account will be fully activated and you'll be ready to podcast and live stream it on Youtube.</p>
                <p>If you did not sign up for Vibb, please ignore this email or contact our support team for assistance.</p>
                <p>Best regards,<br>The Vibb Team</p>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Vibb. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
        `,
    });

    console.log(`Message sent: ${info.messageId}`);
  } catch (error) {
    console.error(`Error sending email: ${error}`);
    throw new Error(error);
  }
}
module.exports = { verificationMail };
