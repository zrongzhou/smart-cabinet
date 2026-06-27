import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken, generateRefreshToken, verifyRefreshToken } from './jwt';
import type { RegisterRequest, LoginRequest, AuthResponse, UserProfile } from './types';

const prisma = new PrismaClient();

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  try {
    // Validate input
    if (!data.email || !data.password || !data.name) {
      return { success: false, error: 'Missing required fields' };
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        company: data.company || null,
        phone: data.phone || null,
        role: 'user',
        isActive: true,
      },
    });

    // Generate tokens
    const token = generateToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token to database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar || undefined,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

/**
 * Login user
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  try {
    // Validate input
    if (!data.email || !data.password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Check if user is active
    if (!user.isActive) {
      return { success: false, error: 'Account is disabled. Please contact support.' };
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Generate tokens
    const token = generateToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token to database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar || undefined,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAuthToken(refreshToken: string): Promise<AuthResponse> {
  try {
    const userId = verifyRefreshToken(refreshToken);

    if (!userId) {
      return { success: false, error: 'Invalid refresh token' };
    }

    // Find user and verify refresh token
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return { success: false, error: 'Invalid refresh token' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Account is disabled' };
    }

    // Generate new access token
    const newToken = generateToken(user.id, user.email, user.role);

    return {
      success: true,
      token: newToken,
      refreshToken: user.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar || undefined,
      },
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    return { success: false, error: 'Failed to refresh token' };
  }
}

/**
 * Get user by ID (without password)
 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || undefined,
      company: user.company || undefined,
      phone: user.phone || undefined,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Get all users with pagination and search
 */
export async function getAllUsers(
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<{ users: UserProfile[]; total: number; page: number; pageSize: number }> {
  try {
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || undefined,
        company: user.company || undefined,
        phone: user.phone || undefined,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('Get all users error:', error);
    return { users: [], total: 0, page, pageSize };
  }
}

/**
 * Update user status (activate/deactivate)
 */
export async function updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
    return true;
  } catch (error) {
    console.error('Update user status error:', error);
    return false;
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    return true;
  } catch (error) {
    console.error('Update user role error:', error);
    return false;
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return true;
  } catch (error) {
    console.error('Delete user error:', error);
    return false;
  }
}

/**
 * Logout user (clear refresh token)
 */
export async function logout(refreshToken: string): Promise<boolean> {
  try {
    await prisma.user.updateMany({
      where: { refreshToken },
      data: { refreshToken: null },
    });
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}
