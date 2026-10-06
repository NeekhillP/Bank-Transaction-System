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


async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = 'Transaction Notification - Backend Ledger System';

  const formattedAmount = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const date = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const text = `Hi ${name},

A transaction has been made from your account.

Amount: $${formattedAmount}
To account: ${toAccount}
Date: ${date}

If you did not authorize this transaction, please contact our support team immediately.

Best regards,
The Backend Ledger Team`;

  const html = `
  <div style="background:#f4f4f7;padding:30px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">

      <div style="background:#0f766e;padding:24px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;">Backend Ledger System</h1>
      </div>

      <div style="padding:32px 28px;color:#333333;">
        <h2 style="margin:0 0 8px;font-size:20px;">Transaction Notification</h2>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#555555;">
          Hi ${name}, a transaction was made from your account. Here are the details:
        </p>

        <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
          <div style="font-size:13px;color:#0f766e;text-transform:uppercase;letter-spacing:1px;">Amount</div>
          <div style="font-size:32px;font-weight:bold;color:#0f766e;margin-top:4px;">$${formattedAmount}</div>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #eeeeee;color:#888888;">To account</td>
            <td style="padding:12px 0;border-bottom:1px solid #eeeeee;text-align:right;font-weight:bold;">${toAccount}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #eeeeee;color:#888888;">Date</td>
            <td style="padding:12px 0;border-bottom:1px solid #eeeeee;text-align:right;font-weight:bold;">${date}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;color:#888888;">Status</td>
            <td style="padding:12px 0;text-align:right;font-weight:bold;color:#16a34a;">Completed</td>
          </tr>
        </table>

        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 16px;border-radius:4px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#7f1d1d;">
            <strong>Didn't make this transaction?</strong> Please contact our support team immediately
            so we can secure your account.
          </p>
        </div>
      </div>

      <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#999999;">
        &copy; ${new Date().getFullYear()} Backend Ledger System. All rights reserved.
      </div>

    </div>
  </div>`;

  await sendEmail(userEmail, subject, text, html);
}


async function sendTransactionFailureEmail(userEmail, name, amount, toAccount, reason = 'Unable to process the transaction') {
  const subject = 'Transaction Failed - Backend Ledger System';

  const formattedAmount = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const date = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const text = `Hi ${name},

Your recent transaction could not be completed.

Amount: $${formattedAmount}
To account: ${toAccount}
Date: ${date}
Reason: ${reason}

No money has been deducted from your account. Please try again, or contact our support team if the problem continues.

Best regards,
The Backend Ledger Team`;

  const html = `
  <div style="background:#f4f4f7;padding:30px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">

      <div style="background:#0f766e;padding:24px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;">Backend Ledger System</h1>
      </div>

      <div style="padding:32px 28px;color:#333333;">
        <h2 style="margin:0 0 8px;font-size:20px;">Transaction Failed</h2>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#555555;">
          Hi ${name}, unfortunately your recent transaction could not be completed. Here are the details:
        </p>

        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
          <div style="font-size:13px;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Amount</div>
          <div style="font-size:32px;font-weight:bold;color:#dc2626;margin-top:4px;">$${formattedAmount}</div>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #eeeeee;color:#888888;">To account</td>
            <td style="padding:12px 0;border-bottom:1px solid #eeeeee;text-align:right;font-weight:bold;">${toAccount}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #eeeeee;color:#888888;">Date</td>
            <td style="padding:12px 0;border-bottom:1px solid #eeeeee;text-align:right;font-weight:bold;">${date}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #eeeeee;color:#888888;">Reason</td>
            <td style="padding:12px 0;border-bottom:1px solid #eeeeee;text-align:right;font-weight:bold;">${reason}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;color:#888888;">Status</td>
            <td style="padding:12px 0;text-align:right;font-weight:bold;color:#dc2626;">Failed</td>
          </tr>
        </table>

        <div style="background:#f0fdfa;border-left:4px solid #0f766e;padding:14px 16px;border-radius:4px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#134e4a;">
            <strong>No money was deducted from your account.</strong> You can try again, or contact
            our support team if the problem continues.
          </p>
        </div>
      </div>

      <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#999999;">
        &copy; ${new Date().getFullYear()} Backend Ledger System. All rights reserved.
      </div>

    </div>
  </div>`;

  await sendEmail(userEmail, subject, text, html);
}


export { sendRegistrationEmail, sendTransactionEmail, sendTransactionFailureEmail };