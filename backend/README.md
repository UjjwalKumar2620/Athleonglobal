# Athleon Global Backend Setup

## Environment Configuration

### Required Environment Variables

Copy `.env.example` to `.env` and fill in your actual values:

```bash
cp .env.example .env
```

### OpenRouter AI Configuration

The AI features require an OpenRouter API key:

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Create an API key
3. Add it to your `.env` file:
   ```
   OPENROUTER_API_KEY="sk-or-v1-your-api-key-here"
   ```

### Running the Backend

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### Features

- ✅ AI-powered video analysis
- ✅ AI sports coach chatbot
- ✅ User authentication (JWT)
- ✅ Event management
- ✅ Payment processing (Stripe)

### API Endpoints

- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/signup` - User registration
- **POST** `/api/ai/chat` - AI chatbot
- **POST** `/api/ai/analyze` - Video analysis
- **GET** `/api/events` - List events
- **POST** `/api/events` - Create event
