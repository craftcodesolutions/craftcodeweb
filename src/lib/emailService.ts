import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Send email function
export async function sendEmail({ to, subject, html }: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

// Send welcome email
export async function sendWelcomeEmail(email: string, firstName: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3b82f6; margin: 0;">Welcome to CraftCode!</h1>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">Hello ${firstName},</h2>
        <p style="color: #475569; line-height: 1.6;">
          Welcome to CraftCode! Your account has been successfully created and verified. 
          We're excited to have you on board.
        </p>
      </div>
      
      <div style="background-color: #dbeafe; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="color: #1e40af; margin-top: 0;">What's Next?</h3>
        <ul style="color: #374151; line-height: 1.6;">
          <li>Complete your profile</li>
          <li>Explore our features</li>
          <li>Connect with our community</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Sign In Now
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The CraftCode Team</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to CraftCode! 🎉',
    html,
  });
}

// Send admin notification
export async function sendAdminNotification(email: string, firstName: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not configured, skipping admin notification');
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <h2 style="color: #92400e; margin-top: 0;">New User Registration</h2>
        <p style="color: #78350f; margin-bottom: 0;">
          A new user has registered on CraftCode.
        </p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <h3 style="color: #1e293b; margin-top: 0;">User Details:</h3>
        <p><strong>Name:</strong> ${firstName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div style="margin-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
        <p>This is an automated notification from CraftCode.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: 'New User Registration - CraftCode',
    html,
  });
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, firstName: string, resetUrl: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #dc2626; margin: 0;">Password Reset Request</h1>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">Hello ${firstName},</h2>
        <p style="color: #475569; line-height: 1.6;">
          You requested a password reset for your CraftCode account. 
          Click the button below to reset your password:
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <p style="color: #991b1b; margin: 0; font-size: 14px;">
          <strong>Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, 
          please ignore this email and your password will remain unchanged.
        </p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
        <p>Best regards,<br>The CraftCode Team</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request - CraftCode',
    html,
  });
} 