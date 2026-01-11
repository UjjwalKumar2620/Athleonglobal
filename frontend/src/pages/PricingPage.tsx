import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, Star, Zap, Trophy, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  icon: React.ElementType;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  color: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    icon: Star,
    price: 0,
    period: 'forever',
    description: 'Get started with basic features',
    color: 'from-gray-500 to-gray-600',
    features: [
      { text: 'Basic profile creation', included: true },
      { text: '2 AI video analyses per month', included: true },
      { text: 'Browse and join free events', included: true },
      { text: 'Basic performance stats', included: true },
      { text: 'Unlimited AI analysis', included: false },
      { text: 'Profile analytics', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    id: 'athlete_pro',
    name: 'Athlete Pro',
    icon: Trophy,
    price: 249,
    period: 'month',
    description: 'For serious athletes looking to improve',
    color: 'from-primary to-accent',
    popular: true,
    features: [
      { text: 'Enhanced profile with video portfolio', included: true },
      { text: 'Unlimited AI video analyses', included: true },
      { text: 'Advanced performance insights', included: true },
      { text: 'Profile analytics (views, engagement)', included: true },
      { text: 'Featured profile in search', included: true },
      { text: 'Priority event registration', included: true },
      { text: 'AI Coach chatbot access', included: true },
    ],
  },
  {
    id: 'organizer_pro',
    name: 'Organizer Pro',
    icon: Calendar,
    price: 699,
    period: 'month',
    description: 'For event organizers and clubs',
    color: 'from-green-500 to-emerald-600',
    features: [
      { text: 'Unlimited event creation', included: true },
      { text: 'Paid event hosting (reduced commission)', included: true },
      { text: 'Event analytics and reporting', included: true },
      { text: 'Bulk athlete messaging', included: true },
      { text: 'Featured event placement', included: true },
      { text: 'Custom branding options', included: true },
      { text: 'Priority support', included: true },
    ],
  },
  {
    id: 'coach_pro',
    name: 'Coach Pro',
    icon: Users,
    price: 999,
    period: 'month',
    description: 'For coaches and scouts',
    color: 'from-purple-500 to-violet-600',
    features: [
      { text: 'Advanced athlete search filters', included: true },
      { text: 'Access to top-ranked players', included: true },
      { text: 'Direct contact with athletes', included: true },
      { text: 'Video analysis comparison tools', included: true },
      { text: 'Bulk player analytics', included: true },
      { text: 'Talent pipeline management', included: true },
      { text: 'Premium support', included: true },
    ],
  },
];

const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = (plan: Plan) => {
    if (plan.price === 0) {
      toast({
        title: 'Free Plan',
        description: "You're already on the free plan!",
      });
      return;
    }
    
    toast({
      title: 'Redirecting to Payment',
      description: `Processing subscription for ${plan.name}...`,
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="gradient-text">{t('pricing.title')}</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            {t('pricing.subtitle')}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 glass-card p-1 rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('pricing.yearly')}
              <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Save 20%</span>
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative glass-card rounded-2xl overflow-hidden ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent py-1 text-center">
                  <span className="text-xs font-semibold text-primary-foreground">MOST POPULAR</span>
                </div>
              )}
              
              <div className={`p-6 ${plan.popular ? 'pt-10' : ''}`}>
                {/* Plan Header */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <plan.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ₹{billingPeriod === 'yearly' ? Math.round(plan.price * 0.8) : plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        feature.included ? 'bg-green-500/20' : 'bg-secondary'
                      }`}>
                        <Check className={`h-3 w-3 ${
                          feature.included ? 'text-green-400' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <span className={`text-sm ${
                        feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  variant={plan.popular ? 'hero' : 'outline'}
                  className="w-full"
                  onClick={() => handleSubscribe(plan)}
                >
                  {user?.subscription === plan.id ? t('pricing.currentPlan') : t('pricing.subscribe')}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Credits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="glass-card p-8 rounded-2xl text-center">
            <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Need More AI Credits?</h3>
            <p className="text-muted-foreground mb-6">
              Purchase additional AI credits for video analysis. Credits never expire!
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { credits: 10, price: 99 },
                { credits: 25, price: 199 },
                { credits: 50, price: 349 },
              ].map((pack) => (
                <button
                  key={pack.credits}
                  onClick={() => toast({ title: 'Purchasing Credits', description: `Redirecting to payment for ${pack.credits} credits...` })}
                  className="glass-card p-4 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <p className="text-2xl font-bold text-primary">{pack.credits}</p>
                  <p className="text-xs text-muted-foreground mb-2">credits</p>
                  <p className="font-semibold">₹{pack.price}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
