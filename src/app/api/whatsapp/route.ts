import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get WhatsApp number from environment variables
    const whatsappNumber = process.env.WHATSAPP_NUMBER;
    
    if (!whatsappNumber) {
      return NextResponse.json(
        { error: 'WhatsApp number not configured' },
        { status: 500 }
      );
    }

    // Check if request is from mobile device
    const { searchParams } = new URL(request.url);
    const isMobile = searchParams.get('mobile') === 'true';

    // Format the number by removing any non-numeric characters except +
    const formattedNumber = whatsappNumber.replace(/[^\d+]/g, '');
    const phoneNumber = formattedNumber.replace('+', '');
    
    // Create WhatsApp URL based on device type
    const whatsappUrl = isMobile 
      ? `whatsapp://send?phone=${phoneNumber}`
      : `https://wa.me/${phoneNumber}`;
    
    return NextResponse.json({
      success: true,
      whatsappUrl,
      number: whatsappNumber,
      isMobile
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
    const { message, isMobile } = body;
    
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
    const phoneNumber = formattedNumber.replace('+', '');
    
    // Create WhatsApp URL with message based on device type
    let whatsappUrl;
    
    if (isMobile) {
      // Mobile WhatsApp app URL
      whatsappUrl = `whatsapp://send?phone=${phoneNumber}`;
      if (message) {
        const encodedMessage = encodeURIComponent(message);
        whatsappUrl += `&text=${encodedMessage}`;
      }
    } else {
      // Web WhatsApp URL
      whatsappUrl = `https://wa.me/${phoneNumber}`;
      if (message) {
        const encodedMessage = encodeURIComponent(message);
        whatsappUrl += `?text=${encodedMessage}`;
      }
    }
    
    return NextResponse.json({
      success: true,
      whatsappUrl,
      number: whatsappNumber,
      message: message || null,
      isMobile: isMobile || false
    });
    
  } catch (error) {
    console.error('Error in WhatsApp API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}