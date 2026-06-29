import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/admin/contact-messages - List contact messages with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isRead = searchParams.get('isRead') || 'all'; // all | read | unread
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {};

    if (isRead === 'read') {
      where.isRead = true;
    } else if (isRead === 'unread') {
      where.isRead = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.contactMessage.count({ where });

    // Get messages with pagination
    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data: messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact messages' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/contact-messages - Bulk operations
export async function PATCH(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      );
    }

    if (!action || !['mark-read', 'mark-unread', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be one of: mark-read, mark-unread, delete' },
        { status: 400 }
      );
    }

    if (action === 'delete') {
      // Bulk delete
      await prisma.contactMessage.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ success: true, deleted: ids.length });
    } else {
      // Bulk update read status
      const isRead = action === 'mark-read';
      await prisma.contactMessage.updateMany({
        where: { id: { in: ids } },
        data: { isRead },
      });
      return NextResponse.json({ success: true, updated: ids.length });
    }
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
