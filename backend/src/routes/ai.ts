import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.js';
import { athleteOnly } from '../middleware/roleGuard.js';
import { analyzeVideo, generateChatResponse, analyzePerformanceText } from '../services/ai.js';
import { env } from '../config/env.js';

const router = Router();
const prisma = new PrismaClient();

// Constants
const FREE_MONTHLY_ANALYSES = 2;

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|mov|avi|mkv|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only video files are allowed (mp4, mov, avi, mkv, webm)'));
        }
    },
});

/**
 * POST /ai/upload-video
 * Upload and analyze a video (Athletes only)
 */
router.post('/upload-video', authenticate, athleteOnly, upload.single('video'), async (req: Request, res: Response) => {
    try {
        const videoFile = req.file;
        const { videoTitle } = req.body;

        // Check if file was uploaded or if videoUrl is provided
        if (!videoFile && !req.body.videoUrl) {
            res.status(400).json({ error: 'Video file or URL is required' });
            return;
        }

        // Get user's subscription and credits
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            include: {
                subscription: { include: { plan: true } },
                aiCreditsWallet: true,
            },
        });

        if (!user) {
            // Clean up uploaded file if user not found
            if (videoFile) {
                fs.unlinkSync(videoFile.path);
            }
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const isProPlan = user.subscription?.plan?.slug === 'athlete_pro';
        const credits = user.aiCreditsWallet?.balance || 0;

        // Check if user has credits (unless Pro plan with unlimited)
        if (!isProPlan) {
            // Count this month's analyses for free tier
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const monthlyAnalyses = await prisma.aIUsageLog.count({
                where: {
                    userId: user.id,
                    createdAt: { gte: startOfMonth },
                },
            });

            // Free plan check
            if (user.subscription?.plan?.slug === 'free' && monthlyAnalyses >= FREE_MONTHLY_ANALYSES) {
                if (credits < 1) {
                    // Clean up uploaded file
                    if (videoFile) {
                        fs.unlinkSync(videoFile.path);
                    }
                    res.status(403).json({
                        error: 'No AI credits remaining',
                        message: `You've used your ${FREE_MONTHLY_ANALYSES} free analyses this month. Purchase more credits or upgrade to Pro.`,
                    });
                    return;
                }

                // Deduct credit
                await prisma.aICreditsWallet.update({
                    where: { userId: user.id },
                    data: { balance: { decrement: 1 } },
                });
            }
        }

        // Determine video URL (uploaded file path or provided URL)
        const videoUrl = videoFile ? `/uploads/videos/${path.basename(videoFile.path)}` : req.body.videoUrl;

        // Run AI analysis
        const analysis = await analyzeVideo(videoFile?.path, videoTitle);

        // Save analysis results
        const usageLog = await prisma.aIUsageLog.create({
            data: {
                userId: user.id,
                videoUrl,
                videoTitle: videoTitle || videoFile?.originalname || 'Untitled Video',
                score: analysis.score,
                insights: analysis.insights,
                skillBreakdown: analysis.skillBreakdown as any,
            },
        });

        // Get or create athlete profile
        let athleteProfile = await prisma.athleteProfile.findUnique({
            where: { userId: user.id },
        });

        if (!athleteProfile) {
            athleteProfile = await prisma.athleteProfile.create({
                data: {
                    userId: user.id,
                    sports: [],
                },
            });
        }

        // Also save to performance history
        await prisma.performanceData.create({
            data: {
                athleteProfileId: athleteProfile.id,
                overallScore: analysis.score,
                speedScore: analysis.skillBreakdown.find((s) => s.skill === 'Speed')?.value || 0,
                techniqueScore: analysis.skillBreakdown.find((s) => s.skill === 'Technique')?.value || 0,
                enduranceScore: analysis.skillBreakdown.find((s) => s.skill === 'Endurance')?.value || 0,
                accuracyScore: analysis.skillBreakdown.find((s) => s.skill === 'Accuracy')?.value || 0,
                powerScore: analysis.skillBreakdown.find((s) => s.skill === 'Power')?.value || 0,
                agilityScore: analysis.skillBreakdown.find((s) => s.skill === 'Agility')?.value || 0,
            },
        });

        res.json({
            message: 'Video analyzed successfully',
            analysis: {
                id: usageLog.id,
                score: analysis.score,
                improvement: analysis.improvement,
                insights: analysis.insights,
                skillBreakdown: analysis.skillBreakdown,
            },
        });
    } catch (error) {
        console.error('AI upload error:', error);
        // Clean up uploaded file on error
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Failed to clean up file:', unlinkError);
            }
        }
        res.status(500).json({ error: 'Failed to analyze video', message: error instanceof Error ? error.message : 'Unknown error' });
    }
});

/**
 * GET /ai/results
 * Get analysis history (Athletes only)
 */
router.get('/results', authenticate, athleteOnly, async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const results = await prisma.aIUsageLog.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
        });

        const total = await prisma.aIUsageLog.count({
            where: { userId: req.user!.id },
        });

        // Get performance trend data
        const performanceHistory = await prisma.aIUsageLog.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'asc' },
            take: 12,
            select: {
                score: true,
                createdAt: true,
            },
        });

        res.json({
            results: results.map((r) => ({
                id: r.id,
                videoTitle: r.videoTitle,
                videoUrl: r.videoUrl,
                score: r.score,
                insights: r.insights,
                skillBreakdown: r.skillBreakdown,
                analyzedAt: r.createdAt,
            })),
            performanceTrend: performanceHistory.map((p) => ({
                score: p.score,
                date: p.createdAt,
            })),
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get AI results error:', error);
        res.status(500).json({ error: 'Failed to get results' });
    }
});

/**
 * POST /ai/chat
 * AI Coach chatbot (All authenticated users)
 */
router.post('/chat', authenticate, async (req: Request, res: Response) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        // Get user's recent analysis for context (if athlete)
        let recentAnalysis = null;
        if (req.user!.role === 'athlete') {
            try {
                recentAnalysis = await prisma.aIUsageLog.findFirst({
                    where: { userId: req.user!.id },
                    orderBy: { createdAt: 'desc' },
                });
            } catch (dbError) {
                console.error('Error fetching recent analysis:', dbError);
                // Continue without recent analysis
            }
        }

        const response = await generateChatResponse(message, {
            userName: req.user!.name,
            recentScore: recentAnalysis?.score || undefined,
            skills: (recentAnalysis?.skillBreakdown as any[]) || undefined,
            videoTitle: recentAnalysis?.videoTitle || undefined,
            insights: (recentAnalysis?.insights as string[]) || undefined,
        });

        res.json({
            reply: response,  // Changed from 'message' to 'reply'
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('AI chat error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
        res.status(500).json({
            error: 'AI service temporarily unavailable',
            message: errorMessage,
            details: env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
        });
    }
});

/**
 * GET /ai/credits
 * Get current AI credit balance
 */
router.get('/credits', authenticate, async (req: Request, res: Response) => {
    try {
        const wallet = await prisma.aICreditsWallet.findUnique({
            where: { userId: req.user!.id },
        });

        const subscription = await prisma.subscription.findUnique({
            where: { userId: req.user!.id },
            include: { plan: true },
        });

        // Count this month's analyses
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyAnalyses = await prisma.aIUsageLog.count({
            where: {
                userId: req.user!.id,
                createdAt: { gte: startOfMonth },
            },
        });

        res.json({
            credits: wallet?.balance || 0,
            plan: subscription?.plan?.slug || 'free',
            isUnlimited: subscription?.plan?.slug === 'athlete_pro',
            monthlyUsed: monthlyAnalyses,
            monthlyLimit: subscription?.plan?.slug === 'free' ? FREE_MONTHLY_ANALYSES : null,
        });
    } catch (error) {
        console.error('Get credits error:', error);
        res.status(500).json({ error: 'Failed to get credits' });
    }
});

/**
 * POST /ai/analyze-text
 * Analyze performance from text description (Authenticated)
 */
router.post('/analyze-text', authenticate, async (req: Request, res: Response) => {
    try {
        const { sport, description } = req.body;

        if (!sport || !description) {
            res.status(400).json({ error: 'Sport and description are required' });
            return;
        }

        const analysis = await analyzePerformanceText(sport, description);

        // Optionally save to usage log if desired, but frontend didn't seem to imply saving it permanently?
        // Let's just return it for now to match frontend behavior.

        res.json(analysis);
    } catch (error) {
        console.error('Text analysis route error:', error);
        res.status(500).json({ error: 'Failed to analyze performance' });
    }
});

export default router;
