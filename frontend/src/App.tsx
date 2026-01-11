import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@/lib/i18n";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import EventsPage from "@/pages/EventsPage";
import AthletesPage from "@/pages/AthletesPage";
import PricingPage from "@/pages/PricingPage";
import AIAnalysisPage from "@/pages/AIAnalysisPage";
import ProfilePage from "@/pages/ProfilePage";
import CreatePage from "@/pages/CreatePage";
import ScoutPage from "@/pages/ScoutPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/athletes" element={<AthletesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/ai-analysis" element={<AIAnalysisPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/scout" element={<ScoutPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* Floating Google Translate Widget */}
            <div
              id="google_translate_element"
              style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                padding: '10px 15px',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
