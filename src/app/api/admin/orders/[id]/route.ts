import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Fulfilment status transitions. Forward-only (no reverse flows), with
 * `delivered` and `cancelled` as terminal states. Used both here (server-side
 * validation) and mirrored in the admin UI for the status dropdown.
 */
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const VALID_STATUSES = Object.keys(STATUS_TRANSITIONS);

/**
 * GET /api/admin/orders/[id]
 *
 * Single order detail: items (with product snapshot), user and payments.
 * Admin-only.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              select: { id: true, slug: true, name: true, images: true },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Admin get order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders/[id]
 *
 * Update fulfilment `status` (with transition validation) and/or the admin
 * note. Accepts `adminNote` (preferred) or the `note` alias.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const existing = await prisma.order.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      status?: string;
      note?: string;
      adminNote?: string;
    };
    const { status, note, adminNote } = body;

    const data: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status: ${status}` },
          { status: 400 }
        );
      }
      const allowed = STATUS_TRANSITIONS[existing.status] || [];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status transition: ${existing.status} → ${status}`,
          },
          { status: 400 }
        );
      }
      data.status = status;
    }

    if (adminNote !== undefined) {
      data.adminNote = adminNote;
    } else if (note !== undefined) {
      data.adminNote = note; // alias
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nothing to update' },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              select: { id: true, slug: true, name: true, images: true },
            },
          },
        },
        payments: true,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Admin update order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
