import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { getAllUsers, updateUserStatus, updateUserRole, deleteUser } from '@/lib/auth/userAuth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication (cookie-based, consistent with other admin routes)
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || undefined;

    // Get users
    const result = await getAllUsers(page, pageSize, search);

    return NextResponse.json({
      success: true,
      users: result.users,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (error) {
    console.error('Admin get users API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get users' },
      { status: 500 }
    );
  }
}
