import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Menu, X, Globe, User, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import athleonLogo from '@/assets/athleon-logo.jpeg';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en', name: 'English' }, { code: 'hi', name: 'हिंदी' }, { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' }, { code: 'mr', name: 'मराठी' }, { code: 'kn', name: 'ಕನ್ನಡ' },
];

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      setIsScrolled(window.scrollY > heroHeight - 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/';
  // Homepage: dark navbar at top, themed when scrolled. Other pages: always themed based on dark/light mode.
  const showThemedNav = isHomePage ? isScrolled : true;

  // Role-specific navigation
  const getNavLinks = () => {
    if (!isAuthenticated) return [{ path: '/', label: t('nav.home') }];

    const baseLinks = [{ path: '/dashboard', label: t('nav.home') }];

    switch (user?.role) {
      case 'organizer':
        return [...baseLinks, { path: '/events', label: t('nav.events') }, { path: '/profile', label: t('nav.profile') }];
      case 'coach':
        return [...baseLinks, { path: '/scout', label: 'Scout' }, { path: '/athletes', label: 'Athletes' }, { path: '/profile', label: t('nav.profile') }];
      case 'creator':
        return [...baseLinks, { path: '/events', label: t('nav.events') }, { path: '/create', label: 'Create' }, { path: '/profile', label: t('nav.profile') }];
      case 'viewer':
        return [...baseLinks, { path: '/athletes', label: 'Athletes' }, { path: '/events', label: t('nav.events') }, { path: '/profile', label: t('nav.profile') }];
      case 'athlete':
      default:
        return [...baseLinks, { path: '/ai-analysis', label: t('nav.aiAnalysis') }, { path: '/athletes', label: 'Athletes' }, { path: '/events', label: t('nav.events') }, { path: '/pricing', label: t('nav.pricing') }, { path: '/profile', label: t('nav.profile') }];
    }
  };


  const navLinks = getNavLinks();
  const changeLanguage = (code: string) => i18n.changeLanguage(code);

  // Get navbar background class based on theme and page
  const getNavbarBgClass = () => {
    if (!showThemedNav) {
      // Homepage hero section - always dark
      return 'bg-[hsla(220,18%,8%,0.85)] backdrop-blur-xl border-b border-[hsla(220,15%,25%,0.5)]';
    }
    // Internal pages or scrolled on homepage - respect dark/light mode
    return 'bg-background/95 backdrop-blur-xl border-b border-border shadow-sm';
  };

  // Get text color class based on theme and page
  const getTextClass = (isActive: boolean) => {
    if (isActive) return 'text-[hsl(200,100%,50%)]';
    if (!showThemedNav) return 'text-[hsl(220,10%,55%)] hover:text-white';
    return 'text-muted-foreground hover:text-foreground';
  };

  const getIconClass = () => {
    if (!showThemedNav) return 'text-white hover:text-[hsl(200,100%,50%)]';
    return 'text-foreground hover:text-[hsl(200,100%,50%)]';
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getNavbarBgClass()}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3">
            <img src={athleonLogo} alt="Athleon Global" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-helvetica text-xl font-bold text-[hsl(200,100%,50%)]">ATHLEON GLOBAL</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`text-sm font-medium transition-colors ${getTextClass(location.pathname === link.path)}`}>{link.label}</Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={getIconClass()}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={getIconClass()}><Globe className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border-border">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={i18n.language === lang.code ? 'bg-primary/10' : ''}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`flex items-center gap-2 ${getIconClass()}`}><User className="h-5 w-5" /><span className="text-sm">{user?.name?.split(' ')[0]}</span></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border-border">
                  <DropdownMenuItem asChild><Link to="/profile" className="flex items-center gap-2"><User className="h-4 w-4" />{t('nav.profile')}</Link></DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive"><LogOut className="h-4 w-4" />{t('nav.logout')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth"><Button variant="ghost" className={getIconClass()}>{t('nav.login')}</Button></Link>
                <Link to="/auth?mode=signup"><Button variant="hero">{t('nav.signup')}</Button></Link>
              </div>
            )}
          </div>

          <Button variant="ghost" size="icon" className={`md:hidden ${getIconClass()}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (<Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-medium py-2 ${getTextClass(location.pathname === link.path)}`}>{link.label}</Link>))}
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}><Button variant="outline" className="w-full">{t('nav.login')}</Button></Link>
                  <Link to="/auth?mode=signup" onClick={() => setIsMobileMenuOpen(false)}><Button variant="hero" className="w-full">{t('nav.signup')}</Button></Link>
                </div>
              )}
              {isAuthenticated && (<Button variant="ghost" onClick={logout} className="justify-start text-destructive"><LogOut className="h-4 w-4 mr-2" />{t('nav.logout')}</Button>)}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;

