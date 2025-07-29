import { NextRequest, NextResponse } from "next/server";
import { createAndSendVerificationCode } from "@/controllers/verificationService";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, type = 'registration', firstName } = body;

        // Validate email
        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        console.log(`Sending verification code to: ${email} (type: ${type})`);

        // Create and send verification code
        const result = await createAndSendVerificationCode(email, type, firstName);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to send verification code" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Verification code sent successfully",
            email: email
        });

    } catch (error) {
        console.error("Error sending verification code:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 