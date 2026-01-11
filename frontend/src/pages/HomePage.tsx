import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Trophy, Users, Zap, Video, MapPin, BarChart3, UserSearch, Check, Star, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import athleonVideo from '@/assets/athleon-logo-video.mp4';
import athleonLogo from '@/assets/athleon-logo.jpeg';

// Primary color: #1CA6E6
const primaryColor = 'hsl(198,82%,51%)';

const features = [
  {
    icon: Video,
    title: 'AI Video Analysis',
    description: 'Upload your performance videos and get instant AI-powered insights on technique, form, and areas for improvement.',
    tag: 'Powered by AI',
  },
  {
    icon: MapPin,
    title: 'Discover Events',
    description: 'Find nearby sports events, tournaments, and training camps. Register and compete with athletes worldwide.',
    tag: 'Geo-based',
  },
  {
    icon: UserSearch,
    title: 'Scout Network',
    description: 'Connect with professional scouts and coaches. Get discovered based on your performance metrics.',
    tag: 'Networking',
  },
  {
    icon: BarChart3,
    title: 'Performance Tracking',
    description: 'Track your progress with detailed analytics. Compare stats across matches and monitor improvement.',
    tag: 'Analytics',
  },
];

const testimonials = [
  {
    name: 'Marcus Johnson',
    role: 'Professional Basketball Player',
    sport: 'Basketball',
    content: "Athleon Global's AI analysis helped me identify weaknesses in my shooting form that I never noticed. Within 3 months, my accuracy improved by 15%.",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 5,
  },
  {
    name: 'Sarah Chen',
    role: 'Olympic Swimmer',
    sport: 'Swimming',
    content: "The event discovery feature connected me with international competitions I would have never found otherwise. This platform is a game-changer.",
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    rating: 5,
  },
  {
    name: 'David Rodriguez',
    role: 'Soccer Coach',
    sport: 'Soccer',
    content: "As a scout, I can find talented athletes in my area instantly. The performance scores help me make data-driven decisions on recruitment.",
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    rating: 5,
  },
];

const performanceStats = [
  { skill: 'Speed', value: 92, color: 'bg-[#1CA6E6]' },
  { skill: 'Accuracy', value: 87, color: 'bg-emerald-500' },
  { skill: 'Endurance', value: 78, color: 'bg-[#1CA6E6]' },
  { skill: 'Technique', value: 95, color: 'bg-emerald-500' },
];

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[hsl(220,20%,4%)]">
        <video src={athleonVideo} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,20%,4%)]/60 via-[hsl(220,20%,4%)]/40 to-[hsl(220,20%,4%)]" />
      </div>
      <div className="relative z-10 container mx-auto px-4 text-center flex flex-col justify-center h-full pt-16">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 bg-[hsla(220,18%,12%,0.6)] backdrop-blur-xl border border-[hsla(220,15%,25%,0.5)] px-4 py-1.5 rounded-full mb-4 mx-auto">
          <span className="w-2 h-2 rounded-full bg-[#1CA6E6] animate-pulse" />
          <span className="text-xs font-medium text-[hsl(220,10%,55%)]">The Future of Sports Networking</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-3xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-3 text-white">
          <span>Connect. Compete.</span><br /><span className="text-[#1CA6E6]">Conquer.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="text-sm md:text-base text-[hsl(220,10%,55%)] mb-6 max-w-xl mx-auto font-montserrat">{t('hero.subtitle')}</motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link to="/auth?mode=signup"><Button variant="hero" size="lg" className="w-full sm:w-auto group bg-[#1CA6E6] hover:bg-[#1CA6E6]/90">{t('hero.getStarted')}<ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button></Link>
          <Link to="/auth"><Button variant="outline" size="lg" className="w-full sm:w-auto border-[hsl(220,15%,25%)] text-white hover:bg-[hsl(220,15%,15%)]"><Play className="h-4 w-4 mr-2" />Watch Demo</Button></Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }} className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[{ icon: Users, value: '50K+', label: 'Athletes' }, { icon: Trophy, value: '10K+', label: 'Events' }, { icon: Zap, value: '1M+', label: 'AI Analyses' }].map((stat) => (
            <div key={stat.label} className="bg-[hsla(220,18%,12%,0.6)] backdrop-blur-xl border border-[hsla(220,15%,25%,0.5)] p-4 rounded-xl">
              <stat.icon className="h-6 w-6 text-[#1CA6E6] mx-auto mb-2" />
              <p className="text-xl md:text-2xl font-bold text-white font-display">{stat.value}</p>
              <p className="text-xs text-[hsl(220,10%,55%)]">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const FeaturesSection: React.FC = () => (
  <section className="py-24 bg-gradient-to-b from-[hsl(220,20%,4%)] to-[hsl(220,18%,8%)]">
    <div className="container mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <span className="inline-block bg-[#1CA6E6] text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6 font-display">Platform Features</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">Everything You Need to <span className="text-[#1CA6E6]">Elevate Your Game</span></h2>
        <p className="text-[hsl(220,10%,55%)] max-w-2xl mx-auto">From AI-powered performance analysis to global event discovery, Athleon Global has everything athletes need to succeed.</p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-[hsla(220,18%,12%,0.6)] backdrop-blur-xl border border-[hsla(220,15%,25%,0.5)] p-8 rounded-2xl hover:border-[#1CA6E6]/50 transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-[#1CA6E6] flex items-center justify-center mb-6">
              <feature.icon className="h-7 w-7 text-white" />
            </div>
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 bg-[#1CA6E6]/10 text-[#1CA6E6]">{feature.tag}</span>
            <h3 className="text-xl font-display font-bold mb-3 text-white">{feature.title}</h3>
            <p className="text-[hsl(220,10%,55%)]">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const PerformanceSection: React.FC = () => (
  <section className="py-24 bg-[hsl(220,18%,8%)]">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="inline-block bg-[#1CA6E6]/10 text-[#1CA6E6] text-sm font-semibold px-4 py-1.5 rounded-full mb-6 font-display">AI-Powered Insights</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">Get Detailed <span className="text-[#1CA6E6]">Performance Analysis</span></h2>
          <p className="text-[hsl(220,10%,55%)] mb-8">Our AI analyzes your performance videos and provides actionable insights to help you improve faster.</p>

          <div className="bg-[hsla(220,18%,12%,0.8)] backdrop-blur-xl border border-[hsla(220,15%,25%,0.5)] p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-white">Performance Analysis</h3>
                <p className="text-sm text-[#1CA6E6]">Basketball - 3-Point Shooting</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-[#1CA6E6] flex items-center justify-center">
                <span className="text-white font-bold">88</span>
                <span className="text-white/70 text-xs">/100</span>
              </div>
            </div>

            <div className="space-y-4">
              {performanceStats.map((stat) => (
                <div key={stat.skill}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-white">{stat.skill}</span>
                    <span className="text-sm font-semibold text-white">{stat.value}%</span>
                  </div>
                  <div className="h-2 bg-[hsl(220,15%,20%)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stat.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full ${stat.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-[hsl(220,15%,15%)] rounded-xl border border-[hsla(220,15%,25%,0.5)]">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-[#1CA6E6]" />
                <span className="font-display font-semibold text-white">AI Insights</span>
              </div>
              <p className="text-sm text-[hsl(220,10%,55%)]">Excellent shooting form with consistent release point. Focus on follow-through mechanics to improve accuracy under pressure.</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#1CA6E6] to-[hsl(205,80%,40%)] p-8 flex items-center justify-center">
            <div className="text-center text-white">
              <BarChart3 className="h-24 w-24 mx-auto mb-6 opacity-90" />
              <h3 className="text-2xl font-display font-bold mb-2">1M+ Analyses</h3>
              <p className="opacity-80">Performance videos analyzed by our AI</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const TestimonialsSection: React.FC = () => (
  <section className="py-24 bg-gradient-to-b from-[hsl(220,18%,8%)] to-[hsl(215,25%,10%)]">
    <div className="container mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <span className="inline-block bg-[#1CA6E6] text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6 font-display">Success Stories</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">Trusted by Athletes <span className="text-[#1CA6E6]">Worldwide</span></h2>
        <p className="text-[hsl(220,10%,55%)] max-w-2xl mx-auto">See how Athleon Global is transforming careers across all sports.</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div key={testimonial.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-[hsla(220,20%,15%,0.6)] backdrop-blur-xl border border-[hsla(220,15%,25%,0.5)] p-8 rounded-2xl">
            <Quote className="h-10 w-10 text-[#1CA6E6] mb-6" />
            <p className="text-[hsl(220,10%,70%)] mb-6 leading-relaxed">"{testimonial.content}"</p>

            <div className="flex items-center gap-1 mb-6">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="h-5 w-5 text-[#1CA6E6] fill-[#1CA6E6]" />
              ))}
            </div>

            <div className="flex items-center gap-4">
              <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-display font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-[hsl(220,10%,55%)]">{testimonial.role}</p>
                <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-[#1CA6E6] text-white mt-1">{testimonial.sport}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const CTASection: React.FC = () => (
  <section className="py-24 bg-gradient-to-b from-[hsl(215,25%,10%)] to-[hsl(220,20%,4%)]">
    <div className="container mx-auto px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 bg-[hsla(220,18%,20%,0.6)] backdrop-blur-xl border border-[hsla(220,15%,30%,0.5)] px-4 py-1.5 rounded-full mb-8">
          <Zap className="h-4 w-4 text-[#1CA6E6]" />
          <span className="text-sm font-semibold text-white font-display">Join 50,000+ Athletes Today</span>
        </span>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-white">Ready to Take Your Athletic Career to the <span className="text-[#1CA6E6]">Next Level?</span></h2>
        <p className="text-[hsl(220,10%,55%)] mb-10 text-lg max-w-xl mx-auto">Create your free profile today and unlock AI-powered insights, connect with scouts, and discover events near you.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link to="/auth?mode=signup">
            <Button size="xl" className="bg-[#1CA6E6] hover:bg-[#1CA6E6]/90 text-white group font-display font-semibold">
              Create Free Account
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="xl" variant="outline" className="border-[#1CA6E6] text-[#1CA6E6] hover:bg-[#1CA6E6]/10 font-display font-semibold">
              Talk to Sales
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[hsl(220,10%,55%)]">
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#1CA6E6]" /> No credit card required</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#1CA6E6]" /> Free forever plan</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#1CA6E6]" /> Cancel anytime</span>
        </div>
      </motion.div>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer className="py-12 bg-[hsl(220,20%,4%)] border-t border-[hsla(220,15%,25%,0.5)]">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <img src={athleonLogo} alt="Athleon" className="h-8 w-8 rounded-full" />
          <span className="font-display font-bold text-[#1CA6E6]">ATHLEON GLOBAL</span>
        </div>
        <p className="text-sm text-[hsl(220,10%,55%)]">© 2026 Athleon Global. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const HomePage: React.FC = () => (
  <div className="overflow-x-hidden bg-[hsl(220,20%,4%)]">
    <HeroSection />
    <FeaturesSection />
    <PerformanceSection />
    <TestimonialsSection />
    <CTASection />
    <Footer />
  </div>
);

export default HomePage;
