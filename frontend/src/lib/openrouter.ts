// OpenRouter AI Service for Sports Coaching
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Using Gemini 2.0 Flash Lite via OpenRouter as requested to maintain behavior
const MODEL_ID = 'google/gemini-2.0-flash-lite-001';

const SPORTS_COACH_SYSTEM_PROMPT = `You are an AI Sports Coach for Athleon Global, a sports networking platform. Your role is to:

1. Help athletes improve their performance with personalized advice
2. Analyze training techniques and suggest improvements
3. Provide sport-specific tips for Cricket, Football, Basketball, Tennis, Badminton, Swimming, Athletics, and other sports
4. Motivate and encourage athletes in their training journey
5. Answer questions about fitness, nutrition, and mental preparation for sports

Keep responses concise, actionable, and encouraging. Use bullet points when listing tips. If asked about video analysis, explain that you can provide general guidance but for specific video analysis, they should use the video upload feature.

Always be supportive and professional. Focus on practical, evidence-based advice.`;

interface OpenRouterResponse {
    choices?: Array<{
        message: {
            content: string;
        };
    }>;
    error?: {
        message: string;
    };
}

export async function chatWithOpenRouter(userMessage: string, conversationHistory: string[] = []): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your .env file.');
    }

    // Convert legacy conversation history format to messages array if needed
    // Current format in usage: "User: hello" strings.
    // We'll reconstruct a simple message history.
    const messages = [
        { role: 'system', content: SPORTS_COACH_SYSTEM_PROMPT }
    ];

    // Add history context (simplistic parsing since we just get strings)
    // Ideally, we should update the caller to pass proper message objects, 
    // but to avoid breaking changes we'll include it as a previous context block or system note
    if (conversationHistory.length > 0) {
        const historyText = conversationHistory.join('\n');
        messages.push({ role: 'system', content: `Previous conversation context:\n${historyText}` });
    }

    messages.push({ role: 'user', content: userMessage });

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin, // Site URL for OpenRouter rankings
                'X-Title': 'Athleon Global', // Site title
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: messages,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data: OpenRouterResponse = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiResponse = data.choices?.[0]?.message?.content;

        if (!aiResponse) {
            throw new Error('No response from AI');
        }

        return aiResponse.trim();
    } catch (error) {
        console.error('OpenRouter API error:', error);

        // Mock Fallback for Demo/Offline consistency
        console.log('Falling back to Offline Coach mode');
        return "I'm currently having trouble connecting to my main cloud brain (API Error), but I'm still here to help! \n\nAs your offline assistant, I can recommend:\n- Focus on consistency in your training.\n- Ensure you get enough rest and hydration.\n- analyzing your previous gameplays.\n\n(Note: Full AI analysis requires a valid API key, but I'm simulating this response for you.)";
    }
}

export async function analyzeVideoWithOpenRouter(sport: string, videoDescription: string): Promise<{
    score: number;
    insights: string[];
    skillBreakdown: Array<{ skill: string; value: number; fullMark: number }>;
}> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured');
    }

    const prompt = `As an AI Sports Coach, analyze this ${sport} performance based on the description:

"${videoDescription}"

Provide a JSON response with:
1. An overall performance score (0-100)
2. 4-5 key insights about the performance
3. A skill breakdown for: Technique, Power, Speed, Accuracy, Consistency

Respond ONLY with valid JSON in this exact format:
{
  "score": 85,
  "insights": ["insight1", "insight2", "insight3", "insight4"],
  "skillBreakdown": [
    {"skill": "Technique", "value": 80, "fullMark": 100},
    {"skill": "Power", "value": 75, "fullMark": 100},
    {"skill": "Speed", "value": 85, "fullMark": 100},
    {"skill": "Accuracy", "value": 70, "fullMark": 100},
    {"skill": "Consistency", "value": 78, "fullMark": 100}
  ]
}`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Athleon Global',
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data: OpenRouterResponse = await response.json();
        const text = data.choices?.[0]?.message?.content || '';

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Could not parse AI response');
    } catch (error) {
        console.error('Video analysis error:', error);
        // Return mock data as fallback
        return {
            score: Math.floor(Math.random() * 20) + 70,
            insights: [
                'Good form observed in the performance',
                'Consider improving consistency in technique',
                'Strong power generation noted',
                'Work on maintaining speed throughout'
            ],
            skillBreakdown: [
                { skill: 'Technique', value: 75 + Math.floor(Math.random() * 15), fullMark: 100 },
                { skill: 'Power', value: 70 + Math.floor(Math.random() * 20), fullMark: 100 },
                { skill: 'Speed', value: 72 + Math.floor(Math.random() * 18), fullMark: 100 },
                { skill: 'Accuracy', value: 68 + Math.floor(Math.random() * 22), fullMark: 100 },
                { skill: 'Consistency', value: 70 + Math.floor(Math.random() * 15), fullMark: 100 },
            ]
        };
    }
}
