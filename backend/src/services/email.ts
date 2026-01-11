import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT === 465, // true for 465, false for other ports
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        });
    }

    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('✅ SMTP connection established successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to SMTP server:', error);
            return false;
        }
    }

    async sendEmailOTP(email: string, otp: string): Promise<boolean> {
        if (!env.SMTP_USER || !env.SMTP_PASS) {
            console.warn('⚠️ SMTP credentials not configured. Mocking email send.');
            console.log(`[MOCK EMAIL] To: ${email} | OTP: ${otp}`);
            return true;
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"Athleon Global" <${env.SMTP_USER}>`,
                to: email,
                subject: 'Your Athleon Global Verification Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #333;">Welcome to Athleon Global!</h2>
                        <p>Your verification code is:</p>
                        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p>This code will expire in 10 minutes.</p>
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
                    </div>
                `,
            });
            console.log('📧 Email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            return false;
        }
    }
}

export const emailService = new EmailService();
