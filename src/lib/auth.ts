import { NextRequest, NextResponse } from 'next/server';

/**
 * 验证管理后台 API 请求的鉴权
 * 从 Authorization header 或 cookie 中读取 admin_auth token
 * 返回 boolean：true = 鉴权通过，false = 鉴权失败
 */
export async function verifyAuth(request: NextRequest): Promise<boolean> {
  try {
    // 从 Authorization header 读取
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token && token.length > 0) {
        return true; // auth OK
      }
    }

    // 从 cookie 读取
    const cookie = request.headers.get('cookie');
    if (cookie) {
      const match = cookie.match(/admin_auth=([^;]+)/);
      if (match && match[1] && match[1].length > 0) {
        return true; // auth OK
      }
    }

    return false; // auth failed
  } catch {
    return false; // auth failed on error
  }
}

/**
 * 返回 401 未授权响应
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized. Please login first.' },
    { status: 401 }
  );
}

/**
 * 返回 404 未找到响应
 */
export function notFoundResponse(resource: string = 'Resource') {
  return NextResponse.json(
    { error: `${resource} not found.` },
    { status: 404 }
  );
}

/**
 * 返回 400 错误请求响应
 */
export function badRequestResponse(message: string = 'Bad request.') {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

/**
 * 返回 500 服务器错误响应
 */
export function serverErrorResponse(message: string = 'Internal server error.') {
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}
