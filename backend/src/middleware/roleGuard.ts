import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Role-based access control middleware
 * Restricts access to specific user roles
 */
export function requireRole(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Forbidden',
                message: `This action requires one of these roles: ${allowedRoles.join(', ')}`,
            });
            return;
        }

        next();
    };
}

/**
 * Athlete-only access
 */
export const athleteOnly = requireRole('athlete');

/**
 * Coach/Scout-only access
 */
export const coachOnly = requireRole('coach');

/**
 * Organizer-only access
 */
export const organizerOnly = requireRole('organizer');

/**
 * Viewer-only access
 */
export const viewerOnly = requireRole('viewer');

/**
 * Athletes and Coaches can access
 */
export const athleteOrCoach = requireRole('athlete', 'coach');

/**
 * Anyone except viewers
 */
export const exceptViewer = requireRole('athlete', 'coach', 'organizer');
