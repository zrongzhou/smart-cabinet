import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reviews?slug=xxx - Get approved reviews for a product
// Uses a query param (not a path segment) so slugs containing "/" work correctly.
export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get('slug');

    if (!productSlug) {
      return NextResponse.json(
        { error: 'Missing slug parameter' },
        { status: 400 }
      );
    }

    // First, find the product by slug
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const productId = product.id;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const rating = searchParams.get('rating');
    const sort = searchParams.get('sort') || 'newest';

    // Build where clause
    const where: any = {
      productId,
      isApproved: true,
    };

    if (rating && rating !== 'all') {
      where.rating = parseInt(rating);
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sort === 'newest') {
      orderBy.createdAt = 'desc';
    } else if (sort === 'oldest') {
      orderBy.createdAt = 'asc';
    } else if (sort === 'most_helpful') {
      orderBy.helpful = 'desc';
    } else if (sort === 'highest_rating') {
      orderBy.rating = 'desc';
    } else if (sort === 'lowest_rating') {
      orderBy.rating = 'asc';
    }

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip: (page -1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    // Get rating statistics using raw query for better performance
    const ratingStats = await prisma.$queryRaw<Array<{
      average: number;
      total: bigint;
      five_star: bigint;
      four_star: bigint;
      three_star: bigint;
      two_star: bigint;
      one_star: bigint;
    }>>`
      SELECT
        AVG(rating) as average,
        COUNT(*) as total,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews
      WHERE "productId" = ${productId} AND "isApproved" = true
    `;

    const stats = ratingStats[0] || {
      average: 0,
      total: 0,
      five_star: 0,
      four_star: 0,
      three_star: 0,
      two_star: 0,
      one_star: 0,
    };

    return NextResponse.json({
      data: reviews,
      stats: {
        average: parseFloat(stats.average?.toString() || '0'),
        total: Number(stats.total),
        distribution: {
          5: Number(stats.five_star),
          4: Number(stats.four_star),
          3: Number(stats.three_star),
          2: Number(stats.two_star),
          1: Number(stats.one_star),
        },
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Submit a review for a product
// Accepts productId (preferred) or slug in the request body.
export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();
    const { productId, slug, authorName, authorEmail, rating, title, content, images } = body;

    // Resolve the product
    let product = null;
    if (productId) {
      product = await prisma.product.findUnique({ where: { id: productId } });
    }
    if (!product && slug) {
      product = await prisma.product.findUnique({ where: { slug } });
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!authorName || !content) {
      return NextResponse.json(
        { error: 'Author name and content are required' },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    let userId: string | undefined;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        // TODO: Properly decode the token to get userId
      }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId,
        authorName,
        authorEmail: authorEmail || null,
        rating: rating || 5,
        title: title || null,
        content,
        images: images || [],
        isVerified: false,
        isApproved: false, // Requires admin approval
      },
    });

    return NextResponse.json({
      message: 'Review submitted successfully. It will be visible after approval.',
      data: review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
