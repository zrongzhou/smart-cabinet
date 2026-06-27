import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { verifyAuth, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

/**
 * GET /api/admin/tags
 * 获取所有标签（管理后台）
 */
export async function GET(request: NextRequest) {
  try {
    // 验证鉴权
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: Prisma.TagWhereInput = {};

    // 搜索（对 JSON 字段搜索）
    if (search) {
      where.OR = [
        {
          name: {
            path: ['en'],
            string_contains: search,
          },
        },
        {
          name: {
            path: ['zh'],
            string_contains: search,
          },
        },
        {
          name: {
            path: ['ar'],
            string_contains: search,
          },
        },
        {
          slug: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // 获取标签列表
    const tags = await prisma.tag.findMany({
      where,
      include: {
        products: {
          select: { id: true, name: true, sku: true },
        },
        blogs: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: [
        { slug: 'asc' },
      ],
    });

    return NextResponse.json({
      data: tags,
      total: tags.length,
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return serverErrorResponse('Failed to fetch tags');
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/admin/tags
 * 创建新标签
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
    if (!body.nameZh || !body.nameEn || !body.slug) {
      return badRequestResponse('nameZh, nameEn, and slug are required');
    }

    // 检查 slug 是否已存在
    const existingTag = await prisma.tag.findFirst({
      where: { slug: body.slug },
    });

    if (existingTag) {
      return badRequestResponse('Slug already exists');
    }

    // 准备数据
    const tagData: Prisma.TagCreateInput = {
      slug: body.slug,
      name: {
        zh: body.nameZh,
        en: body.nameEn,
        ar: body.nameAr || '',
      },
      color: body.color || '#3B82F6',
    };

    // 创建标签
    const tag = await prisma.tag.create({
      data: tagData,
    });

    // 返回完整标签信息
    const createdTag = await prisma.tag.findUnique({
      where: { id: tag.id },
      include: {
        products: {
          select: { id: true, name: true, sku: true },
        },
        blogs: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json(createdTag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return badRequestResponse('Slug already exists');
      }
    }
    return serverErrorResponse('Failed to create tag');
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * PUT /api/admin/tags?id={id}
 * 更新标签
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
      return badRequestResponse('Tag ID is required');
    }

    const body = await request.json();

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return badRequestResponse('Tag not found');
    }

    // 如果 slug 改变了，检查是否已存在
    if (body.slug && body.slug !== existingTag.slug) {
      const conflictTag = await prisma.tag.findFirst({
        where: { slug: body.slug, NOT: { id: id as string } },
      });

      if (conflictTag) {
        return badRequestResponse('Slug already exists');
      }
    }

    // 准备更新数据
    const updateData: Prisma.TagUpdateInput = {};

    if (body.nameZh !== undefined || body.nameEn !== undefined || body.nameAr !== undefined) {
      const currentName = (typeof existingTag.name === 'object' && existingTag.name !== null ? existingTag.name : { zh: '', en: '', ar: '' }) as { zh: string; en: string; ar: string };
      updateData.name = {
        zh: body.nameZh ?? currentName.zh,
        en: body.nameEn ?? currentName.en,
        ar: body.nameAr ?? (currentName.ar || ''),
      };
    }
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.color !== undefined) updateData.color = body.color;

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('Error updating tag:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return badRequestResponse('Slug already exists');
      }
    }
    return serverErrorResponse('Failed to update tag');
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * DELETE /api/admin/tags?id={id}
 * 删除标签
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
      return badRequestResponse('Tag ID is required');
    }

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return badRequestResponse('Tag not found');
    }

    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return serverErrorResponse('Failed to delete tag');
  } finally {
    await prisma.$disconnect();
  }
}
