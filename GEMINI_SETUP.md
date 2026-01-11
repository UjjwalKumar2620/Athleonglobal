# Gemini AI Integration Setup

This document explains how to set up Gemini AI for the Athleon Global platform.

## Getting Your Gemini API Key

1. **Visit Google AI Studio**
   - Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key" or "Get API Key"
   - Select or create a Google Cloud project
   - Copy your API key

3. **Add to Environment Variables**
   - Open `server/.env` file
   - Add the following line:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```
   - Replace `your_actual_api_key_here` with your actual API key

## Features Enabled by Gemini AI

Once configured, Gemini AI powers:

1. **Video Analysis**
   - Analyzes uploaded sports performance videos
   - Provides detailed performance scores (0-100)
   - Generates skill breakdowns (Speed, Technique, Endurance, Accuracy, Power, Agility)
   - Creates personalized insights and improvement suggestions

2. **AI Coach Chatbot**
   - Conversational AI assistant for athletes
   - Answers questions about performance, technique, and training
   - Provides personalized advice based on user's analysis history
   - Suggests drills and exercises

## How It Works

### Video Analysis Flow

1. User uploads a video file (mp4, mov, avi, mkv, webm)
2. Backend receives the file and sends it to Gemini AI
3. Gemini analyzes the video and generates:
   - Overall performance score
   - Skill-specific scores
   - Detailed insights
   - Improvement recommendations
4. Results are saved to the database and displayed to the user

### Chatbot Flow

1. User sends a message in the AI Coach chat
2. Backend retrieves user's recent analysis data for context
3. Message and context are sent to Gemini AI
4. Gemini generates a personalized response
5. Response is displayed to the user

## Fallback Behavior

If Gemini API key is not configured:
- The system will use mock/fallback responses
- Video analysis will generate randomized but realistic-looking data
- Chatbot will use simple keyword-based responses

## API Usage & Costs

- Gemini API has a free tier with generous limits
- Check [Google AI Studio pricing](https://ai.google.dev/pricing) for details
- The free tier is typically sufficient for development and testing

## Troubleshooting

### "Failed to analyze video"
- Check that `GEMINI_API_KEY` is set in `server/.env`
- Verify the API key is valid and active
- Check backend logs for detailed error messages

### "Failed to generate response" (Chatbot)
- Ensure API key is correctly configured
- Check your internet connection
- Verify API key hasn't been revoked

### Rate Limiting
- If you hit rate limits, the system will fall back to mock responses
- Consider upgrading your Google Cloud plan for higher limits

## Security Notes

- **Never commit your API key to version control**
- Keep your `.env` file in `.gitignore`
- Use environment variables in production
- Rotate your API key if it's exposed

## Testing

To test the integration:

1. Ensure `GEMINI_API_KEY` is set in `server/.env`
2. Restart the backend server
3. Upload a video in the AI Analysis page
4. Check that analysis results are generated
5. Try asking questions in the AI Coach chatbot

## Support

For issues with:
- **API Key**: Contact Google AI Studio support
- **Integration**: Check backend logs and error messages
- **Features**: Review the code in `server/src/services/ai.ts`

