import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/login
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    if (username === validUsername && password === validPassword) {
      // Create response
      const response = NextResponse.json({ success: true, message: 'Login successful' });

      // Set httpOnly cookie (cannot be accessed by JavaScript)
      response.cookies.set({
        name: 'admin_auth',
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 86400, // 24 hours
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
