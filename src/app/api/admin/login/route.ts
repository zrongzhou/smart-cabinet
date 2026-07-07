import { NextRequest, NextResponse } from 'next/server';
import { generateAdminToken } from '@/lib/auth';

// POST /api/admin/login
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    if (username === validUsername && password === validPassword) {
      // Issue a signed admin JWT (role=admin) and store it in an httpOnly cookie.
      const token = generateAdminToken({ sub: username, username });

      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        token,
        user: { username, role: 'admin' },
      });

      response.cookies.set({
        name: 'admin_auth',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/logout
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logout successful' });
  response.cookies.delete('admin_auth');
  return response;
}
