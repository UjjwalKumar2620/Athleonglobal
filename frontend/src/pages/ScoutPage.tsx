import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, Play, Award, FileText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// Sports list for filter
// Sports list for filter
const allSports = ['Cricket', 'Football', 'Basketball', 'Badminton', 'Tennis', 'Swimming', 'Athletics', 'Hockey', 'Table Tennis', 'Volleyball'];

const fallbackAthletes = Array.from({ length: 25 }).map((_, i) => ({
    id: `local-mock-${i}`,
    name: ['Aarav', 'Vihaan', 'Kabir', 'Vivaan', 'Aditya', 'Reyansh', 'Muhammad', 'Arjun', 'Sai', 'Ishaan'][i % 10] + ' ' + ['Sharma', 'Verma', 'Singh', 'Gupta', 'Patel', 'Kumar', 'Reddy', 'Nair'][i % 8],
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${i}`,
    sports: [['Cricket'], ['Football'], ['Basketball'], ['Tennis'], ['Badminton'], ['Athletics']][i % 6],
    position: ['Forward', 'Striker', 'Bowler', 'Batsman', 'Guard', 'Keeper', 'Midfielder'][i % 7],
    location: ['Delhi, India', 'Mumbai, India', 'Bangalore, India', 'Chennai, India', 'Hyderabad, India'][i % 5],
    bio: 'Dedicated athlete with a passion for excellence and a history of strong performances in state-level tournaments.',
    experience: `${Math.floor(Math.random() * 8) + 1} years`,
    rating: (4.0 + (Math.random() * 1)).toFixed(1),
    achievements: ['State Medallist', 'MVP 2024', 'District Champion'],
    videos: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    certificates: i % 3 === 0 ? ['Certified Professional'] : [],
    user: { id: `mock-user-${i}`, name: 'Athlete', avatar: '' }
}));

const ScoutPage: React.FC = () => {
    const { user } = useAuth();
    const token = localStorage.getItem('athleon_token');
    const { toast } = useToast();
    const [selectedSports, setSelectedSports] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [athletes, setAthletes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAthlete, setSelectedAthlete] = useState<any | null>(null);

    // Fetch athletes when filters change
    useEffect(() => {
        const fetchAthletes = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedSports.length > 0) params.append('sport', selectedSports.join(','));
                if (searchQuery) params.append('search', searchQuery);
                // Default limit 30 as requested 
                params.append('limit', '30');

                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/profile/athletes?${params.toString()}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.athletes && data.athletes.length > 0) {
                        setAthletes(data.athletes);
                    } else {
                        // FRONTEND FALLBACK: Use hardcoded data if API returns empty
                        console.log("API returned empty, using frontend fallback data");
                        setAthletes(fallbackAthletes);
                    }
                } else {
                    console.error("Failed to fetch athletes, using fallback");
                    setAthletes(fallbackAthletes);
                }
            } catch (error) {
                console.error("Error fetching athletes:", error);
                setAthletes(fallbackAthletes);
            } finally {
                setLoading(false);
            }
        };

        // Debounce fetch slightly
        const timeout = setTimeout(fetchAthletes, 300);
        return () => clearTimeout(timeout);
    }, [selectedSports, searchQuery, token]);

    const toggleSport = (sport: string) => {
        setSelectedSports(prev =>
            prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
        );
    };

    const toggleAllSports = () => {
        setSelectedSports([]);
    }

    return (
        <div className="min-h-screen bg-background pt-20 pb-12">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold font-display text-foreground mb-2">Scout Talent</h1>
                    <p className="text-muted-foreground">Discover and recruit top athletes based on comprehensive performance data.</p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border border-border p-6 rounded-xl mb-8 shadow-sm"
                >
                    <div className="flex flex-col gap-6">
                        {/* Search */}
                        <div className="relative max-w-xl">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, location, or bio..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 bg-secondary/50 border-border"
                            />
                        </div>

                        {/* Sports Filter */}
                        <div>
                            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <Filter className="h-4 w-4 text-primary" /> Select Sports
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    variant={selectedSports.length === 0 ? "default" : "outline"}
                                    className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/90"
                                    onClick={toggleAllSports}
                                >
                                    All Sports
                                </Badge>
                                {allSports.map(sport => (
                                    <Badge
                                        key={sport}
                                        variant={selectedSports.includes(sport) ? "default" : "outline"}
                                        className={`cursor-pointer px-4 py-2 text-sm transition-all ${selectedSports.includes(sport) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                        onClick={() => toggleSport(sport)}
                                    >
                                        {sport}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Results Count */}
                <div className="mb-4 text-sm text-muted-foreground">
                    Found {athletes.length} athletes matching your criteria
                </div>

                {/* List View */}
                <div className="grid gap-4">
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">Loading talent data...</div>
                    ) : athletes.length > 0 ? (
                        athletes.map((athlete, index) => (
                            <ScoutCard key={athlete.id} athlete={athlete} index={index} onSelect={() => setSelectedAthlete(athlete)} />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-card border border-border rounded-xl">
                            <p className="text-muted-foreground">No athletes found. Try adjusting your filters.</p>
                        </div>
                    )}
                </div>

                {/* Profile Modal */}
                <AthleteDetailModal
                    athlete={selectedAthlete}
                    open={!!selectedAthlete}
                    onClose={() => setSelectedAthlete(null)}
                />
            </div>
        </div>
    );
};

const ScoutCard: React.FC<{ athlete: any, index: number, onSelect: () => void }> = ({ athlete, index, onSelect }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
        >
            <div className="p-5 flex flex-col md:flex-row gap-6">
                {/* Avatar & Basic Info */}
                <div className="flex items-start gap-4 min-w-[200px]">
                    <img src={athlete.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${athlete.name}`} alt={athlete.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
                    <div>
                        <h3 className="font-bold text-lg text-foreground">{athlete.name}</h3>
                        <div className="flex flex-wrap gap-1 mb-1">
                            {athlete.sports?.map((s: string) => (
                                <span key={s} className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">{s}</span>
                            ))}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {athlete.location || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Stats & Exp */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <div>
                        <p className="text-xs text-muted-foreground">Experience</p>
                        <p className="font-medium text-foreground">{athlete.experience || 'Start'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Certifications</p>
                        <div className="flex items-center gap-1 font-medium text-foreground">
                            <FileText className="h-3 w-3 text-blue-500" />
                            {athlete.certificates?.length || 0} Verify
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Achievements</p>
                        <div className="flex items-center gap-1 font-medium text-foreground">
                            <Award className="h-3 w-3 text-amber-500" />
                            {athlete.achievements?.length || 0} Listed
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Gameplays</p>
                        <div className="flex items-center gap-1 font-medium text-foreground">
                            <Play className="h-3 w-3 text-red-500" />
                            {athlete.videos?.length || 0} Videos
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center items-end gap-2 md:border-l border-border md:pl-6 min-w-[140px]">
                    <Button onClick={onSelect} className="w-full">View Profile</Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="w-full text-xs text-muted-foreground"
                    >
                        {expanded ? 'Show Less' : 'Quick View'}
                        {expanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                    </Button>
                </div>
            </div>

            {/* Expanded Quick View */}
            {expanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-6 pb-6 pt-2 border-t border-border bg-secondary/20"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Videos Preview */}
                        <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Play className="h-4 w-4 bg-red-100 text-red-600 p-0.5 rounded" /> Recent Gameplay
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {athlete.videos && athlete.videos.length > 0 ? (
                                    athlete.videos.slice(0, 2).map((v: string, i: number) => (
                                        <div key={i} className="aspect-video bg-black/10 rounded-lg flex items-center justify-center relative group cursor-pointer hover:bg-black/20 transition-colors">
                                            <Play className="h-8 w-8 text-white/80 group-hover:text-white" />
                                            {/* In real app, this would be thumb or video player */}
                                            <span className="absolute bottom-1 right-2 text-[10px] bg-black/60 text-white px-1 rounded">1:20</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">No videos uploaded</p>
                                )}
                            </div>
                        </div>

                        {/* Achievements List */}
                        <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Award className="h-4 w-4 bg-amber-100 text-amber-600 p-0.5 rounded" /> Top Achievements
                            </h4>
                            <ul className="space-y-2">
                                {athlete.achievements && athlete.achievements.length > 0 ? (
                                    athlete.achievements.slice(0, 3).map((ach: string, i: number) => (
                                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                            {ach}
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">No achievements listed</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

const AthleteDetailModal: React.FC<{ athlete: any, open: boolean, onClose: () => void }> = ({ athlete, open, onClose }) => {
    if (!athlete) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Athlete Profile</DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-32 h-32 shrink-0">
                            <img src={athlete.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${athlete.name}`} alt={athlete.name} className="w-full h-full rounded-2xl object-cover shadow-sm" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-1">{athlete.name}</h2>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {athlete.sports?.map((s: string) => <Badge key={s} variant="secondary">{s} • {athlete.position}</Badge>)}
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">{athlete.bio}</p>
                        </div>
                    </div>

                    <div className="mt-8 grid md:grid-cols-2 gap-8">
                        {/* Videos */}
                        <div>
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Play className="h-5 w-5 text-red-500" /> Gameplay Analysis
                            </h3>
                            {athlete.videos && athlete.videos.length > 0 ? (
                                <div className="space-y-4">
                                    {athlete.videos.map((v: string, i: number) => (
                                        <div key={i} className="bg-secondary/30 rounded-xl p-3 border border-border">
                                            <div className="aspect-video bg-black/10 rounded-lg flex items-center justify-center mb-2">
                                                <Play className="h-10 w-10 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-medium">Match Highlight #{i + 1}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No videos available.</p>
                            )}
                        </div>

                        {/* Details */}
                        <div className="space-y-6">
                            {/* Achievements */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <Award className="h-5 w-5 text-amber-500" /> Achievements
                                </h3>
                                <ul className="space-y-2">
                                    {athlete.achievements?.map((a: string, i: number) => (
                                        <li key={i} className="text-sm bg-accent/50 p-2 rounded-lg border border-accent flex items-start gap-2">
                                            <Award className="h-4 w-4 text-amber-500 mt-0.5" /> {a}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Certificates */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" /> Certifications
                                </h3>
                                <div className="grid gap-2">
                                    {athlete.certificates?.map((c: string, i: number) => (
                                        <div key={i} className="text-sm bg-blue-500/10 text-blue-600 p-2 rounded-lg border border-blue-500/20 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" /> Verified Certificate #{i + 1}
                                        </div>
                                    ))}
                                    {(!athlete.certificates || athlete.certificates.length === 0) && <p className="text-muted-foreground text-sm">No certificates verified.</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border flex justify-end gap-4">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button>Contact Athlete</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ScoutPage;
