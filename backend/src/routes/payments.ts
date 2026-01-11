import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { createCheckoutSession, getOrCreateCustomer } from '../services/stripe.js';

const router = Router();
const prisma = new PrismaClient();

// Credit pack options
const CREDIT_PACKS = [
    { credits: 10, price: 9900, name: '10 AI Credits' }, // ₹99
    { credits: 25, price: 19900, name: '25 AI Credits' }, // ₹199
    { credits: 50, price: 34900, name: '50 AI Credits' }, // ₹349
];

/**
 * GET /payments/plans
 * Get all subscription plans
 */
router.get('/plans', async (_req: Request, res: Response) => {
    try {
        const plans = await prisma.plan.findMany({
            orderBy: { price: 'asc' },
        });

        res.json({
            plans: plans.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price / 100, // Convert paise to rupees
                period: p.period,
                roleFor: p.roleAccess,
                features: p.features,
            })),
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ error: 'Failed to get plans' });
    }
});

/**
 * POST /payments/subscribe
 * Create subscription checkout session
 */
router.post('/subscribe', authenticate, async (req: Request, res: Response) => {
    try {
        const { planId } = req.body;

        if (!planId) {
            res.status(400).json({ error: 'Plan ID is required' });
            return;
        }

        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) {
            res.status(404).json({ error: 'Plan not found' });
            return;
        }

        // Check if user already has an active subscription
        const existingSubscription = await prisma.subscription.findUnique({
            where: { userId: req.user!.id },
        });

        if (existingSubscription?.status === 'active' && existingSubscription.planId !== planId) {
            // User is upgrading/downgrading - for now, just allow
        }

        // Get or create Stripe customer
        const customerId = await getOrCreateCustomer(
            req.user!.email,
            req.user!.name,
            req.user!.id
        );

        // If no Stripe price ID, use mock checkout
        if (!plan.stripePriceId) {
            // Mock checkout - auto-activate subscription
            await prisma.subscription.upsert({
                where: { userId: req.user!.id },
                update: {
                    planId: plan.id,
                    status: 'active',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                },
                create: {
                    userId: req.user!.id,
                    planId: plan.id,
                    stripeCustomerId: customerId,
                    status: 'active',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });

            res.json({
                message: 'Subscription activated (mock mode)',
                subscription: {
                    plan: plan.name,
                    status: 'active',
                },
            });
            return;
        }

        // Create real Stripe checkout session
        const session = await createCheckoutSession({
            customerId,
            customerEmail: req.user!.email,
            priceId: plan.stripePriceId,
            mode: 'subscription',
            successUrl: `${env.STRIPE_SUCCESS_URL}&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: env.STRIPE_CANCEL_URL,
            metadata: {
                userId: req.user!.id,
                planId: plan.id,
                type: 'subscription',
            },
        });

        res.json({
            checkoutUrl: session.url,
            sessionId: session.id,
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

/**
 * POST /payments/buy-credits
 * Buy AI credits (one-time payment)
 */
router.post('/buy-credits', authenticate, async (req: Request, res: Response) => {
    try {
        const { packIndex } = req.body;

        const pack = CREDIT_PACKS[packIndex];
        if (!pack) {
            res.status(400).json({ error: 'Invalid credit pack' });
            return;
        }

        // Get or create Stripe customer
        const customerId = await getOrCreateCustomer(
            req.user!.email,
            req.user!.name,
            req.user!.id
        );

        // For mock mode, just add credits directly
        if (!env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY.includes('placeholder')) {
            // Add credits
            await prisma.aICreditsWallet.upsert({
                where: { userId: req.user!.id },
                update: { balance: { increment: pack.credits } },
                create: { userId: req.user!.id, balance: pack.credits },
            });

            // Record payment
            await prisma.payment.create({
                data: {
                    userId: req.user!.id,
                    amount: pack.price,
                    type: 'credits',
                    description: pack.name,
                    status: 'completed',
                    metadata: { credits: pack.credits },
                },
            });

            res.json({
                message: 'Credits added (mock mode)',
                credits: pack.credits,
            });
            return;
        }

        // Create Stripe checkout session
        const session = await createCheckoutSession({
            customerId,
            customerEmail: req.user!.email,
            mode: 'payment',
            successUrl: `${env.STRIPE_SUCCESS_URL}&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: env.STRIPE_CANCEL_URL,
            metadata: {
                userId: req.user!.id,
                credits: pack.credits.toString(),
                type: 'credits',
            },
            lineItems: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: pack.name,
                            description: `${pack.credits} AI video analysis credits`,
                        },
                        unit_amount: pack.price,
                    },
                    quantity: 1,
                },
            ],
        });

        // Record pending payment
        await prisma.payment.create({
            data: {
                userId: req.user!.id,
                stripeSessionId: session.id,
                amount: pack.price,
                type: 'credits',
                description: pack.name,
                status: 'pending',
                metadata: { credits: pack.credits },
            },
        });

        res.json({
            checkoutUrl: session.url,
            sessionId: session.id,
        });
    } catch (error) {
        console.error('Buy credits error:', error);
        res.status(500).json({ error: 'Failed to purchase credits' });
    }
});

/**
 * POST /payments/event-checkout
 * Create checkout for event ticket
 */
router.post('/event-checkout', authenticate, async (req: Request, res: Response) => {
    try {
        const { eventId } = req.body;

        if (!eventId) {
            res.status(400).json({ error: 'Event ID is required' });
            return;
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { venue: true, organizer: true },
        });

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        if (!event.isPaid) {
            res.status(400).json({ error: 'This is a free event' });
            return;
        }

        if (event.spotsAvailable <= 0) {
            res.status(400).json({ error: 'No spots available' });
            return;
        }

        // Calculate platform fee
        const platformFee = Math.round((event.price * env.PLATFORM_COMMISSION_PERCENT) / 100);
        const organizerEarnings = event.price - platformFee;

        // For mock mode
        if (!env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY.includes('placeholder')) {
            // Create registration
            const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            await prisma.eventRegistration.create({
                data: {
                    userId: req.user!.id,
                    eventId,
                    type: 'viewer',
                    ticketId,
                },
            });

            await prisma.event.update({
                where: { id: eventId },
                data: { spotsAvailable: { decrement: 1 } },
            });

            // Record payment
            await prisma.payment.create({
                data: {
                    userId: req.user!.id,
                    amount: event.price,
                    type: 'ticket',
                    description: `Ticket for ${event.title}`,
                    status: 'completed',
                    platformFee,
                    organizerEarnings,
                    metadata: { eventId, ticketId },
                },
            });

            res.json({
                message: 'Ticket purchased (mock mode)',
                ticketId,
            });
            return;
        }

        // Get or create Stripe customer
        const customerId = await getOrCreateCustomer(
            req.user!.email,
            req.user!.name,
            req.user!.id
        );

        // Create Stripe checkout session
        const session = await createCheckoutSession({
            customerId,
            customerEmail: req.user!.email,
            mode: 'payment',
            successUrl: `${env.STRIPE_SUCCESS_URL}&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: env.STRIPE_CANCEL_URL,
            metadata: {
                userId: req.user!.id,
                eventId,
                type: 'ticket',
                platformFee: platformFee.toString(),
                organizerEarnings: organizerEarnings.toString(),
            },
            lineItems: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Ticket: ${event.title}`,
                            description: `${event.venue.name} - ${event.date}`,
                        },
                        unit_amount: event.price,
                    },
                    quantity: 1,
                },
            ],
        });

        // Record pending payment
        await prisma.payment.create({
            data: {
                userId: req.user!.id,
                stripeSessionId: session.id,
                amount: event.price,
                type: 'ticket',
                description: `Ticket for ${event.title}`,
                status: 'pending',
                platformFee,
                organizerEarnings,
                metadata: { eventId },
            },
        });

        res.json({
            checkoutUrl: session.url,
            sessionId: session.id,
        });
    } catch (error) {
        console.error('Event checkout error:', error);
        res.status(500).json({ error: 'Failed to create checkout' });
    }
});

/**
 * GET /payments/billing/history
 * Get user's payment history
 */
router.get('/billing/history', authenticate, async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const payments = await prisma.payment.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
        });

        const total = await prisma.payment.count({
            where: { userId: req.user!.id },
        });

        res.json({
            payments: payments.map((p) => ({
                id: p.id,
                amount: p.amount / 100,
                type: p.type,
                description: p.description,
                status: p.status,
                createdAt: p.createdAt,
            })),
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Billing history error:', error);
        res.status(500).json({ error: 'Failed to get billing history' });
    }
});

/**
 * GET /payments/credit-packs
 * Get available credit packs
 */
router.get('/credit-packs', (_req: Request, res: Response) => {
    res.json({
        packs: CREDIT_PACKS.map((pack, index) => ({
            index,
            credits: pack.credits,
            price: pack.price / 100, // Convert to rupees
            name: pack.name,
        })),
    });
});

export default router;
