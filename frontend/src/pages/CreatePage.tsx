import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Play, Upload, Clock, Eye, Plus, Film, Scissors, Image, Type, Music, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const videoTypes = [
    { value: 'tutorial', label: 'Training Tutorial', icon: Video },
    { value: 'technique', label: 'Technique Breakdown', icon: Scissors },
    { value: 'motivation', label: 'Motivational Content', icon: Play },
    { value: 'vlog', label: 'Sports Vlog', icon: Film },
];

const sampleVideos = [
    { id: 1, title: 'Cricket Batting Masterclass', type: 'long', duration: '15:30', views: '12.5K', status: 'published' },
    { id: 2, title: 'Quick Bowling Tips', type: 'short', duration: '0:58', views: '45K', status: 'published' },
    { id: 3, title: 'Fitness Routine for Athletes', type: 'long', duration: '22:15', views: '8.2K', status: 'published' },
    { id: 4, title: 'Match Day Preparation', type: 'short', duration: '0:45', views: '32K', status: 'draft' },
];

const CreatePage: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [videoType, setVideoType] = useState<'short' | 'long'>('short');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        sport: 'Cricket',
    });
    const [isUploading, setIsUploading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePublish = () => {
        if (!formData.title) {
            toast({ title: 'Error', description: 'Please add a title for your video', variant: 'destructive' });
            return;
        }

        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            toast({ title: 'Video Published!', description: 'Your video has been successfully published.' });
            setFormData({ title: '', description: '', category: '', sport: 'Cricket' });
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-background pt-20 pb-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 text-foreground">
                        <span className="text-primary">Create Content</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Share your sports knowledge with training videos and tutorials
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Create Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2"
                    >
                        {/* Video Type Selection */}
                        <div className="bg-card border border-border p-6 rounded-2xl mb-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Video className="h-5 w-5 text-primary" />
                                Video Type
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setVideoType('short')}
                                    className={`p-4 rounded-xl border-2 transition-all ${videoType === 'short'
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <Play className={`h-8 w-8 mx-auto mb-2 ${videoType === 'short' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <h3 className="font-semibold text-foreground">Short Video</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Up to 60 seconds</p>
                                </button>
                                <button
                                    onClick={() => setVideoType('long')}
                                    className={`p-4 rounded-xl border-2 transition-all ${videoType === 'long'
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <Film className={`h-8 w-8 mx-auto mb-2 ${videoType === 'long' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <h3 className="font-semibold text-foreground">Long Video</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Full tutorials & sessions</p>
                                </button>
                            </div>
                        </div>

                        {/* Upload Section */}
                        <div className="bg-card border border-border p-6 rounded-2xl mb-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Upload className="h-5 w-5 text-primary" />
                                Upload Video
                            </h2>
                            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-semibold text-foreground mb-2">
                                    Drop your {videoType === 'short' ? 'short' : 'long-form'} video here
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    or click to browse files
                                </p>
                                <Button variant="hero">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Select Video
                                </Button>
                                <p className="text-xs text-muted-foreground mt-4">
                                    Supports MP4, MOV, AVI • Max {videoType === 'short' ? '100MB' : '2GB'}
                                </p>
                            </div>
                        </div>

                        {/* Video Details */}
                        <div className="bg-card border border-border p-6 rounded-2xl">
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Type className="h-5 w-5 text-primary" />
                                Video Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title" className="text-foreground">Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter an engaging title..."
                                        className="mt-1 bg-secondary border-border"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description" className="text-foreground">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe what viewers will learn..."
                                        className="mt-1 bg-secondary border-border min-h-[100px]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-foreground">Category</Label>
                                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                            <SelectTrigger className="mt-1 bg-secondary border-border">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {videoTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-foreground">Sport</Label>
                                        <Select value={formData.sport} onValueChange={(value) => setFormData({ ...formData, sport: value })}>
                                            <SelectTrigger className="mt-1 bg-secondary border-border">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cricket">Cricket</SelectItem>
                                                <SelectItem value="Football">Football</SelectItem>
                                                <SelectItem value="Basketball">Basketball</SelectItem>
                                                <SelectItem value="Badminton">Badminton</SelectItem>
                                                <SelectItem value="Tennis">Tennis</SelectItem>
                                                <SelectItem value="Athletics">Athletics</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" className="flex-1">
                                        Save as Draft
                                    </Button>
                                    <Button variant="hero" className="flex-1" onClick={handlePublish} disabled={isUploading}>
                                        {isUploading ? (
                                            'Publishing...'
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Publish
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* My Videos */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="bg-card border border-border p-6 rounded-2xl">
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Film className="h-5 w-5 text-primary" />
                                My Videos
                            </h2>
                            <div className="space-y-3">
                                {sampleVideos.map((video) => (
                                    <div
                                        key={video.id}
                                        className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-20 h-14 bg-secondary rounded-lg flex items-center justify-center">
                                                <Play className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm text-foreground truncate">{video.title}</h4>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                    <span className={`px-1.5 py-0.5 rounded ${video.type === 'short' ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'
                                                        }`}>
                                                        {video.type === 'short' ? 'SHORT' : 'LONG'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {video.duration}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        {video.views}
                                                    </span>
                                                    <span className={`${video.status === 'published' ? 'text-green-500' : 'text-amber-500'}`}>
                                                        • {video.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-4">
                                View All Videos
                            </Button>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-card border border-border p-6 rounded-2xl mt-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Creator Stats</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                                    <p className="text-2xl font-bold text-primary">4</p>
                                    <p className="text-xs text-muted-foreground">Videos</p>
                                </div>
                                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                                    <p className="text-2xl font-bold text-primary">97.7K</p>
                                    <p className="text-xs text-muted-foreground">Total Views</p>
                                </div>
                                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                                    <p className="text-2xl font-bold text-primary">2.5K</p>
                                    <p className="text-xs text-muted-foreground">Followers</p>
                                </div>
                                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                                    <p className="text-2xl font-bold text-primary">4.8</p>
                                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CreatePage;
