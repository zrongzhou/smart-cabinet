import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { sanitizeHtml } from '@/lib/sanitize';

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

// SECURITY: Lightweight in-memory rate limiter for POST /api/reviews.
// Limits each client IP to at most RATE_LIMIT_MAX submissions per rolling minute.
// Implemented as a module-level Map (no external dependency). Expired entries are
// evicted on each request to avoid unbounded memory growth (defense against leaks).
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * SECURITY: Extract the client IP from the request.
 * Prefers the first entry of `x-forwarded-for` (real client behind proxies/CDN),
 * then falls back to Next.js' `request.ip`, and finally to 'unknown'.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for may be a comma-separated list; the leftmost is the client.
    return forwarded.split(',')[0].trim();
  }
  return request.ip || 'unknown';
}

/**
 * SECURITY: Check and update the rate-limit window for the given IP.
 * Returns whether the request is allowed and, when throttled, how many seconds
 * until the window resets (used for the Retry-After header).
 */
function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  // No entry or window already expired → start a fresh window.
  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  entry.count += 1;
  return { allowed: true, retryAfter: 0 };
}

/**
 * SECURITY: Evict expired rate-limit entries to keep the in-memory store bounded.
 * Cheap to run on every request since the store is small.
 */
function evictExpiredRateLimitEntries(): void {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(ip);
    }
  }
}

// SECURITY: Basic email shape check (RFC-5322-light). Used only to sanitize
// optional authorEmail; a malformed email is dropped, not rejected.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/reviews - Submit a review for a product
// Accepts productId (preferred) or slug in the request body.
export async function POST(
  request: NextRequest
) {
  try {
    // SECURITY: Rate-limit abusive submissions per client IP FIRST (before any
    // token verification or DB work) to minimize resource usage from abusers.
    const clientIp = getClientIp(request);
    evictExpiredRateLimitEntries();
    const rate = checkRateLimit(clientIp);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfter) },
        }
      );
    }

    // SECURITY: Authenticate BEFORE touching the database. An unauthenticated or
    // invalid token must never resolve a product or persist anything — "no auth,
    // no DB". userId is taken strictly from the verified token (no anonymous posts).
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required to submit a review.' },
        { status: 401 }
      );
    }
    const token = authHeader.substring(7).trim();
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired authentication token.' },
        { status: 401 }
      );
    }
    const userId: string = payload.userId;

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

    // SECURITY: Defensive validation of the images array. Only keep strings that
    // start with http:// or https:// — any other value (e.g. javascript:, data:,
    // or non-string) is dropped so we never persist a non-http(s) URI in the store.
    let safeImages: string[] = [];
    if (Array.isArray(images)) {
      safeImages = images.filter(
        (img): img is string =>
          typeof img === 'string' &&
          (img.startsWith('http://') || img.startsWith('https://'))
      );
    }

    // SECURITY: Basic email shape validation. If present but malformed, drop it
    // (set to null) rather than rejecting the whole submission.
    const safeAuthorEmail =
      authorEmail && typeof authorEmail === 'string' && EMAIL_REGEX.test(authorEmail)
        ? authorEmail
        : null;

    // Create review
    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId,
        authorName: sanitizeHtml(authorName),
        authorEmail: safeAuthorEmail,
        rating: rating || 5,
        title: title ? sanitizeHtml(title) : null,
        content: sanitizeHtml(content),
        images: safeImages,
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
