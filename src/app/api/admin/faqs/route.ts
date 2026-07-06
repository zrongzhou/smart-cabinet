import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { verifyAuth, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

/**
 * GET /api/admin/faqs
 * 获取所有 FAQ（管理后台）
 */
export async function GET(request: NextRequest) {
  try {
    // 验证鉴权
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const productId = searchParams.get('productId');

    const skip = (page - 1) * pageSize;

    // 构建 where 条件
    const where: Prisma.FAQWhereInput = {};

    // 状态筛选
    if (status) {
      where.status = status;
    }

    // 分类筛选
    if (category) {
      where.category = category;
    }

    // v-product-faq: 传入 productId 则只返回该产品 FAQ；不传维持返回全部以兼容全局管理页
    if (productId) {
      where.productId = productId;
    }

    // 搜索
    if (search) {
      where.OR = [
        {
          question: {
            path: ['en'],
            string_contains: search,
          },
        },
        {
          question: {
            path: ['zh'],
            string_contains: search,
          },
        },
        {
          answer: {
            path: ['en'],
            string_contains: search,
          },
        },
        {
          answer: {
            path: ['zh'],
            string_contains: search,
          },
        },
      ];
    }

    // 获取总数
    const total = await prisma.fAQ.count({ where });

    // 获取 FAQ 列表
    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { updatedAt: 'desc' },
      ],
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      data: faqs,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return serverErrorResponse('Failed to fetch FAQs');
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/admin/faqs
 * 创建新 FAQ
 */
export async function POST(request: NextRequest) {
  try {
    // 验证鉴权
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // 验证必填字段
    if (!body.question || !body.answer) {
      return badRequestResponse('Question and answer are required');
    }

    // 准备数据
    const faqData: Prisma.FAQCreateInput = {
      question: body.question || {},
      answer: body.answer || {},
      category: body.category || 'features',
      order: body.order || 0,
      status: body.status || 'active',
      featured: body.featured || false,
    };

    // v-product-faq: 绑定产品归属。Prisma v6 不直接暴露 FK 标量写入，需用关系 connect；
    // 不带 productId 时 omit，保持 productId=null（全局 FAQ）。
    if (body.productId) {
      faqData.product = { connect: { id: body.productId } };
    }

    // 创建 FAQ
    const faq = await prisma.fAQ.create({
      data: faqData,
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return serverErrorResponse('Failed to create FAQ');
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * PUT /api/admin/faqs?id={id}
 * 更新 FAQ
 */
export async function PUT(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return badRequestResponse('FAQ ID is required');
    }

    const body = await request.json();

    // 检查 FAQ 是否存在
    const existingFaq = await prisma.fAQ.findUnique({
      where: { id },
    });

    if (!existingFaq) {
      return badRequestResponse('FAQ not found');
    }

    // 准备更新数据
    const updateData: Prisma.FAQUpdateInput = {};

    if (body.question !== undefined) updateData.question = body.question;
    if (body.answer !== undefined) updateData.answer = body.answer;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.featured !== undefined) updateData.featured = body.featured;
    // v-product-faq: 可选更新归属（前端通常不修改，但后端需可接收）。
    // Prisma v6 不直接暴露 FK 标量写入，需用关系 connect / disconnect。
    if (body.productId !== undefined) {
      updateData.product = body.productId
        ? { connect: { id: body.productId } }
        : { disconnect: true };
    }

    const updatedFaq = await prisma.fAQ.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedFaq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return serverErrorResponse('Failed to update FAQ');
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * DELETE /api/admin/faqs?id={id}
 * 删除 FAQ
 */
export async function DELETE(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return badRequestResponse('FAQ ID is required');
    }

    // 检查 FAQ 是否存在
    const existingFaq = await prisma.fAQ.findUnique({
      where: { id },
    });

    if (!existingFaq) {
      return badRequestResponse('FAQ not found');
    }

    await prisma.fAQ.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return serverErrorResponse('Failed to delete FAQ');
  } finally {
    await prisma.$disconnect();
  }
}
