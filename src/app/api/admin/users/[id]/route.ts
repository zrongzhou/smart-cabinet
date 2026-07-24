import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { getUserById, updateUserStatus, updateUserRole, deleteUser } from '@/lib/auth/userAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // NEXT15: params is a Promise
) {
  try {
    // Verify authentication (cookie-based, consistent with other admin routes)
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const userId = (await params).id; // NEXT15
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Admin get user API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // NEXT15: params is a Promise
) {
  try {
    // Verify authentication (cookie-based, consistent with other admin routes)
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const userId = (await params).id; // NEXT15
    const body = await request.json();
    const { isActive, role } = body;

    // Update user status
    if (isActive !== undefined) {
      const success = await updateUserStatus(userId, isActive);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to update user status' },
          { status: 500 }
        );
      }
    }

    // Update user role
    if (role !== undefined) {
      const success = await updateUserRole(userId, role);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to update user role' },
          { status: 500 }
        );
      }
    }

    // Get updated user
    const user = await getUserById(userId);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Admin update user API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // NEXT15: params is a Promise
) {
  try {
    // Verify authentication (cookie-based, consistent with other admin routes)
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const userId = (await params).id; // NEXT15
    const success = await deleteUser(userId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Admin delete user API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
