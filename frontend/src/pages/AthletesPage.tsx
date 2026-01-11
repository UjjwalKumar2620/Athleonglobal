import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Mail, Video, Plus, Filter, Star, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sampleAthletes, Athlete } from '@/data/athletes';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import FamousAthletes from '@/components/FamousAthletes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const sports = ['Cricket', 'Football', 'Basketball', 'Badminton', 'Tennis', 'Swimming', 'Athletics'];

const AthleteCard: React.FC<{ athlete: Athlete; onViewProfile: (athlete: Athlete) => void }> = ({ athlete, onViewProfile }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card border border-border p-6 rounded-2xl hover:shadow-lg transition-all duration-300"
  >
    <div className="flex items-start gap-4 mb-4">
      <img src={athlete.avatar} alt={athlete.name} className="w-16 h-16 rounded-full object-cover" />
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-foreground">{athlete.name}</h3>
        <p className="text-primary font-medium">{athlete.sport}</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <MapPin className="h-3 w-3" />
          <span>{athlete.location}</span>
        </div>
      </div>
    </div>

    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{athlete.bio}</p>

    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
      <span className="flex items-center gap-1">
        <Star className="h-4 w-4 text-primary" />
        {athlete.rating.toFixed(1)}
      </span>
      <span>{athlete.experience} exp</span>
    </div>

    <div className="flex gap-2">
      <Button variant="outline" className="flex-1" onClick={() => onViewProfile(athlete)}>
        View Profile
      </Button>
      <Button variant="default" className="flex-1">
        <Plus className="h-4 w-4 mr-2" />
        Connect
      </Button>
    </div>
  </motion.div>
);

const AthleteProfileModal: React.FC<{ athlete: Athlete | null; open: boolean; onClose: () => void }> = ({ athlete, open, onClose }) => {
  const { toast } = useToast();

  if (!athlete) return null;

  const handleContact = () => {
    toast({
      title: 'Contact Request Sent',
      description: `Your contact request has been sent to ${athlete.name}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Athlete Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <img src={athlete.avatar} alt={athlete.name} className="w-24 h-24 rounded-full object-cover" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">{athlete.name}</h2>
              <p className="text-primary font-medium">{athlete.sport} • {athlete.position}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{athlete.location}</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-primary" />{athlete.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-secondary/50 p-4 rounded-xl">
            <h3 className="font-semibold mb-3 text-foreground">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>{athlete.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>{athlete.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{athlete.address}</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="font-semibold mb-2 text-foreground">About</h3>
            <p className="text-muted-foreground">{athlete.bio}</p>
          </div>

          {/* Performance Stats */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Performance Record</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {athlete.stats.map((stat) => (
                <div key={stat.label} className="bg-secondary/50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Game Videos */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Game Videos</h3>
            <div className="grid grid-cols-2 gap-4">
              {athlete.videos.map((video, idx) => (
                <div key={idx} className="bg-secondary/50 rounded-xl overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm text-foreground">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Achievements</h3>
            <div className="flex flex-wrap gap-2">
              {athlete.achievements.map((achievement, idx) => (
                <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {achievement}
                </span>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleContact}>
            <Plus className="h-4 w-4 mr-2" />
            Connect with {athlete.name}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AthletesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredAthletes = sampleAthletes.filter((athlete) => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'all' || athlete.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const featuredAthletes = sampleAthletes.filter(a => a.rating >= 4.5).slice(0, 3);

  const handleViewProfile = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
            Discover <span className="text-primary">Athletes</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Find talented athletes for your team or scouting needs
          </p>
        </motion.div>

        {/* Famous Athletes Section */}
        <FamousAthletes />

        {/* Featured Athletes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold mb-4 text-foreground">Featured Athletes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredAthletes.map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} onViewProfile={handleViewProfile} />
            ))}
          </div>
        </motion.div>


        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border p-4 rounded-xl mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search athletes by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-full md:w-48 bg-secondary border-border">
                <SelectValue placeholder="Select Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {sports.map((sport) => (
                  <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAthletes.length} athletes
          </p>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sort by rating</span>
          </div>
        </div>

        {/* Athletes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAthletes.map((athlete) => (
            <AthleteCard key={athlete.id} athlete={athlete} onViewProfile={handleViewProfile} />
          ))}
        </div>

        {filteredAthletes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No athletes found matching your criteria.</p>
          </div>
        )}

        <AthleteProfileModal
          athlete={selectedAthlete}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default AthletesPage;
