import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.js';
import { athleteOnly } from '../middleware/roleGuard.js';
import { analyzeVideo, analyzePerformanceText } from '../services/ai.js';
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
 * AI Coach chatbot - MOCK VERSION (Demo)
 * Returns sample responses without calling external AI APIs
 */
router.post('/chat', authenticate, async (req: Request, res: Response) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        // Generate mock AI response based on message content
        const response = generateMockAIResponse(message);

        res.json({
            reply: response,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({
            error: 'AI service temporarily unavailable',
            message: 'Please try again later'
        });
    }
});

/**
 * Generate mock AI coaching responses based on user message
 */
function generateMockAIResponse(message: string): string {
    const lowerMsg = message.toLowerCase();

    // Greetings
    if (lowerMsg.match(/^(hi|hello|hey|greetings)/i)) {
        return "Hello! I'm your AI Sports Coach. I can help you with training tips, technique advice, and performance improvement for various sports. What would you like to know?";
    }

    // Cricket-specific advice
    if (lowerMsg.includes('cricket')) {
        const tips = [
            "For cricket, focus on your batting stance - keep your head still and eyes level. Practice your timing in the nets regularly!",
            "Cricket bowling requires consistent rhythm. Work on your run-up, maintain a smooth action, and focus on line and length.",
            "Fielding is crucial in cricket. Practice catching drills daily and work on your throwing accuracy from different positions."
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    // Football/Soccer advice
    if (lowerMsg.includes('football') || lowerMsg.includes('soccer')) {
        const tips = [
            "Great question about football! Work on ball control with both feet, practice passing accuracy, and build your cardio endurance.",
            "For football, first touch is everything. Practice receiving the ball from different angles and heights. Also work on your weak foot!",
            "Defensive positioning in football requires reading the game. Stay goal-side of your opponent and communicate with teammates."
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    // Basketball advice
    if (lowerMsg.includes('basketball')) {
        const tips = [
            "Basketball skills improve with practice! Focus on dribbling with both hands, shooting form (follow-through is key), and defensive footwork.",
            "For basketball shooting, remember: BEEF - Balance, Eyes on target, Elbow in, Follow through. Practice this form consistently!",
            "Basketball defense wins games. Work on lateral quickness drills and practice staying in front of your opponent without reaching."
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    // Tennis advice
    if (lowerMsg.includes('tennis')) {
        return "Tennis requires excellent footwork and timing. Practice your split-step, work on consistent serves, and develop variety in your shots (topspin, slice, flat).";
    }

    // Training questions
    if (lowerMsg.includes('train') || lowerMsg.includes('workout') || lowerMsg.includes('exercise')) {
        return "Consistent training is key to improvement! Combine strength training, cardio, flexibility work, and skill-specific drills. Remember to rest and recover properly.";
    }

    // Nutrition
    if (lowerMsg.includes('nutrition') || lowerMsg.includes('diet') || lowerMsg.includes('food')) {
        return "Proper nutrition fuels performance! Focus on lean proteins, complex carbs, healthy fats, and plenty of vegetables. Stay hydrated and time your meals around training.";
    }

    // Default response
    return "That's a great question! This is a demo AI coach providing sample responses. For personalized coaching, the full version will analyze your performance data and provide tailored advice.";
}

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
