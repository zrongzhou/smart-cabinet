import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/reviews/[reviewId]/helpful - Mark review as helpful or not
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> } // NEXT15: params is a Promise
) {
  try {
    const { reviewId } = await params; // NEXT15
    const body = await request.json();
    const { helpful } = body; // true for helpful, false for not helpful

    if (helpful === undefined) {
      return NextResponse.json(
        { error: 'helpful field is required' },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Update helpful or notHelpful count
    const updateData = helpful
      ? { helpful: { increment: 1 } }
      : { notHelpful: { increment: 1 } };

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Thank you for your feedback',
      data: updatedReview,
    });
  } catch (error) {
    console.error('Error updating review helpfulness:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
