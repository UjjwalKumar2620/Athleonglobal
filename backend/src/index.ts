import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env, validateEnv } from './config/env.js';

// Import routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import aiRoutes from './routes/ai.js';
import eventsRoutes from './routes/events.js';
import paymentsRoutes from './routes/payments.js';

// Import webhook handler (raw body needed)
import { stripeWebhookHandler } from './webhooks/stripe.js';

// Validate environment
validateEnv();

const app: Express = express();

// Force deployment - Updated: 2026-01-11 19:05 IST
// CORS configuration
app.use(cors({
    origin: env.NODE_ENV === 'development'
        ? ['http://localhost:5173', 'http://localhost:8080', env.FRONTEND_URL]
        : [
            env.FRONTEND_URL,
            'https://athleonglobal.in',
            'https://www.athleonglobal.in',
            'https://ujjwalkumar2620.github.io',
            /\.github\.io$/,  // Allow all GitHub Pages subdomains
            /\.athleonglobal\.in$/  // Allow all athleonglobal.in subdomains
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Stripe webhook needs raw body - must be before express.json()
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// JSON body parser for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Root endpoint - returns JSON (not HTML)
app.get('/', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'Athleon Global Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth/*',
            ai: '/api/ai/*',
            events: '/api/events/*',
            payments: '/api/payments/*'
        }
    });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/payments', paymentsRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found', message: 'The requested resource does not exist' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

// Start server
app.listen(env.PORT, () => {
    console.log(`🚀 Athleon Backend running on http://localhost:${env.PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
});

export default app;
