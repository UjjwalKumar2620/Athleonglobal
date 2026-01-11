import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Trophy, Video, MessageSquare, Edit, Star, Calendar, Mail, Phone, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import StarRating from '@/components/StarRating';
import { delhiEvents } from '@/data/events';
import { sampleAthletes } from '@/data/athletes';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const radarData = [
  { skill: 'Speed', value: 85 }, { skill: 'Technique', value: 78 }, { skill: 'Endurance', value: 72 },
  { skill: 'Accuracy', value: 88 }, { skill: 'Power', value: 80 }, { skill: 'Agility', value: 75 },
];
const barData = [
  { name: 'Batting', value: 82 }, { name: 'Bowling', value: 65 }, { name: 'Fielding', value: 78 }, { name: 'Fitness', value: 85 },
];

// Mock past events for organizer
const pastEvents = delhiEvents.slice(0, 4).map((e, i) => ({
  ...e,
  status: i < 2 ? 'completed' : 'upcoming',
}));

const AthleteProfile: React.FC<{ user: any }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'videos' | 'chat'>('stats');

  return (
    <>
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-6 rounded-2xl mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-primary-foreground">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-1 text-foreground">{user?.name || 'Ujjwal Sharma'}</h1>
            <p className="text-primary font-medium mb-2 capitalize">{user?.role || 'Athlete'} • Cricket</p>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Delhi, India</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {user?.followers || 2450} followers</span>
            </div>
            <p className="text-muted-foreground max-w-lg">Passionate cricketer with 8+ years of experience. Captain of Delhi Premier League team.</p>
          </div>
          <Button variant="outline"><Edit className="h-4 w-4 mr-2" /> Edit Profile</Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ id: 'stats', icon: Trophy, label: 'Stats' }, { id: 'videos', icon: Video, label: 'Videos' }, { id: 'chat', icon: MessageSquare, label: 'AI Coach' }].map((tab) => (
          <Button key={tab.id} variant={activeTab === tab.id ? 'default' : 'ghost'} onClick={() => setActiveTab(tab.id as any)}>
            <tab.icon className="h-4 w-4 mr-2" />{tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'stats' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-foreground">Skill Radar</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-foreground">Sport Skills</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={70} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="grid md:grid-cols-3 gap-4">
          {['Batting Masterclass', 'Bowling Techniques', 'Fielding Drills'].map((title, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-video bg-secondary flex items-center justify-center"><Video className="h-12 w-12 text-muted-foreground" /></div>
              <div className="p-4"><h4 className="font-medium text-foreground">{title}</h4><p className="text-sm text-muted-foreground">12k views</p></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="bg-card border border-border p-6 rounded-2xl max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"><Star className="h-5 w-5 text-primary-foreground" /></div>
            <div><h3 className="font-semibold text-foreground">AI Coach</h3><p className="text-xs text-muted-foreground">Your personal performance assistant</p></div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-foreground">Hi {user?.name?.split(' ')[0]}! Based on your recent video analysis, I recommend focusing on your footwork. Your batting stance is solid but quicker feet will help against pace bowling. Want me to suggest some drills?</p>
          </div>
          <div className="flex gap-2">
            <input placeholder="Ask your AI Coach..." className="flex-1 bg-secondary border-none rounded-lg px-4 py-2 text-sm text-foreground" />
            <Button>Send</Button>
          </div>
        </div>
      )}
    </>
  );
};

const OrganizerProfile: React.FC<{ user: any }> = ({ user }) => {
  const [userEvents, setUserEvents] = React.useState<any[]>([]);
  const [cancelConfirmEvent, setCancelConfirmEvent] = React.useState<any>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('athleon_user_events');
      if (stored) {
        const events = JSON.parse(stored);
        setUserEvents(events.filter((e: any) => e.organizerId === user?.id));
      }
    } catch {
      setUserEvents([]);
    }
  }, [user?.id]);

  const handleCancelEvent = (event: any) => {
    try {
      const allEvents = JSON.parse(localStorage.getItem('athleon_user_events') || '[]');
      const updatedEvents = allEvents.filter((e: any) => e.id !== event.id);
      localStorage.setItem('athleon_user_events', JSON.stringify(updatedEvents));
      setUserEvents(updatedEvents.filter((e: any) => e.organizerId === user?.id));
      setCancelConfirmEvent(null);
    } catch {
      console.error('Failed to cancel event');
    }
  };

  const allDisplayEvents = userEvents.length > 0
    ? userEvents.map((e, i) => ({ ...e, status: 'upcoming' as const }))
    : pastEvents;

  return (
    <>
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-6 rounded-2xl mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-primary-foreground">
            {user?.name?.charAt(0) || 'O'}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-1 text-foreground">{user?.name || 'Event Organizer'}</h1>
            <p className="text-primary font-medium mb-2 flex items-center justify-center md:justify-start gap-2">
              <Award className="h-4 w-4" /> Professional Event Host
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Delhi, India</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {userEvents.length || pastEvents.length} Events Hosted</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <StarRating rating={4.6} />
              <span className="text-sm text-muted-foreground">(128 reviews)</span>
            </div>
            <p className="text-muted-foreground max-w-lg">Experienced sports event organizer with expertise in cricket and football tournaments. Successfully hosted 50+ events across Delhi NCR.</p>
          </div>
          <Button variant="outline"><Edit className="h-4 w-4 mr-2" /> Edit Profile</Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Events Hosted', value: userEvents.length || pastEvents.length, icon: Calendar },
          { label: 'Total Attendees', value: '5.2K', icon: Users },
          { label: 'Avg Rating', value: '4.6', icon: Star },
          { label: 'Reviews', value: '128', icon: MessageSquare },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* My Events */}
      <h2 className="text-xl font-semibold mb-4 text-foreground">My Events</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {allDisplayEvents.map((event) => (
          <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-4 rounded-xl flex gap-4">
            <img src={event.image} alt={event.title} className="w-24 h-24 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground">{event.title}</h3>
                <span className={`text-xs px-2 py-1 rounded ${event.status === 'completed' ? 'bg-green-500/20 text-green-600' : 'bg-amber-500/20 text-amber-600'}`}>
                  {event.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={event.rating || 0} size="sm" />
                <span className="text-xs text-muted-foreground">({event.reviewCount || 0})</span>
              </div>
              <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p className="text-sm text-muted-foreground">{event.totalSpots} spots</p>
              {event.organizerId === user?.id && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={() => setCancelConfirmEvent(event)}
                >
                  Cancel Event
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cancel Confirmation */}
      {cancelConfirmEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="font-semibold text-foreground mb-2">Cancel Event</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to cancel "{cancelConfirmEvent.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCancelConfirmEvent(null)}>Keep Event</Button>
              <Button variant="destructive" onClick={() => handleCancelEvent(cancelConfirmEvent)}>Cancel Event</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const CoachProfile: React.FC<{ user: any }> = ({ user }) => {
  const featuredAthletes = sampleAthletes.slice(0, 3);

  return (
    <>
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-6 rounded-2xl mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-primary-foreground">
            {user?.name?.charAt(0) || 'C'}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-1 text-foreground">{user?.name || 'Coach/Scout'}</h1>
            <p className="text-primary font-medium mb-2 capitalize">{user?.role} • Sports Scout</p>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Delhi, India</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> 45 Athletes Scouted</span>
            </div>
            <p className="text-muted-foreground max-w-lg">Experienced sports scout with 10+ years in talent identification. Specializing in cricket and football.</p>
          </div>
          <Button variant="outline"><Edit className="h-4 w-4 mr-2" /> Edit Profile</Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Athletes Scouted', value: '45', icon: Users },
          { label: 'Active Contacts', value: '28', icon: Phone },
          { label: 'Sports', value: '3', icon: Trophy },
          { label: 'Success Rate', value: '85%', icon: Award },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recently Contacted Athletes */}
      <h2 className="text-xl font-semibold mb-4 text-foreground">Recently Contacted Athletes</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {featuredAthletes.map((athlete) => (
          <div key={athlete.id} className="bg-card border border-border p-4 rounded-xl">
            <div className="flex items-center gap-4 mb-3">
              <img src={athlete.avatar} alt={athlete.name} className="w-14 h-14 rounded-full object-cover" />
              <div>
                <h3 className="font-semibold text-foreground">{athlete.name}</h3>
                <p className="text-sm text-primary">{athlete.sport}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Mail className="h-4 w-4" />
              <span>{athlete.email}</span>
            </div>
            <Button variant="outline" className="w-full" size="sm">View Profile</Button>
          </div>
        ))}
      </div>
    </>
  );
};

const CreatorProfile: React.FC<{ user: any }> = ({ user }) => (
  <>
    {/* Profile Header */}
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-6 rounded-2xl mb-8">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-primary-foreground">
          {user?.name?.charAt(0) || 'C'}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold mb-1 text-foreground">{user?.name || 'Content Creator'}</h1>
          <p className="text-primary font-medium mb-2 flex items-center justify-center md:justify-start gap-2">
            <Video className="h-4 w-4" /> Content Creator
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Delhi, India</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> 2.5K followers</span>
          </div>
          <p className="text-muted-foreground max-w-lg">Sports content creator sharing training tips, match highlights, and athlete stories.</p>
        </div>
        <Button variant="outline"><Edit className="h-4 w-4 mr-2" /> Edit Profile</Button>
      </div>
    </motion.div>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Videos Created', value: '24', icon: Video },
        { label: 'Total Views', value: '97.7K', icon: Users },
        { label: 'Followers', value: '2.5K', icon: Star },
        { label: 'Avg Rating', value: '4.8', icon: Trophy },
      ].map((stat) => (
        <div key={stat.label} className="bg-card border border-border p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <stat.icon className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>

    {/* Recent Videos */}
    <h2 className="text-xl font-semibold mb-4 text-foreground">My Videos</h2>
    <div className="grid md:grid-cols-3 gap-6">
      {['Training Tips Vol. 1', 'Match Highlights', 'Athlete Interview'].map((title, i) => (
        <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="aspect-video bg-secondary flex items-center justify-center"><Video className="h-12 w-12 text-muted-foreground" /></div>
          <div className="p-4">
            <h4 className="font-medium text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{(i + 1) * 12}k views</p>
          </div>
        </div>
      ))}
    </div>
  </>
);

const ViewerProfile: React.FC<{ user: any }> = ({ user }) => (
  <>
    {/* Profile Header */}
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-6 rounded-2xl mb-8">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-primary-foreground">
          {user?.name?.charAt(0) || 'V'}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold mb-1 text-foreground">{user?.name || 'Sports Fan'}</h1>
          <p className="text-primary font-medium mb-2 flex items-center justify-center md:justify-start gap-2">
            <Users className="h-4 w-4" /> Sports Enthusiast
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Delhi, India</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Member since 2024</span>
          </div>
          <p className="text-muted-foreground max-w-lg">Passionate sports fan following athletes and events.</p>
        </div>
        <Button variant="outline"><Edit className="h-4 w-4 mr-2" /> Edit Profile</Button>
      </div>
    </motion.div>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Athletes Followed', value: '12', icon: Users },
        { label: 'Events Watched', value: '8', icon: Calendar },
        { label: 'Videos Viewed', value: '156', icon: Video },
        { label: 'Favorites', value: '24', icon: Star },
      ].map((stat) => (
        <div key={stat.label} className="bg-card border border-border p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <stat.icon className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>

    {/* Followed Athletes */}
    <h2 className="text-xl font-semibold mb-4 text-foreground">Athletes You Follow</h2>
    <div className="grid md:grid-cols-3 gap-6">
      {sampleAthletes.slice(0, 3).map((athlete) => (
        <div key={athlete.id} className="bg-card border border-border p-4 rounded-xl">
          <div className="flex items-center gap-4 mb-3">
            <img src={athlete.avatar} alt={athlete.name} className="w-14 h-14 rounded-full object-cover" />
            <div>
              <h3 className="font-semibold text-foreground">{athlete.name}</h3>
              <p className="text-sm text-primary">{athlete.sport}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" size="sm">View Profile</Button>
        </div>
      ))}
    </div>
  </>
);

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const renderProfile = () => {
    switch (user?.role) {
      case 'organizer':
        return <OrganizerProfile user={user} />;
      case 'coach':
        return <CoachProfile user={user} />;
      case 'creator':
        return <CreatorProfile user={user} />;
      case 'viewer':
        return <ViewerProfile user={user} />;
      default:
        return <AthleteProfile user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        {renderProfile()}
      </div>
    </div>
  );
};

export default ProfilePage;
