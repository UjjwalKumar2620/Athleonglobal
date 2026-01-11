import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { constructWebhookEvent } from '../services/stripe.js';
import { env } from '../config/env.js';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Idempotency tracking (in production, use Redis)
const processedEvents = new Set<string>();

/**
 * Stripe webhook handler
 */
export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
        res.status(400).json({ error: 'Missing stripe-signature header' });
        return;
    }

    let event: Stripe.Event;

    try {
        event = constructWebhookEvent(req.body, signature);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        res.status(400).json({ error: 'Invalid signature' });
        return;
    }

    // Idempotency check
    if (processedEvents.has(event.id)) {
        res.json({ received: true, message: 'Event already processed' });
        return;
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Mark as processed
        processedEvents.add(event.id);

        // Clean up old events (in production, use TTL in Redis)
        if (processedEvents.size > 1000) {
            const iterator = processedEvents.values();
            for (let i = 0; i < 500; i++) {
                const eventId = iterator.next().value;
                if (eventId) processedEvents.delete(eventId);
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
}

/**
 * Handle checkout.session.completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const type = metadata.type;

    if (!userId) {
        console.error('Missing userId in session metadata');
        return;
    }

    if (type === 'credits') {
        // Add AI credits
        const credits = parseInt(metadata.credits || '0', 10);

        await prisma.aICreditsWallet.upsert({
            where: { userId },
            update: { balance: { increment: credits } },
            create: { userId, balance: credits },
        });

        // Update payment status
        await prisma.payment.updateMany({
            where: { stripeSessionId: session.id },
            data: {
                status: 'completed',
                stripePaymentId: session.payment_intent as string,
            },
        });

        console.log(`Added ${credits} credits to user ${userId}`);
    } else if (type === 'ticket') {
        // Create event registration
        const eventId = metadata.eventId;
        const ticketId = `TKT-${uuidv4()}`;

        await prisma.eventRegistration.create({
            data: {
                userId,
                eventId,
                type: 'viewer',
                ticketId,
            },
        });

        await prisma.event.update({
            where: { id: eventId },
            data: { spotsAvailable: { decrement: 1 } },
        });

        // Update payment status
        await prisma.payment.updateMany({
            where: { stripeSessionId: session.id },
            data: {
                status: 'completed',
                stripePaymentId: session.payment_intent as string,
                metadata: { eventId, ticketId },
            },
        });

        console.log(`Created ticket ${ticketId} for user ${userId} event ${eventId}`);
    } else if (type === 'subscription') {
        // Activate subscription
        const planId = metadata.planId;

        await prisma.subscription.upsert({
            where: { userId },
            update: {
                planId,
                stripeSubscriptionId: session.subscription as string,
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            create: {
                userId,
                planId,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        console.log(`Activated subscription for user ${userId}`);
    }
}

/**
 * Handle invoice.payment_succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = invoice.subscription as string;

    if (!subscriptionId) return;

    // Update subscription period
    await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
            status: 'active',
            currentPeriodStart: new Date((invoice.period_start || 0) * 1000),
            currentPeriodEnd: new Date((invoice.period_end || 0) * 1000),
        },
    });

    console.log(`Updated subscription period for ${subscriptionId}`);
}

/**
 * Handle customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const status = subscription.status === 'active' ? 'active' :
        subscription.status === 'past_due' ? 'past_due' :
            subscription.status === 'canceled' ? 'cancelled' : 'active';

    await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
            status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
    });

    console.log(`Updated subscription ${subscription.id} to status ${status}`);
}

/**
 * Handle customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    // Find user's subscription
    const sub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
    });

    if (!sub) return;

    // Get free plan
    const freePlan = await prisma.plan.findFirst({
        where: { slug: 'free' },
    });

    if (freePlan) {
        // Downgrade to free plan
        await prisma.subscription.update({
            where: { id: sub.id },
            data: {
                planId: freePlan.id,
                status: 'cancelled',
                stripeSubscriptionId: null,
            },
        });
    }

    console.log(`Cancelled subscription ${subscription.id}`);
}
