import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendNotification, ContactNotificationData } from '@/lib/notifications';

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, subject, message are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate subject
    const validSubjects = ['general', 'sales', 'support', 'customization', 'partnership'];
    if (!validSubjects.includes(subject)) {
      return NextResponse.json(
        { error: 'Invalid subject. Must be one of: ' + validSubjects.join(', ') },
        { status: 400 }
      );
    }

    // Get locale from headers or query params
    let locale = 'en';
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      if (acceptLanguage.startsWith('zh')) locale = 'zh';
      else if (acceptLanguage.startsWith('ar')) locale = 'ar';
    }

    // Create contact message
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        locale,
      },
    });

    // Send WeChat notification (non-blocking, don't await)
    const notificationData: ContactNotificationData = {
      type: 'contact',
      id: contactMessage.id,
      name,
      email,
      phone,
      subject,
      message,
      locale,
      createdAt: contactMessage.createdAt,
    };

    // Fire and forget - don't block the response
    sendNotification(notificationData).catch((err) =>
      console.error('Failed to send notification:', err)
    );

    return NextResponse.json({
      success: true,
      id: contactMessage.id,
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
