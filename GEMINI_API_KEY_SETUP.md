# Gemini API Key Setup

Your Gemini API key has been integrated into the codebase.

## API Key
```
AIzaSyDs0x6XGEu13erdACrEwjIOir0fBTvx9gs
```

## Configuration

The API key is now configured in two ways:

### 1. Development Mode (Automatic)
The API key is hardcoded as a fallback in development mode. This means it will work automatically when you run the server in development.

### 2. Environment Variable (Recommended for Production)
For production or to override, add it to `server/.env`:

```env
GEMINI_API_KEY=AIzaSyDs0x6XGEu13erdACrEwjIOir0fBTvx9gs
```

## Quick Setup

Run this command to add the key to your .env file:

```bash
cd server
echo "" >> .env
echo "GEMINI_API_KEY=AIzaSyDs0x6XGEu13erdACrEwjIOir0fBTvx9gs" >> .env
```

Or manually edit `server/.env` and add:
```
GEMINI_API_KEY=AIzaSyDs0x6XGEu13erdACrEwjIOir0fBTvx9gs
```

## Verification

After starting your backend server, you should see in the console:
```
✅ Gemini AI initialized successfully
```

If you see:
```
⚠️  GEMINI_API_KEY not configured. AI features will use fallback responses.
```

Then the key wasn't loaded properly. Check that:
1. The server is running in development mode, OR
2. The .env file exists in the `server/` directory with the key

## Testing

1. Start your backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Check the console for the initialization message

3. Try the AI chatbot in the frontend - it should now use Gemini AI!

## Security Note

⚠️ **Important**: The API key is currently hardcoded for development convenience. For production:
- Remove the hardcoded fallback
- Use environment variables only
- Never commit API keys to version control
- Use a secrets management service

