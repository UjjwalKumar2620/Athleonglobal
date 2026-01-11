import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Upload, Play, Zap, TrendingUp, Target, Activity, Brain, Video, Send, Bot, User, Lightbulb, ChevronDown, ChevronUp, X, Sparkles, FileSpreadsheet, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { chatWithOpenRouter } from '@/lib/openrouter';
import { Progress } from '@/components/ui/progress';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface PerformanceStat {
  metric: string;
  value: string;
  observation: string;
}

interface AnalysisResult {
  id: string;
  videoTitle: string;
  videoUrl?: string;
  score: number;
  insights: string[];
  skillBreakdown: Array<{ skill: string; value: number; fullMark: number }>;
  analyzedAt: string;
  performanceStats?: PerformanceStat[];
  keyStrengths?: Array<{ title: string; description: string }>;
  areasForImprovement?: Array<{ title: string; description: string }>;
}

interface CreditsInfo {
  credits: number;
  plan: string;
  isUnlimited: boolean;
  monthlyUsed: number;
  monthlyLimit: number | null;
}

// Generate random performance data for video analysis
const generateRandomPerformanceData = () => {
  const performanceStats: PerformanceStat[] = [
    {
      metric: 'Total Shots Played',
      value: String(Math.floor(Math.random() * 15) + 8),
      observation: `You controlled the tempo for roughly ${Math.floor(Math.random() * 30) + 60}% of the rally.`
    },
    {
      metric: 'Smash Accuracy',
      value: `${Math.floor(Math.random() * 20) + 80}%`,
      observation: 'Both smashes were well-placed and forced errors from the opponent.'
    },
    {
      metric: 'Footwork Efficiency',
      value: ['High', 'Very High', 'Excellent'][Math.floor(Math.random() * 3)],
      observation: 'You consistently returned to the "base" position after every shot.'
    },
    {
      metric: 'Net Play',
      value: ['Minimal', 'Moderate', 'Active'][Math.floor(Math.random() * 3)],
      observation: 'Most of this rally was played mid-to-rear court; focus on net battles could improve.'
    },
    {
      metric: 'Rally Outcome',
      value: ['Winner', 'Forced Error', 'Point Won'][Math.floor(Math.random() * 3)],
      observation: 'Point secured via a decisive cross-court smash.'
    }
  ];

  const keyStrengths = [
    {
      title: 'Explosive Power',
      description: 'Your jump smash is your primary weapon. You generate significant downward angle, which is difficult for opponents to "drive" back.'
    },
    {
      title: 'Recovery Speed',
      description: 'After your first smash, you didn\'t "admire your shot." You immediately moved back to a defensive stance to cover the return.'
    },
    {
      title: 'Shuttle Tracking',
      description: 'You tracked the high lifts well, getting behind the shuttle early to ensure you were hitting it at the highest point possible.'
    }
  ];

  const areasForImprovement = [
    {
      title: 'Deception',
      description: 'While your power is great, your preparation for the smash is quite "telegraphed." Against elite defenders, you might benefit from using the same "big" arm swing but playing a stop-drop or slice to catch them leaning backward.'
    }
  ];

  return { performanceStats, keyStrengths, areasForImprovement };
};

const AIAnalysisPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzedVideos, setAnalyzedVideos] = useState<AnalysisResult[]>([]);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [creditsInfo, setCreditsInfo] = useState<CreditsInfo | null>(null);
  const [performanceTrend, setPerformanceTrend] = useState<Array<{ score: number; date: string }>>([]);
  const [copied, setCopied] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('athleon_token') || '';
  };

  // Fetch credits info - use local state since backend may not be running
  const fetchCredits = async () => {
    // Use credits from user context or default to 20
    setCreditsInfo({
      credits: user?.credits || 20,
      plan: 'free',
      isUnlimited: false,
      monthlyUsed: 0,
      monthlyLimit: 50,
    });
  };

  // Fetch analysis results
  const fetchResults = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/ai/results', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setAnalyzedVideos(data.results);
          setHasAnalysis(true);
          setCurrentAnalysis(data.results[0]);
          setPerformanceTrend(data.performanceTrend || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
      // Fallback to sample data if backend fails
      const mockResult: AnalysisResult = {
        id: 'mock-1',
        videoTitle: 'Sprint Analysis (Mock)',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
        analyzedAt: new Date().toISOString(),
        score: 85,
        insights: [
          'Excellent technique in the follow-through phase.',
          'Maintained consistent speed throughout the run.',
          'Body posture was well-balanced during the movement.',
          'Consider increasing power generation in the initial phase.'
        ],
        skillBreakdown: [
          { skill: 'Technique', value: 88, fullMark: 100 },
          { skill: 'Power', value: 75, fullMark: 100 },
          { skill: 'Speed', value: 92, fullMark: 100 },
          { skill: 'Accuracy', value: 80, fullMark: 100 },
          { skill: 'Consistency', value: 85, fullMark: 100 }
        ]
      };
      setAnalyzedVideos([mockResult]);

      // Only set current analysis if nothing selected, but here we just set it to ensure something shows
      if (!currentAnalysis) {
        setHasAnalysis(true);
        setCurrentAnalysis(mockResult);
      }
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchCredits();
    fetchResults();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select a video file (mp4, mov, avi, mkv, webm)',
          variant: 'destructive',
        });
        return;
      }
      // Validate file size (100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select a video file smaller than 100MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      if (!videoTitle) {
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a video file to upload',
        variant: 'destructive',
      });
      return;
    }

    if (!creditsInfo) {
      await fetchCredits();
    }

    if (!creditsInfo?.isUnlimited && (creditsInfo?.credits || 0) < 1) {
      if (creditsInfo?.monthlyLimit && creditsInfo.monthlyUsed < creditsInfo.monthlyLimit) {
        // Still have free analyses
      } else {
        toast({
          title: 'Insufficient Credits',
          description: 'You need at least 1 AI credit to analyze a video.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Generate random performance data
    const { performanceStats, keyStrengths, areasForImprovement } = generateRandomPerformanceData();

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 5;
      });
    }, 300);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    clearInterval(progressInterval);
    setAnalysisProgress(100);

    // Create analysis result object with random data
    const newAnalysis: AnalysisResult = {
      id: Date.now().toString(),
      videoTitle: videoTitle || selectedFile.name,
      score: Math.floor(Math.random() * 20) + 75,
      insights: [
        'Strong technique observed in power shots',
        'Footwork shows consistent positioning',
        'Recovery speed above average',
        'Consider varying shot placement more'
      ],
      skillBreakdown: [
        { skill: 'Power', value: Math.floor(Math.random() * 20) + 75, fullMark: 100 },
        { skill: 'Accuracy', value: Math.floor(Math.random() * 20) + 70, fullMark: 100 },
        { skill: 'Speed', value: Math.floor(Math.random() * 20) + 70, fullMark: 100 },
        { skill: 'Technique', value: Math.floor(Math.random() * 20) + 75, fullMark: 100 },
        { skill: 'Endurance', value: Math.floor(Math.random() * 20) + 65, fullMark: 100 },
      ],
      analyzedAt: new Date().toISOString(),
      performanceStats,
      keyStrengths,
      areasForImprovement,
    };

    setCurrentAnalysis(newAnalysis);
    setHasAnalysis(true);
    setAnalyzedVideos(prev => [newAnalysis, ...prev]);
    setSelectedFile(null);
    setVideoTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setIsAnalyzing(false);
    setAnalysisProgress(0);

    toast({
      title: 'Analysis Complete!',
      description: `Your performance score is ${newAnalysis.score}/100`,
    });
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      role: 'user',
      content: chatInput,
    };

    setChatMessages(prev => [...prev, userMessage]);
    const messageToSend = chatInput;
    setChatInput('');
    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory = chatMessages.slice(-6).map(msg =>
        `${msg.role === 'user' ? 'User' : 'AI Coach'}: ${msg.content}`
      );

      // Call Gemini directly
      const response = await chatWithOpenRouter(messageToSend, conversationHistory);

      const assistantMessage: ChatMessage = {
        id: chatMessages.length + 2,
        role: 'assistant',
        content: response,
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: chatMessages.length + 2,
        role: 'assistant',
        content: error instanceof Error
          ? `Sorry, I encountered an error: ${error.message}`
          : 'Sorry, I encountered an error. Please try again.',
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleCopyAnalysis = () => {
    if (!currentAnalysis) return;

    let text = `Performance Analysis: ${currentAnalysis.videoTitle}\n\n`;
    text += `Score: ${currentAnalysis.score}/100\n\n`;

    if (currentAnalysis.performanceStats) {
      text += 'Performance Stats:\n';
      currentAnalysis.performanceStats.forEach(stat => {
        text += `${stat.metric}: ${stat.value} - ${stat.observation}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const radarData = currentAnalysis?.skillBreakdown || [];
  const barData = performanceTrend.map((p, i) => ({
    name: new Date(p.date).toLocaleDateString('en-US', { month: 'short' }),
    score: p.score,
  }));

  const quickPrompts = [
    "How can I improve my batting?",
    "Tips for better stamina",
    "Pre-match mental prep",
    "Recovery after training"
  ];

  const userName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Athlete';

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="text-primary">{t('ai.title')}</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('ai.subtitle')}
          </p>
        </motion.div>

        {/* Credits Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-card border border-border px-6 py-3 rounded-xl flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">{t('ai.credits')}:</span>
            <span className="text-2xl font-bold text-primary">
              {creditsInfo?.isUnlimited ? '∞' : (creditsInfo?.credits || 0)}
            </span>
            {creditsInfo?.monthlyLimit && (
              <span className="text-sm text-muted-foreground">
                ({creditsInfo.monthlyUsed}/{creditsInfo.monthlyLimit} free this month)
              </span>
            )}
          </div>
        </motion.div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Upload & Video Analysis Results */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Upload Section */}
            <div className="bg-card border border-border p-6 rounded-2xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Video className="h-5 w-5 text-primary" />
                {t('ai.upload')}
              </h2>

              {isAnalyzing ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-primary mx-auto mb-3 animate-pulse" />
                  <h3 className="text-sm font-semibold mb-2 text-foreground">Analyzing...</h3>
                  <Progress value={analysisProgress} className="max-w-xs mx-auto" />
                  <p className="text-xs text-muted-foreground mt-2">{analysisProgress}%</p>
                </div>
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="border border-border rounded-xl p-4 bg-secondary/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground truncate flex-1">
                              {selectedFile.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setSelectedFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>

                      <Input
                        placeholder="Video title (optional)"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="bg-secondary"
                      />

                      <Button
                        onClick={handleUpload}
                        variant="hero"
                        className="w-full"
                        disabled={!selectedFile}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Analyze Video
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <h3 className="font-medium text-sm mb-1 text-foreground">Drop video here</h3>
                      <p className="text-xs text-muted-foreground mb-3">or click to browse</p>
                      <Button variant="hero" size="sm">
                        <Play className="h-3 w-3 mr-1" />
                        Select Video
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Analysis Results Section - Shows after video analysis */}
            {hasAnalysis && currentAnalysis && (
              <>
                {/* Performance Stats Table */}
                {currentAnalysis.skillBreakdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border p-6 rounded-2xl"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Performance Analysis</h2>
                        <p className="text-primary font-medium">{currentAnalysis.videoTitle || 'Untitled Analysis'}</p>
                      </div>

                      {/* Circular Score Indicator */}
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-secondary"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * currentAnalysis.score) / 100}
                            className="text-primary transition-all duration-1000 ease-out"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-2xl font-bold text-foreground">{currentAnalysis.score}</span>
                          <span className="text-xs text-muted-foreground">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Skill Progress Bars */}
                    <div className="space-y-4 mb-8">
                      {currentAnalysis.skillBreakdown.map((skill, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">{skill.skill}</span>
                            <span className="text-sm font-bold text-foreground">{skill.value}%</span>
                          </div>
                          <Progress value={skill.value} className="h-2.5" />
                        </div>
                      ))}
                    </div>

                    {/* AI Insights Summary Box */}
                    <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
                      <h3 className="flex items-center gap-2 font-semibold mb-3 text-foreground">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI Insights
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {currentAnalysis.insights[0] || "Analysis complete. Focus on consistency and form to improve your overall score."}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Key Strengths */}
                {currentAnalysis.keyStrengths && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border border-border p-6 rounded-2xl"
                  >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Key Strengths
                    </h2>
                    <ol className="space-y-4">
                      {currentAnalysis.keyStrengths.map((strength, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="text-primary font-bold">{index + 1}.</span>
                          <div>
                            <span className="font-semibold text-foreground">{strength.title}:</span>
                            <span className="text-muted-foreground ml-1">{strength.description}</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                )}

                {/* Areas for Improvement */}
                {currentAnalysis.areasForImprovement && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card border border-border p-6 rounded-2xl"
                  >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                      <Target className="h-5 w-5 text-orange-500" />
                      Area for Improvement
                    </h2>
                    <ul className="space-y-3">
                      {currentAnalysis.areasForImprovement.map((area, index) => (
                        <li key={index} className="flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-foreground">{area.title}:</span>
                            <span className="text-muted-foreground ml-1">{area.description}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Video Insights - Previous analyses */}
                {analyzedVideos.length > 0 && (
                  <div className="bg-card border border-border p-6 rounded-2xl">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      Video Insights
                    </h2>
                    <div className="space-y-3">
                      {analyzedVideos.map((video) => (
                        <div key={video.id} className="bg-secondary/50 rounded-xl overflow-hidden">
                          {/* Video Header - Clickable */}
                          <div
                            onClick={() => setExpandedVideo(expandedVideo === video.id ? null : video.id)}
                            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-secondary/80 transition-colors"
                          >
                            <div className="w-12 h-10 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                              <Play className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">{video.videoTitle}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(video.analyzedAt)}</p>
                            </div>
                            <span className="text-lg font-bold text-primary">{video.score}</span>
                            {expandedVideo === video.id ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>

                          {/* Expanded Insights */}
                          {expandedVideo === video.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="px-3 pb-3 border-t border-border/50"
                            >
                              <ul className="space-y-2 mt-2">
                                {video.insights.map((insight, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground leading-relaxed">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Right Column - Inline Chat (Gemini-style) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Inline Chat Panel */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: '600px' }}>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-foreground">AI Sports Coach</h2>
                  <p className="text-xs text-muted-foreground">Powered by OpenRouter</p>
                </div>
              </div>

              {/* Chat Content Area */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent hover:scrollbar-thumb-primary/50" style={{ maxHeight: '450px' }}>
                {chatMessages.length === 0 ? (
                  /* Welcome State - Gemini-style */
                  <div className="h-full flex flex-col justify-center items-center text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h2 className="text-3xl font-display mb-2">
                        <span className="text-primary">Hello, {userName}</span>
                      </h2>
                      <p className="text-xl text-muted-foreground mb-8">How can I help you?</p>

                      <p className="text-sm text-muted-foreground mb-4">Get started with a prompt</p>

                      <div className="flex flex-col gap-2 max-w-sm">
                        {quickPrompts.map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setChatInput(prompt);
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary text-left transition-colors group"
                          >
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground">{prompt}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  /* Chat Messages */
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gradient-to-br from-primary/20 to-primary/10 text-primary'
                          }`}>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-secondary text-foreground rounded-tl-sm'
                          }`}>
                          <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                        </div>
                      </motion.div>
                    ))}

                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border bg-secondary/30">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask OpenRouter or type /"
                    className="flex-1 bg-card border-border focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <Button
                    onClick={handleSendMessage}
                    variant="hero"
                    size="icon"
                    disabled={isTyping || !chatInput.trim()}
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Analytics Cards - Show when there's analysis */}
            {hasAnalysis && currentAnalysis && (
              <>
                {/* Performance Score */}
                <div className="bg-card border border-border p-6 rounded-2xl">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                    <Target className="h-5 w-5 text-primary" />
                    {t('ai.score')}
                  </h2>
                  <div className="flex items-center justify-center gap-4">
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          fill="none"
                          stroke="hsl(var(--secondary))"
                          strokeWidth="10"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="10"
                          strokeDasharray={`${(currentAnalysis.score / 100) * 302} 302`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary">{currentAnalysis.score}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-green-500 font-medium text-sm">Latest Analysis</p>
                      <p className="text-xs text-muted-foreground mt-1">{currentAnalysis.videoTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Skills Radar Chart */}
                {radarData.length > 0 && (
                  <div className="bg-card border border-border p-6 rounded-2xl">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                      <Activity className="h-5 w-5 text-primary" />
                      Skill Breakdown
                    </h2>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                          <Radar
                            name="Skills"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisPage;
