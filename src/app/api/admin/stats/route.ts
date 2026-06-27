import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    // Fetch statistics from database
    const [
      totalProducts,
      totalBlogs,
      totalFaqs,
      totalCategories,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.blogPost.count(),
      prisma.fAQ.count(),
      prisma.category.count(),
    ]);

    // Get recent activities
    const recentProducts = await prisma.product.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, updatedAt: true },
    });

    const recentBlogs = await prisma.blogPost.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true },
    });

    const recentFaqs = await prisma.fAQ.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, question: true, updatedAt: true },
    });

    // Format activities
    const recentActivities = [
      ...recentProducts.map((p: any) => ({
        type: 'product',
        action: '更新了产品',
        name: p.name?.zh || p.name?.en || 'Unknown',
        time: p.updatedAt.toISOString(),
        color: 'border-blue-500',
      })),
      ...recentBlogs.map((b: any) => ({
        type: 'blog',
        action: '发布了文章',
        name: b.title?.zh || b.title?.en || 'Unknown',
        time: b.updatedAt.toISOString(),
        color: 'border-green-500',
      })),
      ...recentFaqs.map((f: any) => ({
        type: 'faq',
        action: '更新了FAQ',
        name: f.question?.zh || f.question?.en || 'Unknown',
        time: f.updatedAt.toISOString(),
        color: 'border-purple-500',
      })),
    ]
      .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);

    return NextResponse.json({
      totalProducts,
      totalBlogs,
      totalFaqs,
      totalCategories,
      productTrend: 12, // TODO: Calculate real trend
      blogTrend: 8,
      faqTrend: -3,
      messageTrend: 5,
      recentActivities,
    });
  } catch (error: any) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
