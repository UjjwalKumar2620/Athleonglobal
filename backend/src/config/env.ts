import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
    // Server
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Database
    DATABASE_URL: process.env.DATABASE_URL || '',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // Stripe
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/dashboard?payment=success',
    STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/pricing?payment=cancelled',

    // Google Maps
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',

    // OpenRouter AI
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',

    // Platform
    PLATFORM_COMMISSION_PERCENT: parseInt(process.env.PLATFORM_COMMISSION_PERCENT || '5', 10),

    // Email
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
};

// Validate required env vars in production
export function validateEnv(): void {
    const required = ['DATABASE_URL', 'JWT_SECRET'];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0 && env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}
