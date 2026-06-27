import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAuth, unauthorizedResponse, badRequestResponse, serverErrorResponse, notFoundResponse } from '@/lib/auth';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/categories
 * 获取所有分类（管理后台）
 */
export async function GET(request: NextRequest) {
  try {
    // 验证鉴权
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // 构建 where 条件
    const where: Prisma.CategoryWhereInput = {
      deletedAt: null, // 过滤已删除的分类
    };
    const currentDate = new Date();

    // 类型筛选
    if (type) {
      where.type = type;
    }

    // 状态筛选
    if (status) {
      where.status = status;
    }

    // 搜索
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
      ];
    }

    // 获取分类列表
    const categories = await prisma.category.findMany({
      where,
      include: {
        children: {
          where: {
            deletedAt: null,
          },
        },
        parent: true,
        products: {
          select: { id: true, name: true, sku: true },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return serverErrorResponse('Failed to fetch categories');
  }
}

/**
 * POST /api/admin/categories
 * 创建新分类
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
    if (!body.name || !body.slug || !body.type) {
      return badRequestResponse('Name, slug, and type are required');
    }

    // 检查 slug 是否已存在
    const existingCategory = await prisma.category.findFirst({
      where: { slug: body.slug },
    });

    if (existingCategory) {
      return badRequestResponse('Slug already exists');
    }

    // 准备数据
    const categoryData: Prisma.CategoryCreateInput = {
      slug: body.slug,
      name: body.name || {},
      icon: body.icon || null,
      description: body.description || null,
      parent: body.parentId ? { connect: { id: body.parentId } } : undefined,
      order: body.order || 0,
      status: body.status || 'active',
      type: body.type,
    };

    // 创建分类
    const category = await prisma.category.create({
      data: categoryData,
      include: {
        children: true,
        parent: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return badRequestResponse('Slug already exists');
      }
    }
    return serverErrorResponse('Failed to create category');
  }
}

/**
 * PUT /api/admin/categories?id={id}
 * 更新分类
 */
export async function PUT(request: NextRequest) {
  try {
    // 验证鉴权
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return badRequestResponse('Category ID is required');
    }

    const body = await request.json();

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return notFoundResponse('Category');
    }

    // 如果 slug 改变了，检查新 slug 是否已存在
    if (body.slug && body.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findFirst({
        where: {
          slug: body.slug,
          NOT: { id },
        },
      });

      if (slugExists) {
        return badRequestResponse('Slug already exists');
      }
    }

    // 准备更新数据
    const updateData: Prisma.CategoryUpdateInput = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.parentId !== undefined) {
      updateData.parent = body.parentId ? { connect: { id: body.parentId } } : { disconnect: true };
    }
    if (body.order !== undefined) updateData.order = body.order;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.type !== undefined) updateData.type = body.type;

    // 更新分类
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        children: true,
        parent: true,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return badRequestResponse('Slug already exists');
      }
    }
    return serverErrorResponse('Failed to update category');
  }
}

/**
 * DELETE /api/admin/categories?id={id}
 * 删除分类（物理删除）
 */
export async function DELETE(request: NextRequest) {
  try {
    // 验证鉴权
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return badRequestResponse('Category ID is required');
    }

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!existingCategory) {
      return notFoundResponse('Category');
    }

    // 检查是否有子分类
    if (existingCategory.children && existingCategory.children.length > 0) {
      return badRequestResponse('Cannot delete category with sub-categories. Please delete sub-categories first.');
    }

    // 物理删除：解除产品关联后删除分类
    await prisma.$transaction(async (tx) => {
      // 先断开所有产品关联
      await tx.category.update({
        where: { id },
        data: { products: { set: [] } },
      });
      // 再删除分类本身
      await tx.category.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: 'Category deleted permanently' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return serverErrorResponse('Failed to delete category');
  }
}
