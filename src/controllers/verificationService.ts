import clientPromise from "@/config/mongodb";
import { sendEmail } from "@/lib/emailService";

const DB_NAME = "CraftCode";
const COLLECTION = "verifications";

export interface VerificationCode {
    _id?: string;
    email: string;
    code: string;
    type: 'registration' | 'password-reset' | 'email-change';
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
}

// Generate a random 6-digit code
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create verification code and send email (code not returned to frontend)
export async function createAndSendVerificationCode(
    email: string, 
    type: VerificationCode['type'] = 'registration',
    firstName?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection<VerificationCode>(COLLECTION);

        // Generate 6-digit code
        const code = generateVerificationCode();
        
        // Set expiration time (1 hour from now)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // Delete any existing unused codes for this email and type
        await collection.deleteMany({ 
            email, 
            type, 
            isUsed: false,
            expiresAt: { $lt: new Date() }
        });

        // Create verification record
        const verification: Omit<VerificationCode, '_id'> = {
            email,
            code,
            type,
            expiresAt,
            isUsed: false,
            createdAt: new Date()
        };

        await collection.insertOne(verification);

        // Send verification email
        const emailSubject = getEmailSubject(type);
        const emailHtml = getVerificationEmailHtml(code, type, firstName);

        const emailSent = await sendEmail({
            to: email,
            subject: emailSubject,
            html: emailHtml
        });

        if (!emailSent) {
            // If email fails, delete the verification record
            await collection.deleteOne({ email, code, type });
            return { success: false, error: 'Failed to send verification email' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error creating verification code:', error);
        return { success: false, error: 'Failed to create verification code' };
    }
}

// Verify the code
export async function verifyCode(
    email: string, 
    code: string, 
    type: VerificationCode['type'] = 'registration'
): Promise<{ success: boolean; error?: string }> {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection<VerificationCode>(COLLECTION);

        // Find the verification record
        const verification = await collection.findOne({
            email,
            code,
            type,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });

        if (!verification) {
            return { success: false, error: 'Invalid or expired verification code' };
        }

        // Mark as used
        await collection.updateOne(
            { _id: verification._id },
            { $set: { isUsed: true } }
        );

        return { success: true };
    } catch (error) {
        console.error('Error verifying code:', error);
        return { success: false, error: 'Failed to verify code' };
    }
}

// Clean up expired verification codes
export async function cleanupExpiredCodes(): Promise<void> {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection<VerificationCode>(COLLECTION);

        await collection.deleteMany({
            expiresAt: { $lt: new Date() }
        });
    } catch (error) {
        console.error('Error cleaning up expired codes:', error);
    }
}

// Get email subject based on verification type
function getEmailSubject(type: VerificationCode['type']): string {
    switch (type) {
        case 'registration':
            return 'Verify Your Email - CraftCode';
        case 'password-reset':
            return 'Reset Your Password - CraftCode';
        case 'email-change':
            return 'Verify Email Change - CraftCode';
        default:
            return 'Verification Code - CraftCode';
    }
}

// Get email HTML based on verification type
function getVerificationEmailHtml(code: string, type: VerificationCode['type'], firstName?: string): string {
    const greeting = firstName ? `Hello ${firstName}!` : 'Hello!';
    
    let description = 'Please use the verification code below to complete your registration.';
    
    switch (type) {
        case 'password-reset':
            description = 'Please use the verification code below to reset your password.';
            break;
        case 'email-change':
            description = 'Please use the verification code below to verify your email change.';
            break;
    }

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">Email Verification</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">CraftCafe Security</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">${greeting}</h2>
                
                <p style="color: #666; line-height: 1.6;">
                    ${description}
                </p>
                
                <div style="background: white; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #667eea;">
                    <h3 style="color: #333; margin-top: 0; font-size: 18px;">Your Verification Code</h3>
                    <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 20px 0;">
                        ${code}
                    </div>
                    <p style="color: #666; font-size: 14px; margin: 0;">
                        This code will expire in 1 hour
                    </p>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <h4 style="color: #856404; margin-top: 0;">Security Notice</h4>
                    <p style="color: #856404; margin: 0; font-size: 14px;">
                        If you didn't request this verification code, please ignore this email. 
                        Never share this code with anyone.
                    </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    This verification code was sent to your email address. 
                    For security reasons, please do not forward this email.
                </p>
            </div>
        </div>
    `;
} 