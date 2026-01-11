# Athleon Global Backend

Backend API for the Athleon Global sports networking platform.

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database (requires PostgreSQL)
npx prisma db push

# Seed sample data
npm run seed

# Start development server
npm run dev
```

## Demo Accounts

After seeding, use these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Athlete | athlete@athleon.com | password123 |
| Organizer | organizer@athleon.com | password123 |
| Coach | coach@athleon.com | password123 |
| Viewer | viewer@athleon.com | password123 |

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/send-otp` - Send Aadhaar OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile/me` - Get profile
- `PUT /api/profile/update` - Update profile
- `GET /api/profile/athletes` - List athletes
- `GET /api/profile/athletes/:id` - Get athlete details (Coach only)

### AI Analysis
- `POST /api/ai/upload-video` - Analyze video (Athlete only)
- `GET /api/ai/results` - Get analysis history
- `POST /api/ai/chat` - AI Coach chatbot
- `GET /api/ai/credits` - Get credit balance

### Events
- `GET /api/events` - List events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (Organizer only)
- `POST /api/events/:id/register` - Register as player (Athlete only)
- `POST /api/events/:id/ticket` - Buy ticket (Viewer only)
- `POST /api/events/:id/rating` - Rate event

### Payments
- `GET /api/payments/plans` - List subscription plans
- `POST /api/payments/subscribe` - Subscribe to plan
- `POST /api/payments/buy-credits` - Buy AI credits
- `GET /api/payments/billing/history` - Payment history
- `GET /api/payments/credit-packs` - Available credit packs

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Tech Stack

- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT
- **Payments**: Stripe
- **Validation**: Zod
