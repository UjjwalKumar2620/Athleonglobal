import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Calendar, TrendingUp, Zap, Users, Star, Plus, UserSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { delhiEvents } from '@/data/events';
import StarRating from '@/components/StarRating';
import FamousAthletes from '@/components/FamousAthletes';

const AthleteDashboard: React.FC<{ user: any }> = ({ user }) => {
  const quickActions = [
    { icon: TrendingUp, label: 'AI Analysis', path: '/ai-analysis', color: 'text-primary' },
    { icon: Calendar, label: 'Events', path: '/events', color: 'text-green-500' },
    { icon: Users, label: 'Network', path: '/profile', color: 'text-purple-500' },
    { icon: Trophy, label: 'Achievements', path: '/profile', color: 'text-amber-500' },
  ];

  const stats = [
    { label: 'AI Credits', value: user?.credits || 20, icon: Zap },
    { label: 'Followers', value: user?.followers || 0, icon: Users },
    { label: 'Events Joined', value: 3, icon: Calendar },
    { label: 'Ranking', value: '#124', icon: Star },
  ];

  return (
    <>
      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.path}>
              <div className="bg-card border border-border p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center">
                <action.icon className={`h-8 w-8 mx-auto mb-3 ${action.color}`} />
                <p className="font-medium text-foreground">{action.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Upcoming Events</h3>
            <Link to="/events"><Button variant="ghost" size="sm">View All</Button></Link>
          </div>
          <div className="space-y-4">
            {delhiEvents.slice(0, 2).map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">Registered</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Performance Summary</h3>
            <Link to="/ai-analysis"><Button variant="ghost" size="sm">Analyze More</Button></Link>
          </div>
          <div className="text-center py-8">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full border-8 border-primary/30 flex items-center justify-center relative">
              <span className="text-4xl font-bold text-primary">78</span>
            </div>
            <p className="font-medium text-foreground">Overall Performance Score</p>
            <p className="text-sm text-muted-foreground mt-1">Based on your last 5 video analyses</p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const OrganizerDashboard: React.FC<{ user: any }> = ({ user }) => {
  const stats = [
    { label: 'Events Hosted', value: 4, icon: Calendar },
    { label: 'Total Attendees', value: '1.2K', icon: Users },
    { label: 'Avg Rating', value: '4.6', icon: Star },
    { label: 'Revenue', value: '₹45K', icon: Trophy },
  ];

  const myEvents = delhiEvents.slice(0, 3);

  return (
    <>
      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/events">
            <div className="bg-card border border-border p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center">
              <Plus className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="font-medium text-foreground">Host an Event</p>
            </div>
          </Link>
          <Link to="/events">
            <div className="bg-card border border-border p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center">
              <Calendar className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <p className="font-medium text-foreground">View My Events</p>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* My Events */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">My Events</h2>
          <Link to="/events"><Button variant="ghost" size="sm">View All</Button></Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {myEvents.map((event) => (
            <div key={event.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <img src={event.image} alt={event.title} className="w-full h-32 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1">{event.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={event.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">({event.reviewCount})</span>
                </div>
                <p className="text-sm text-muted-foreground">{event.spotsAvailable} / {event.totalSpots} spots</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

const CoachDashboard: React.FC<{ user: any }> = ({ user }) => {
  const stats = [
    { label: 'Athletes Viewed', value: 28, icon: Users },
    { label: 'Contacts Made', value: 12, icon: Star },
    { label: 'Sports', value: 3, icon: Trophy },
    { label: 'Saved Profiles', value: 8, icon: UserSearch },
  ];

  return (
    <>
      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/athletes">
            <div className="bg-card border border-border p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center">
              <UserSearch className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="font-medium text-foreground">Discover Athletes</p>
            </div>
          </Link>
          <Link to="/profile">
            <div className="bg-card border border-border p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <p className="font-medium text-foreground">My Contacts</p>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* CTA to Athletes */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-r from-primary to-accent p-8 rounded-2xl text-center">
        <h2 className="text-2xl font-bold mb-2 text-primary-foreground">Find Your Next Star Athlete</h2>
        <p className="text-primary-foreground/80 mb-6">Browse profiles, view performance stats, and connect with talented athletes</p>
        <Link to="/athletes">
          <Button size="lg" variant="secondary">
            <UserSearch className="h-5 w-5 mr-2" />
            Browse Athletes
          </Button>
        </Link>
      </motion.div>
    </>
  );
};

const CreatorDashboard: React.FC<{ user: any }> = ({ user }) => {
  const stats = [
    { label: 'Videos', value: 4, icon: TrendingUp },
    { label: 'Total Views', value: '97.7K', icon: Users },
    { label: 'Followers', value: '2.5K', icon: Star },
    { label: 'Avg Rating', value: '4.8', icon: Trophy },
  ];

  return (
    <>
      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/create">
            <div className="bg-card border border-border p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center">
              <Plus className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="font-medium text-foreground">Create Video</p>
            </div>
          </Link>
          <Link to="/events">
            <div className="bg-card border border-border p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center">
              <Calendar className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <p className="font-medium text-foreground">View Events</p>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* CTA to Create */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-r from-primary to-accent p-8 rounded-2xl text-center">
        <h2 className="text-2xl font-bold mb-2 text-primary-foreground">Share Your Sports Knowledge</h2>
        <p className="text-primary-foreground/80 mb-6">Create training videos and help athletes improve their game</p>
        <Link to="/create">
          <Button size="lg" variant="secondary">
            <Plus className="h-5 w-5 mr-2" />
            Create Content
          </Button>
        </Link>
      </motion.div>
    </>
  );
};

const ViewerDashboard: React.FC<{ user: any }> = ({ user }) => {
  const stats = [
    { label: 'Athletes Followed', value: 12, icon: Users },
    { label: 'Events Watched', value: 5, icon: Calendar },
    { label: 'Videos Viewed', value: 42, icon: TrendingUp },
    { label: 'Favorites', value: 8, icon: Star },
  ];

  return (
    <>
      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/athletes">
            <div className="bg-card border border-border p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="font-medium text-foreground">Discover Athletes</p>
            </div>
          </Link>
          <Link to="/events">
            <div className="bg-card border border-border p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center">
              <Calendar className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <p className="font-medium text-foreground">Browse Events</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'organizer':
        return <OrganizerDashboard user={user} />;
      case 'coach':
        return <CoachDashboard user={user} />;
      case 'creator':
        return <CreatorDashboard user={user} />;
      case 'viewer':
        return <ViewerDashboard user={user} />;
      default:
        return <AthleteDashboard user={user} />;
    }
  };

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'organizer':
        return 'Manage your events and grow your audience';
      case 'coach':
        return 'Discover talented athletes for your team';
      case 'creator':
        return 'Share your sports knowledge with the world';
      case 'viewer':
        return 'Explore athletes and events you love';
      default:
        return 'Ready to elevate your game today?';
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 text-foreground">
            Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || 'Champion'}</span>!
          </h1>
          <p className="text-muted-foreground">{getWelcomeMessage()}</p>
        </motion.div>

        {/* Famous Athletes Section - For All Users */}
        <FamousAthletes />

        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
