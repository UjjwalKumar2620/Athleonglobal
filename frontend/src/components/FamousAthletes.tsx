import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, Users, X, Play, Trophy, ChevronLeft, ChevronRight, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { famousAthletes, FamousAthlete } from '@/data/famousAthletes';

interface AthleteProfileModalProps {
    athlete: FamousAthlete;
    onClose: () => void;
}

const AthleteProfileModal: React.FC<AthleteProfileModalProps> = ({ athlete, onClose }) => {
    const [activeTab, setActiveTab] = useState<'about' | 'videos'>('about');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative h-24 bg-gradient-to-r from-secondary to-secondary/80">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-foreground hover:bg-black/50 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>


                {/* Profile Info */}
                <div className="px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-12 mb-4">
                        <img
                            src={athlete.image}
                            alt={athlete.name}
                            className="w-24 h-24 rounded-full border-4 border-card object-cover"
                        />
                        <div className="flex-1 pb-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-foreground">{athlete.name}</h2>
                                {athlete.isVerified && (
                                    <BadgeCheck className="h-5 w-5 text-primary fill-primary/20" />
                                )}
                            </div>
                            <p className="text-sm text-primary font-medium">{athlete.sport}</p>
                        </div>
                        <div className="flex items-center gap-2 pb-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-foreground">{athlete.followers}</span>
                            <span className="text-muted-foreground text-sm">followers</span>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{athlete.bio}</p>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-4 border-b border-border">
                        <button
                            onClick={() => setActiveTab('about')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'about'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            About
                        </button>
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'videos'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Videos ({athlete.videos.length})
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[300px] overflow-y-auto">
                        {activeTab === 'about' ? (
                            <div className="space-y-4">
                                {/* Stats */}
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-primary" />
                                        Career Stats
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {athlete.stats.map((stat, i) => (
                                            <div key={i} className="bg-secondary/50 p-3 rounded-lg text-center">
                                                <p className="text-lg font-bold text-primary">{stat.value}</p>
                                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Achievements */}
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Achievements</h3>
                                    <ul className="space-y-2">
                                        {athlete.achievements.map((achievement, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">{achievement}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {athlete.videos.map((video) => (
                                    <div
                                        key={video.id}
                                        className="flex gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors cursor-pointer"
                                    >
                                        <div className="relative w-28 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <Play className="h-6 w-6 text-white fill-white" />
                                            </div>
                                            <span className={`absolute top-1 left-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${video.type === 'short' ? 'bg-red-500 text-white' : 'bg-primary text-white'
                                                }`}>
                                                {video.type === 'short' ? 'SHORT' : 'LONG'}
                                            </span>
                                            <span className="absolute bottom-1 right-1 text-[10px] bg-black/70 text-white px-1 rounded">
                                                {video.duration}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm text-foreground truncate">{video.title}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {video.views} views
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {video.duration}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {video.type === 'short' ? 'Quick tips & techniques' : 'Full training session'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const FamousAthletes: React.FC = () => {
    const [selectedAthlete, setSelectedAthlete] = useState<FamousAthlete | null>(null);
    const [followedIds, setFollowedIds] = useState<number[]>([]);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const handleFollow = (e: React.MouseEvent, athleteId: number) => {
        e.stopPropagation();
        setFollowedIds((prev) =>
            prev.includes(athleteId)
                ? prev.filter((id) => id !== athleteId)
                : [...prev, athleteId]
        );
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        Famous Athletes
                    </h2>
                    <p className="text-sm text-muted-foreground">Follow and learn from India's sports legends</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => scroll('left')}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => scroll('right')}
                        className="h-8 w-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Athlete Cards - Horizontal Scroll */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {famousAthletes.map((athlete) => (
                    <motion.div
                        key={athlete.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedAthlete(athlete)}
                        className="flex-shrink-0 w-44 bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                    >
                        {/* Image */}
                        <div className="relative h-36">
                            <img
                                src={athlete.image}
                                alt={athlete.name}
                                className="w-full h-full object-cover"
                            />
                            {athlete.isVerified && (
                                <div className="absolute top-2 right-2">
                                    <BadgeCheck className="h-5 w-5 text-primary fill-white" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-3">
                            <div className="flex items-center gap-1 mb-1">
                                <h3 className="font-semibold text-sm text-foreground truncate">{athlete.name}</h3>
                            </div>
                            <p className="text-xs text-primary mb-2">{athlete.sport}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {athlete.followers}
                                </span>
                                <Button
                                    size="sm"
                                    variant={followedIds.includes(athlete.id) ? 'outline' : 'hero'}
                                    className="h-7 text-xs px-3"
                                    onClick={(e) => handleFollow(e, athlete.id)}
                                >
                                    {followedIds.includes(athlete.id) ? 'Following' : 'Follow'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Profile Modal */}
            <AnimatePresence>
                {selectedAthlete && (
                    <AthleteProfileModal
                        athlete={selectedAthlete}
                        onClose={() => setSelectedAthlete(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FamousAthletes;
