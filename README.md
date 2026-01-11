# Athleon Global - Sports Networking Platform

A comprehensive sports networking platform connecting athletes, coaches, event organizers, and sports enthusiasts.

## 🚀 Quick Start

### Development
```bash
# Install dependencies for both frontend and backend
npm install

# Run frontend (http://localhost:5173)
cd frontend && npm run dev

# Run backend (http://localhost:3001)
cd backend && npm run dev
```

### Production
See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## ✨ Features

### For Athletes
- 🎥 AI-powered video performance analysis
- 💬 AI sports coach chatbot
- 📊 Performance tracking and analytics
- 🏆 Portfolio showcase
- 🎯 Event participation

### For Coaches/Scouts
- 👀 Discover talent
- 📈 Track athlete progress
- 🤝 Connect with athletes
- 📝 Provide feedback

### For Organizers
- 📅 Create and manage events
- 💳 Collect payments (Stripe)
- 📍 Location-based events (Google Maps)
- 📊 Event analytics

### For Fans/Viewers
- 🎬 Watch athlete content
- ⭐ Follow favorite athletes
- 🎟️ Buy event tickets
- 📰 Stay updated with sports news

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- React Router

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL (optional for production)

### AI/ML
- OpenRouter API (Gemini 2.0 Flash)
- Video analysis with ffmpeg
- Multimodal AI processing

### Payments
- Stripe integration

## 📁 Project Structure

```
athlete-hub-global/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── lib/
│   └── public/
├── backend/           # Express backend API
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── config/
│   └── vercel.json
└── DEPLOYMENT.md      # Production deployment guide
```

## 🔑 Environment Setup

### Backend
Create `backend/.env`:
```bash
OPENROUTER_API_KEY=your_key_here    # Required for AI features
JWT_SECRET=your_secret
PORT=3001
```

See `backend/.env.example` for all options.

### Frontend
Development uses `frontend/.env.development`
Production uses `frontend/.env.production`

## 🌐 Live Demo

- Frontend: Deployed on GitHub Pages
- Backend: Deployed on Vercel
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for setup

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Backend Setup](./backend/README.md)
- [AI Features Documentation](./backend/src/services/ai.ts)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private. All rights reserved.

## 🆘 Support

For issues or questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Review backend logs in Vercel dashboard
3. Check browser console for frontend errors

## 🎯 Roadmap

- [x] User authentication
- [x] AI video analysis
- [x] AI chatbot
- [x] Event management
- [x] Payment integration
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Team features
