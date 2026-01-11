import { Router, Request, Response } from 'express';
import { PrismaClient, EventStatus } from '@prisma/client';
import { z } from 'zod';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { organizerOnly, requireRole } from '../middleware/roleGuard.js';
import { getNavigationUrl } from '../services/maps.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createEventSchema = z.object({
    title: z.string().min(3),
    sport: z.string(),
    description: z.string().optional(),
    venueId: z.string().uuid(),
    date: z.string().datetime().or(z.string()),
    time: z.string(),
    isPaid: z.boolean().default(false),
    price: z.number().min(0).default(0),
    maxCapacity: z.number().min(1),
    image: z.string().url().optional(),
    category: z.enum(['tournament', 'training', 'match', 'tryout']).default('tournament'),
});

const ratingSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
});

/**
 * GET /events
 * List all events with filters
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
    try {
        const { sport, search, priceFilter, category, status, page = '1', limit = '20' } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const where: any = {};

        if (sport && sport !== 'all') {
            where.sport = sport as string;
        }

        if (priceFilter === 'free') {
            where.isPaid = false;
        } else if (priceFilter === 'paid') {
            where.isPaid = true;
        }

        if (category && category !== 'all') {
            where.category = category as string;
        }

        if (status && status !== 'all') {
            where.status = status as EventStatus;
        }

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { venue: { name: { contains: search as string, mode: 'insensitive' } } },
            ];
        }

        const events = await prisma.event.findMany({
            where,
            include: {
                venue: true,
                organizer: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: { registrations: true },
                },
            },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            orderBy: { date: 'asc' },
        });

        const total = await prisma.event.count({ where });

        res.json({
            events: events.map((e) => ({
                id: e.id,
                title: e.title,
                sport: e.sport,
                description: e.description,
                location: e.venue.name,
                address: e.venue.address,
                latitude: e.venue.latitude,
                longitude: e.venue.longitude,
                navigationUrl: getNavigationUrl(e.venue.latitude, e.venue.longitude),
                date: e.date,
                time: e.time,
                isPaid: e.isPaid,
                price: e.price / 100, // Convert paise to rupees
                maxCapacity: e.maxCapacity,
                spotsAvailable: e.spotsAvailable,
                image: e.image,
                category: e.category,
                status: e.status,
                rating: e.rating,
                ratingCount: e.ratingCount,
                organizer: e.organizer.name,
                registrationCount: e._count.registrations,
            })),
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('List events error:', error);
        res.status(500).json({ error: 'Failed to list events' });
    }
});

/**
 * GET /events/:id
 * Get single event details
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                venue: true,
                organizer: {
                    select: { id: true, name: true, avatar: true },
                },
                registrations: {
                    take: 10,
                    include: {
                        user: {
                            select: { id: true, name: true, avatar: true },
                        },
                    },
                },
                ratings: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { name: true, avatar: true },
                        },
                    },
                },
            },
        });

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        // Check if current user is registered
        let isRegistered = false;
        if (req.user) {
            const registration = await prisma.eventRegistration.findUnique({
                where: {
                    userId_eventId: {
                        userId: req.user.id,
                        eventId: id,
                    },
                },
            });
            isRegistered = !!registration;
        }

        res.json({
            id: event.id,
            title: event.title,
            sport: event.sport,
            description: event.description,
            venue: {
                name: event.venue.name,
                address: event.venue.address,
                latitude: event.venue.latitude,
                longitude: event.venue.longitude,
                capacity: event.venue.capacity,
            },
            navigationUrl: getNavigationUrl(event.venue.latitude, event.venue.longitude),
            date: event.date,
            time: event.time,
            isPaid: event.isPaid,
            price: event.price / 100,
            maxCapacity: event.maxCapacity,
            spotsAvailable: event.spotsAvailable,
            image: event.image,
            category: event.category,
            status: event.status,
            rating: event.rating,
            ratingCount: event.ratingCount,
            organizer: event.organizer,
            isRegistered,
            recentRegistrations: event.registrations.map((r) => ({
                id: r.user.id,
                name: r.user.name,
                avatar: r.user.avatar,
                type: r.type,
            })),
            recentRatings: event.ratings.map((r) => ({
                rating: r.rating,
                comment: r.comment,
                user: r.user.name,
                createdAt: r.createdAt,
            })),
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ error: 'Failed to get event' });
    }
});

/**
 * POST /events
 * Create new event (Organizers only)
 */
router.post('/', authenticate, organizerOnly, async (req: Request, res: Response) => {
    try {
        const data = createEventSchema.parse(req.body);

        // Verify venue exists
        const venue = await prisma.venue.findUnique({
            where: { id: data.venueId },
        });

        if (!venue) {
            res.status(400).json({ error: 'Invalid venue' });
            return;
        }

        // Create event
        const event = await prisma.event.create({
            data: {
                title: data.title,
                sport: data.sport,
                description: data.description,
                venueId: data.venueId,
                date: new Date(data.date),
                time: data.time,
                isPaid: data.isPaid,
                price: data.price * 100, // Convert rupees to paise
                maxCapacity: data.maxCapacity,
                spotsAvailable: data.maxCapacity,
                image: data.image,
                category: data.category,
                organizerId: req.user!.id,
                status: 'upcoming',
            },
        });

        res.status(201).json({
            message: 'Event created successfully',
            event: {
                id: event.id,
                title: event.title,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

/**
 * POST /events/:id/register
 * Register for event as athlete
 */
router.post('/:id/register', authenticate, requireRole('athlete'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const event = await prisma.event.findUnique({
            where: { id },
        });

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        if (event.spotsAvailable <= 0) {
            res.status(400).json({ error: 'No spots available' });
            return;
        }

        // Check if already registered
        const existing = await prisma.eventRegistration.findUnique({
            where: {
                userId_eventId: {
                    userId: req.user!.id,
                    eventId: id,
                },
            },
        });

        if (existing) {
            res.status(400).json({ error: 'Already registered for this event' });
            return;
        }

        // Create registration
        await prisma.eventRegistration.create({
            data: {
                userId: req.user!.id,
                eventId: id,
                type: 'player',
            },
        });

        // Decrease available spots
        await prisma.event.update({
            where: { id },
            data: { spotsAvailable: { decrement: 1 } },
        });

        res.json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Failed to register' });
    }
});

/**
 * POST /events/:id/ticket
 * Buy ticket for event as viewer (returns Stripe checkout URL)
 */
router.post('/:id/ticket', authenticate, requireRole('viewer'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const event = await prisma.event.findUnique({
            where: { id },
            include: { venue: true },
        });

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        if (event.spotsAvailable <= 0) {
            res.status(400).json({ error: 'No spots available' });
            return;
        }

        // For free events, just register
        if (!event.isPaid) {
            await prisma.eventRegistration.create({
                data: {
                    userId: req.user!.id,
                    eventId: id,
                    type: 'viewer',
                },
            });

            await prisma.event.update({
                where: { id },
                data: { spotsAvailable: { decrement: 1 } },
            });

            res.json({ message: 'Ticket secured (free event)', ticketId: `FREE-${Date.now()}` });
            return;
        }

        // For paid events, would create Stripe session
        // This is a placeholder - real implementation in payments route
        res.json({
            message: 'Redirect to payment',
            paymentUrl: `/api/payments/event-checkout?eventId=${id}`,
            price: event.price / 100,
        });
    } catch (error) {
        console.error('Ticket error:', error);
        res.status(500).json({ error: 'Failed to purchase ticket' });
    }
});

/**
 * POST /events/:id/rating
 * Rate a completed event
 */
router.post('/:id/rating', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = ratingSchema.parse(req.body);

        const event = await prisma.event.findUnique({
            where: { id },
        });

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        // Check user was registered
        const registration = await prisma.eventRegistration.findUnique({
            where: {
                userId_eventId: {
                    userId: req.user!.id,
                    eventId: id,
                },
            },
        });

        if (!registration) {
            res.status(403).json({ error: 'You must be registered to rate this event' });
            return;
        }

        // Create or update rating
        await prisma.eventRating.upsert({
            where: {
                userId_eventId: {
                    userId: req.user!.id,
                    eventId: id,
                },
            },
            update: {
                rating: data.rating,
                comment: data.comment,
            },
            create: {
                userId: req.user!.id,
                eventId: id,
                rating: data.rating,
                comment: data.comment,
            },
        });

        // Recalculate average rating
        const ratings = await prisma.eventRating.aggregate({
            where: { eventId: id },
            _avg: { rating: true },
            _count: { rating: true },
        });

        await prisma.event.update({
            where: { id },
            data: {
                rating: ratings._avg.rating || 0,
                ratingCount: ratings._count.rating,
            },
        });

        res.json({ message: 'Rating submitted' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Rating error:', error);
        res.status(500).json({ error: 'Failed to submit rating' });
    }
});

/**
 * GET /events/my-events
 * Get organizer's events
 */
router.get('/organizer/my-events', authenticate, organizerOnly, async (req: Request, res: Response) => {
    try {
        const events = await prisma.event.findMany({
            where: { organizerId: req.user!.id },
            include: {
                venue: true,
                _count: {
                    select: { registrations: true },
                },
            },
            orderBy: { date: 'desc' },
        });

        res.json({
            events: events.map((e) => ({
                id: e.id,
                title: e.title,
                sport: e.sport,
                date: e.date,
                status: e.status,
                rating: e.rating,
                registrations: e._count.registrations,
                venue: e.venue.name,
            })),
        });
    } catch (error) {
        console.error('My events error:', error);
        res.status(500).json({ error: 'Failed to get events' });
    }
});

export default router;
