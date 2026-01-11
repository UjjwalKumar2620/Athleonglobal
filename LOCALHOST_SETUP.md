# Localhost Development Setup Guide

This guide will help you set up and run the Athleon Global application on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd athlete-hub-global-main

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Set Up Database

#### Option A: Local PostgreSQL

1. Create a PostgreSQL database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE athleon_db;

# Exit psql
\q
```

#### Option B: Use Supabase (Cloud PostgreSQL - Recommended for Quick Setup)

1. Go to [Supabase](https://supabase.com/) and create a free account
2. Create a new project
3. Copy the connection string from Project Settings > Database
4. Use this as your `DATABASE_URL`

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env  # If .env.example exists, or create manually
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/athleon_db?schema=public"
# Or use your Supabase connection string

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Stripe (Optional - can be left empty for local development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_SUCCESS_URL=http://localhost:8080/dashboard?payment=success
STRIPE_CANCEL_URL=http://localhost:8080/pricing?payment=cancelled

# Google Maps API (Optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Gemini AI (Required for AI features)
# Get your API key from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=AIzaSyDs0x6XGEu13erdACrEwjIOir0fBTvx9gs

# Platform Settings
PLATFORM_COMMISSION_PERCENT=5
```

### 4. Set Up Database Schema

```bash
cd server

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed sample data
npm run seed
```

### 5. Install Concurrently (for running both servers)

```bash
# From the root directory
npm install --save-dev concurrently
```

### 6. Start the Development Servers

#### Option A: Run Both Servers Together (Recommended)

```bash
# From the root directory
npm run dev:full
```

This will start:
- **Frontend** on `http://localhost:8080`
- **Backend API** on `http://localhost:3001`

#### Option B: Run Servers Separately

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Frontend will be available at `http://localhost:8080`

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
```
Backend API will be available at `http://localhost:3001`

## Accessing the Application

Once both servers are running:

- **Frontend**: Open [http://localhost:8080](http://localhost:8080) in your browser
- **Backend API**: Available at [http://localhost:3001](http://localhost:3001)
- **API Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

## Demo Accounts

After running the seed script, you can use these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Athlete | athlete@athleon.com | password123 |
| Organizer | organizer@athleon.com | password123 |
| Coach | coach@athleon.com | password123 |
| Viewer | viewer@athleon.com | password123 |

## API Endpoints

The backend API is available at `http://localhost:3001/api`. The frontend is configured to proxy all `/api` requests to the backend automatically.

### Available Endpoints:

- **Authentication**: `/api/auth/*`
- **Profile**: `/api/profile/*`
- **AI Analysis**: `/api/ai/*`
- **Events**: `/api/events/*`
- **Payments**: `/api/payments/*`
- **Webhooks**: `/api/webhooks/*`

See `server/README.md` for detailed API documentation.

## Troubleshooting

### Port Already in Use

If port 8080 or 3001 is already in use:

1. **Change Frontend Port**: Edit `vite.config.ts` and change the port number
2. **Change Backend Port**: Edit `server/.env` and change the `PORT` value

### Database Connection Issues

1. Make sure PostgreSQL is running:
   ```bash
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   
   # Windows
   # Start PostgreSQL service from Services
   ```

2. Verify your `DATABASE_URL` is correct
3. Check that the database exists

### CORS Errors

If you see CORS errors, make sure:
- `FRONTEND_URL` in `server/.env` matches your frontend URL (http://localhost:8080)
- Both servers are running

### Prisma Issues

If you encounter Prisma errors:

```bash
cd server
npx prisma generate
npx prisma db push
```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **Database Changes**: After modifying `server/prisma/schema.prisma`, run:
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```
3. **View Database**: Use Prisma Studio to view/edit your database:
   ```bash
   cd server
   npx prisma studio
   ```

## Project Structure

```
athlete-hub-global-main/
├── src/                 # Frontend React application
├── server/              # Backend Express API
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── config/     # Configuration
│   └── prisma/         # Database schema
└── public/             # Static assets
```

## Next Steps

- Explore the application at `http://localhost:8080`
- Check the API documentation in `server/README.md`
- Review the code structure and start developing!

## Need Help?

- Check the backend README: `server/README.md`
- Review the Prisma documentation: https://www.prisma.io/docs
- Check Vite documentation: https://vitejs.dev/

