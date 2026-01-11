// AI Service - Backend Proxy Only
// IMPORTANT: This file makes NO direct calls to OpenRouter
// All AI requests go through our backend API at /api/ai/*
// The backend handles OpenRouter authentication and requests server-side
import { apiClient } from './api';

interface OpenRouterResponse {
    reply?: string;  // Changed from 'message' to 'reply'
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

/**
 * Chat with AI Coach through backend proxy
 * @param userMessage - User's message
 * @param conversationHistory - Not used currently, backend manages context
 * @returns AI response string
 */
export async function chatWithAI(userMessage: string, conversationHistory: string[] = []): Promise<string> {
    const token = getAuthToken();

    // Context is handled by backend now, or we can pass basic context.
    // The backend `generateChatResponse` takes `userName` etc from the authenticated user.
    // We just need to send the message.

    // However, the backend endpoint /api/ai/chat expects { message: string }.
    // It automatically fetches user context from DB.

    if (!token) {
        console.warn('No auth token found for AI chat');
        return "Please log in to use the AI coach.";
    }

    try {
        const response = await apiClient.post('/api/ai/chat', { message: userMessage }, token);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        return data.reply || "I'm having trouble thinking right now. Please try again.";
    } catch (error) {
        console.error('AI Chat Error:', error);
        return "I'm currently unavailable. Please try again in a moment.";
    }
}


/**
 * Analyze performance from text description through backend proxy
 * @param sport - Sport type
 * @param videoDescription - Description of performance
 * @returns Analysis response
 */
export async function analyzeWithAI(sport: string, videoDescription: string): Promise<AnalysisResponse> {
    const token = getAuthToken();

    if (!token) {
        throw new Error('You must be logged in to analyze performance');
    }

    try {
        const response = await apiClient.post(
            '/api/ai/analyze-text',
            { sport, description: videoDescription },
            token
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Analysis failed: ${response.status}`);
        }

        const data = await response.json();
        return data as AnalysisResponse;

    } catch (error) {
        console.error('AI Analysis Error:', error);
        // Fallback response on error
        return {
            score: 75,
            insights: [
                'Could not connect to AI analysis service',
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
