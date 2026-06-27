import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserById, updateUserStatus, updateUserRole, deleteUser } from '@/lib/auth/userAuth';

/**
 * Verify admin access from request
 */
async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; error?: string }> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Authorization token is required' };
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return { authorized: false, error: 'Invalid or expired token' };
  }

  if (payload.role !== 'admin') {
    return { authorized: false, error: 'Admin access required' };
  }

  return { authorized: true };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = params.id;
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
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = params.id;
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
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = params.id;
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
