import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAuth, unauthorizedResponse, badRequestResponse, serverErrorResponse, notFoundResponse } from '@/lib/auth';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/products
 * 获取所有产品（管理后台，不过滤 status 和 deletedAt）
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
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const id = searchParams.get('id');

    // 单条查询：?id= 直接按 id 返回该产品（含 categories/tags）。
    // 修复编辑页"未找到产品"——前台 fetchAdminProducts 默认 pageSize=20，
    // 超过 20 个产品时目标 id 落在第 2 页，.find() 漏数据。
    if (id) {
      const product = await prisma.product.findFirst({
        where: { id, deletedAt: null },
        include: { categories: true, tags: true },
      });
      if (!product) {
        return NextResponse.json({ data: [] });
      }
      return NextResponse.json({ data: [product] });
    }

    const skip = (page - 1) * pageSize;

    // 构建 where 条件
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,  // 过滤已删除的产品
    };
    const currentDate = new Date();

    // 状态筛选（管理后台可以选择是否筛选）
    if (status) {
      where.status = status;
    }

    // 分类筛选
    if (category) {
      where.categories = {
        some: { id: category }
      };
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
        {
          sku: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // 获取总数
    const total = await prisma.product.count({ where });

    // 获取产品列表
    const products = await prisma.product.findMany({
      where,
      include: {
        categories: true,
        tags: true,
      },
      orderBy: [
        { updatedAt: 'desc' },
      ],
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      data: products,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return serverErrorResponse('Failed to fetch products');
  }
}

/**
 * POST /api/admin/products
 * 创建新产品
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
    if (!body.name || !body.slug || !body.sku) {
      return badRequestResponse('Name, slug, and sku are required');
    }

    // 检查 slug 和 sku 是否已存在
    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: body.slug },
          { sku: body.sku },
        ],
      },
    });

    if (existingProduct) {
      return badRequestResponse('Slug or SKU already exists');
    }

    // 准备数据
    const productData: Prisma.ProductCreateInput = {
      slug: body.slug,
      sku: body.sku,
      name: body.name || {},
      description: body.description || null,
      shortDescription: body.shortDescription || null,
      price: body.price || 0,
      hidePrice: body.hidePrice || false,
      images: body.images || [],
      features: body.features || null,
      specifications: body.specifications || null,
      status: body.status || 'active',
      featured: body.featured || false,
      order: body.order || 0,
      relatedProducts: body.relatedProducts || [],
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      seoKeywords: body.seoKeywords ?? null,
    };

    // 创建产品（含分类和标签关联）
    const createData: any = {
      ...productData,
    };

    // V8.5 fix: bug 1 — persist the product-level FAQ list (Json) when provided.
    if (body.faq !== undefined) {
      createData.faq = body.faq ?? null;
    }

    // 处理分类关联
    if (body.categoryIds && Array.isArray(body.categoryIds) && body.categoryIds.length > 0) {
      createData.categories = {
        connect: body.categoryIds.map((catId: string) => ({ id: catId })),
      };
    }

    // 处理标签关联
    if (body.tagIds && Array.isArray(body.tagIds) && body.tagIds.length > 0) {
      createData.tags = {
        connect: body.tagIds.map((tagId: string) => ({ id: tagId })),
      };
    }

    const product = await prisma.product.create({
      data: createData,
    });

    // 返回完整产品信息
    const createdProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return badRequestResponse('Slug or SKU already exists');
      }
    }
    return serverErrorResponse('Failed to create product');
  }
}

/**
 * PUT /api/admin/products?id={id}
 * 更新产品
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
      return badRequestResponse('Product ID is required');
    }

    const body = await request.json();

    // 检查产品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return notFoundResponse('Product');
    }

    // 如果 slug 或 sku 改变了，检查是否已存在
    if ((body.slug && body.slug !== existingProduct.slug) ||
        (body.sku && body.sku !== existingProduct.sku)) {
      const conflictProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { slug: body.slug },
            { sku: body.sku },
          ],
          NOT: { id },
        },
      });

      if (conflictProduct) {
        return badRequestResponse('Slug or SKU already exists');
      }
    }

    // 准备更新数据
    const updateData: Prisma.ProductUpdateInput = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.hidePrice !== undefined) updateData.hidePrice = body.hidePrice;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.specifications !== undefined) updateData.specifications = body.specifications;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.relatedProducts !== undefined) updateData.relatedProducts = body.relatedProducts;
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription;
    if (body.seoKeywords !== undefined) updateData.seoKeywords = body.seoKeywords;

    // 处理分类关联
    if (body.categoryIds !== undefined) {
      if (Array.isArray(body.categoryIds) && body.categoryIds.length > 0) {
        updateData.categories = {
          set: body.categoryIds.map((catId: string) => ({ id: catId })),
        };
      } else {
        updateData.categories = { set: [] };
      }
    }

    // 处理标签关联
    if (body.tagIds !== undefined) {
      if (Array.isArray(body.tagIds) && body.tagIds.length > 0) {
        updateData.tags = {
          set: body.tagIds.map((tagId: string) => ({ id: tagId })),
        };
      } else {
        updateData.tags = { set: [] };
      }
    }

    // V8.5 fix: bug 1 — persist the product-level FAQ list (Json) when provided.
    if (body.faq !== undefined) {
      (updateData as Record<string, unknown>).faq = body.faq ?? null;
    }

    // 更新产品
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return badRequestResponse('Slug or SKU already exists');
      }
    }
    return serverErrorResponse('Failed to update product');
  }
}

/**
 * DELETE /api/admin/products?id={id}
 * 删除产品（物理删除）
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
      return badRequestResponse('Product ID is required');
    }

    // 检查产品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return notFoundResponse('Product');
    }

    // 物理删除：解除关联后删除
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          categories: { set: [] },
          tags: { set: [] },
        },
      });
      await tx.product.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: 'Product deleted permanently' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return serverErrorResponse('Failed to delete product');
  }
}
