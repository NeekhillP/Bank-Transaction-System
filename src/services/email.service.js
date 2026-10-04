import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

/**
 * Send an email
 * @param {string} to - The recipient's email address
 * @param {string} subject - The email subject
 * @param {string} text - The plain text content
 * @param {string} html - The HTML content
 */
const sendEmail = async (to, subject, text, html) =>{
    try{
        const info = await transporter.sendMail({
            from: `"Backend Ledger System" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });
        console.log('Email sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
}


async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to Backend Ledger System';

  const text = `Hi ${name},

Thanks for registering with Backend Ledger System. Your account has been created successfully.

Best regards,
The Backend Ledger Team`;

  const html = `
  <div style="background:#f4f4f7;padding:30px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
      <div style="background:#0f766e;padding:24px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;">Backend Ledger System</h1>
      </div>
      <div style="padding:32px 28px;color:#333333;">
        <h2 style="margin:0 0 16px;font-size:20px;">Welcome, ${name}! 🎉</h2>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
          Thanks for registering with us. Your account has been created successfully
          and you're ready to get started.
        </p>
        <p style="margin:0;font-size:15px;line-height:1.6;">
          If you have any questions, just reply to this email.
        </p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#999999;">
        &copy; ${new Date().getFullYear()} Backend Ledger System. All rights reserved.
      </div>
    </div>
  </div>`;

  await sendEmail(userEmail, subject, text, html);
}

export default sendRegistrationEmail;