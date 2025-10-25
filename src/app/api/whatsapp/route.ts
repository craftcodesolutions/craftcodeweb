import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get WhatsApp number from environment variables
    const whatsappNumber = process.env.WHATSAPP_NUMBER;
    
    if (!whatsappNumber) {
      return NextResponse.json(
        { error: 'WhatsApp number not configured' },
        { status: 500 }
      );
    }

    // Format the number by removing any non-numeric characters except +
    const formattedNumber = whatsappNumber.replace(/[^\d+]/g, '');
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedNumber.replace('+', '')}`;
    
    return NextResponse.json({
      success: true,
      whatsappUrl,
      number: whatsappNumber
    });
    
  } catch (error) {
    console.error('Error in WhatsApp API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;
    
    // Get WhatsApp number from environment variables
    const whatsappNumber = process.env.WHATSAPP_NUMBER;
    
    if (!whatsappNumber) {
      return NextResponse.json(
        { error: 'WhatsApp number not configured' },
        { status: 500 }
      );
    }

    // Format the number by removing any non-numeric characters except +
    const formattedNumber = whatsappNumber.replace(/[^\d+]/g, '');
    
    // Create WhatsApp URL with message
    let whatsappUrl = `https://wa.me/${formattedNumber.replace('+', '')}`;
    
    if (message) {
      const encodedMessage = encodeURIComponent(message);
      whatsappUrl += `?text=${encodedMessage}`;
    }
    
    return NextResponse.json({
      success: true,
      whatsappUrl,
      number: whatsappNumber,
      message: message || null
    });
    
  } catch (error) {
    console.error('Error in WhatsApp API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}