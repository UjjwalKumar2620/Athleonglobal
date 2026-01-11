# Production Deployment Guide

## 🚀 Quick Start for Production

Your Athleon Global app has two parts:
- **Frontend**: Auto-deploys to GitHub Pages
- **Backend**: Deployed on Vercel

## ⚠️ Important: Configure Backend API Key

For AI features to work on your live website, add the OpenRouter API key to Vercel:

### Steps:
1. Visit https://vercel.com/dashboard
2. Select your backend project
3. **Settings** → **Environment Variables**
4. Add new variable:
   - Name: `OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key
   - Environments: Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** the backend (Vercel → Deployments → Redeploy)

## 📋 Environment Variables Needed

### Backend (Vercel)
```bash
OPENROUTER_API_KEY=your_key_here           # Required for AI features
DATABASE_URL=your_postgres_url             # If using database
JWT_SECRET=your_secret                     # For authentication
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url
```

### Frontend (GitHub Actions Secrets)
The frontend needs no additional secrets - it uses the backend API URL from `.env.production`.

## 🔄 Deployment Process

### Automatic Deployments
- **Frontend**: Pushes to `main` branch auto-deploy via GitHub Actions
- **Backend**: Pushes to `main` branch auto-deploy via Vercel

### Manual Redeployment
```bash
# Trigger frontend rebuild
git commit --allow-empty -m "chore: redeploy frontend"
git push

# Trigger backend rebuild (same command works for both)
git commit --allow-empty -m "chore: redeploy backend"
git push
```

## ✅ Verify Deployment

### Check Backend
Visit: `https://athleonglobal.vercel.app/api/health`
Should return status OK

### Check Frontend
Visit your GitHub Pages URL
AI chat should work after backend is configured

### Check Logs
- **Vercel**: Dashboard → Deployments → View logs
- **GitHub**: Actions tab → Latest workflow

## 🛠️ Troubleshooting

### AI Chat Not Working
1. Verify API key is set in Vercel
2. Check Vercel deployment logs for "✅ OpenRouter AI configured"
3. Check browser console for errors (F12)
4. Verify frontend is calling correct backend URL

### Backend 404 Errors
1. Ensure backend is deployed to Vercel
2. Check `vercel.json` routing configuration
3. Verify build completed successfully

### CORS Errors
Frontend URL must be added to backend CORS configuration (already configured for `localhost:5173` and your production URL)

## 📚 More Info
- Backend setup: See `backend/README.md`
- API documentation: See `backend/src/routes/` files
- Environment example: See `backend/.env.example`
