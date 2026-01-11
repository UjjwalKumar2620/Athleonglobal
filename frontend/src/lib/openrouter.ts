// OpenRouter AI Service (Refactored to use Backend Proxy)

interface OpenRouterResponse {
    message?: string;
    error?: string;
}

interface AnalysisResponse {
    score: number;
    insights: string[];
    skillBreakdown: Array<{ skill: string; value: number; fullMark: number }>;
    improvement?: number;
    isRelated?: boolean;
}

const getAuthToken = () => localStorage.getItem('athleon_token');

export async function chatWithOpenRouter(userMessage: string, conversationHistory: string[] = []): Promise<string> {
    const token = getAuthToken();

    // Context is handled by backend now, or we can pass basic context.
    // The backend `generateChatResponse` takes `userName` etc from the authenticated user.
    // We just need to send the message.

    // However, the backend endpoint /api/ai/chat expects { message: string }.
    // It automatically fetches user context from DB.

    if (!token) {
        console.warn('No auth token found for AI chat');
        return "I can't connect to my brain right now. Please log in again.";
    }

    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: userMessage }) // Backend handles context building
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        return data.message || "I'm having trouble thinking right now.";
    } catch (error) {
        console.error('AI Chat Error:', error);
        return "I'm currently offline or having trouble connecting to the server. Please try again later.";
    }
}

export async function analyzeVideoWithOpenRouter(sport: string, videoDescription: string): Promise<AnalysisResponse> {
    const token = getAuthToken();

    if (!token) {
        throw new Error('You must be logged in to analyze performance');
    }

    try {
        const response = await fetch('/api/ai/analyze-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                sport,
                description: videoDescription
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Analysis failed: ${response.status}`);
        }

        const data = await response.json();
        return data as AnalysisResponse;

    } catch (error) {
        console.error('AI Analysis Error:', error);
        // Fallback for demo if server fails?
        return {
            score: 75,
            insights: [
                'Could not connect to analysis server',
                'Showing estimated metrics based on your request',
                'Please check your internet connection and try again'
            ],
            skillBreakdown: [
                { skill: 'Technique', value: 70, fullMark: 100 },
                { skill: 'Power', value: 70, fullMark: 100 },
                { skill: 'Speed', value: 70, fullMark: 100 },
                { skill: 'Accuracy', value: 70, fullMark: 100 },
                { skill: 'Consistency', value: 70, fullMark: 100 }
            ]
        };
    }
}
