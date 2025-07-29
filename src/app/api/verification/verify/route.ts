import { NextRequest, NextResponse } from "next/server";
import { verifyCode } from "@/controllers/verificationService";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, code, type = 'registration' } = body;

        // Validate required fields
        if (!email || !code) {
            return NextResponse.json(
                { error: "Email and verification code are required" },
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

        // Validate code format (6 digits)
        if (!/^\d{6}$/.test(code)) {
            return NextResponse.json(
                { error: "Verification code must be 6 digits" },
                { status: 400 }
            );
        }

        console.log(`Verifying code for: ${email} (type: ${type})`);

        // Verify the code
        const result = await verifyCode(email, code, type);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Verification failed" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Verification successful",
            email: email
        });

    } catch (error) {
        console.error("Error verifying code:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 