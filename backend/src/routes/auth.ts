import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, generateToken } from '../middleware/auth.js';
import { emailService } from '../services/email.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    role: z.enum(['athlete', 'coach', 'organizer', 'viewer']),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const otpSchema = z.object({
    aadhaarNumber: z.string().length(12),
    phone: z.string().length(10),
});

const verifyOtpSchema = z.object({
    aadhaarNumber: z.string().length(12),
    phone: z.string().length(10),
    otp: z.string().length(6),
});

const emailOtpSchema = z.object({
    email: z.string().email(),
});

const verifyEmailOtpSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
});

// In-memory OTP store (in production, use Redis)
const otpStore: Map<string, { otp: string; expires: Date }> = new Map();

/**
 * POST /auth/signup
 * Create a new user account
 */
router.post('/signup', async (req: Request, res: Response) => {
    try {
        const data = signupSchema.parse(req.body);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role,
                aadhaarVerified: false,
            },
        });

        // Create AI credits wallet for athletes
        if (data.role === 'athlete') {
            await prisma.aICreditsWallet.create({
                data: {
                    userId: user.id,
                    balance: 10, // Free credits on signup
                },
            });

            // Create athlete profile
            await prisma.athleteProfile.create({
                data: {
                    userId: user.id,
                    sports: [],
                    achievements: [],
                    certificates: [],
                    videos: [],
                },
            });
        }

        // Get/create free plan subscription
        let freePlan = await prisma.plan.findFirst({
            where: { slug: 'free' },
        });

        if (freePlan) {
            await prisma.subscription.create({
                data: {
                    userId: user.id,
                    planId: freePlan.id,
                    status: 'active',
                },
            });
        }

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            message: 'Account created successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                aadhaarVerified: user.aadhaarVerified,
            },
            token,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

/**
 * POST /auth/login
 * Login with email and password
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email: data.email },
            include: {
                subscription: {
                    include: { plan: true },
                },
                aiCreditsWallet: true,
            },
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const validPassword = await bcrypt.compare(data.password, user.password);

        if (!validPassword) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                aadhaarVerified: user.aadhaarVerified,
                credits: user.aiCreditsWallet?.balance || 0,
                subscription: user.subscription?.plan?.slug || 'free',
            },
            token,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * POST /auth/send-otp
 * Send OTP for Aadhaar verification (mock)
 */
router.post('/send-otp', async (req: Request, res: Response) => {
    try {
        const data = otpSchema.parse(req.body);

        // Mock OTP - always use 123456 for demo
        const otp = '123456';

        // Store OTP with expiry
        const key = `${data.aadhaarNumber}-${data.phone}`;
        otpStore.set(key, {
            otp,
            expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        res.json({
            message: 'OTP sent successfully',
            // In production, don't return this!
            mockOtp: otp,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

/**
 * POST /auth/verify-otp
 * Verify OTP and mark Aadhaar as verified
 */
router.post('/verify-otp', authenticate, async (req: Request, res: Response) => {
    try {
        const data = verifyOtpSchema.parse(req.body);

        // Mock verification - accept 123456 or any 6-digit number for demo
        const key = `${data.aadhaarNumber}-${data.phone}`;
        const stored = otpStore.get(key);

        // Accept 123456 as universal mock OTP
        const isValid = data.otp === '123456' || (stored && stored.otp === data.otp && stored.expires > new Date());

        if (!isValid) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }

        // Update user's Aadhaar verification status
        await prisma.user.update({
            where: { id: req.user!.id },
            data: {
                aadhaarVerified: true,
                phone: data.phone,
            },
        });

        // Clear used OTP
        otpStore.delete(key);

        res.json({ message: 'Aadhaar verified successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Verification failed' });
    }
});

/**
 * POST /auth/send-email-otp
 * Send OTP to email for verification
 */
router.post('/send-email-otp', async (req: Request, res: Response) => {
    try {
        const data = emailOtpSchema.parse(req.body);

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with expiry
        const key = `email-${data.email}`;
        otpStore.set(key, {
            otp,
            expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        // Send Email
        const sent = await emailService.sendEmailOTP(data.email, otp);

        if (!sent) {
            res.status(500).json({ error: 'Failed to send email' });
            return;
        }

        res.json({
            message: 'OTP sent successfully to your email',
            // Dev mode helpful info, remove in production if strict
            devNote: process.env.NODE_ENV === 'development' ? 'Check server logs for mock OTP if no creds' : undefined
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to process request' });
    }
});

/**
 * POST /auth/verify-email-otp
 * Verify Email OTP
 */
router.post('/verify-email-otp', async (req: Request, res: Response) => {
    try {
        const data = verifyEmailOtpSchema.parse(req.body);

        const key = `email-${data.email}`;
        const stored = otpStore.get(key);

        if (!stored || stored.otp !== data.otp || new Date() > stored.expires) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }

        // OTP Valid
        otpStore.delete(key);

        res.json({
            message: 'Email verified successfully',
            verified: true,
            email: data.email
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

/**
 * GET /auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            include: {
                subscription: {
                    include: { plan: true },
                },
                aiCreditsWallet: true,
                athleteProfile: true,
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            aadhaarVerified: user.aadhaarVerified,
            credits: user.aiCreditsWallet?.balance || 0,
            subscription: user.subscription?.plan?.slug || 'free',
            profile: user.athleteProfile,
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

export default router;
