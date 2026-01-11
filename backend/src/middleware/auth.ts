import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: UserRole;
            };
        }
    }
}

interface JWTPayload {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
}

/**
 * Authentication middleware - verifies JWT token
 * In development mode, allows mock tokens for testing
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];

        // In development, allow mock tokens
        if (env.NODE_ENV === 'development' && token.startsWith('mock_token_')) {
            // Extract user info from localStorage if possible, or use default
            // For now, create a mock user for development
            req.user = {
                id: 'dev-user-id',
                email: 'dev@athleon.com',
                name: 'Dev User',
                role: 'athlete',
            };
            next();
            return;
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

            // Verify user still exists
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, name: true, role: true },
            });

            if (!user) {
                res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
                return;
            }

            req.user = user;
            next();
        } catch (jwtError) {
            res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
            return;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, name: true, role: true },
            });

            if (user) {
                req.user = user;
            }
        } catch {
            // Token invalid, but that's okay for optional auth
        }

        next();
    } catch (error) {
        next();
    }
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: { id: string; email: string; name: string; role: UserRole }): string {
    const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    };

    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}
