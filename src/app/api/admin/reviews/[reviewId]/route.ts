import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

// PUT /api/admin/reviews/[reviewId] - Approve or reject review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> } // NEXT15: params is a Promise
) {
  try {
    // Check admin authentication
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { reviewId } = await params; // NEXT15
    const body = await request.json();
    const { isApproved } = body;

    if (isApproved === undefined) {
      return NextResponse.json(
        { error: 'isApproved field is required' },
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

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved },
    });

    return NextResponse.json({
      message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: updatedReview,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews/[reviewId] - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> } // NEXT15: params is a Promise
) {
  try {
    // Check admin authentication
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { reviewId } = await params; // NEXT15

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
