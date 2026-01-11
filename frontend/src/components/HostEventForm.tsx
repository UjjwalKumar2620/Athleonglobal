import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, IndianRupee, Trophy, Utensils, Droplets, Accessibility, Car, Heart, GlassWater, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { delhiVenues, sports, Event, EventAmenities } from '@/data/events';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Default sport images from Unsplash
const sportImages: Record<string, string> = {
  'Cricket': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
  'Football': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
  'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
  'Tennis': 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
  'Badminton': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
  'Swimming': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
  'Athletics': 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800',
  'Hockey': 'https://images.unsplash.com/photo-1580748142437-c26c59e7e43b?w=800',
  'Kabaddi': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
  'Wrestling': 'https://images.unsplash.com/photo-1580474628829-72d38ac0db3e?w=800',
  'Boxing': 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
  'Golf': 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
  'Table Tennis': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  'Volleyball': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
  'Archery': 'https://images.unsplash.com/photo-1511719105906-89dfe3bb14c4?w=800',
  'Cycling': 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800',
  'Martial Arts': 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
  'Esports': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
  'Chess': 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=800',
  'Shooting': 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800',
};

const defaultSportImage = 'https://images.unsplash.com/photo-1461896836934- voices02?w=800';

interface HostEventFormProps {
  onSuccess?: (event: Event) => void;
}

const HostEventForm: React.FC<HostEventFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    venueId: '',
    date: '',
    time: '',
    isPaid: false,
    ticketPrice: 0,
    maxCapacity: 100,
  });

  const [amenities, setAmenities] = useState<EventAmenities>({
    foodStalls: true,
    washrooms: true,
    pwdFacilities: false,
    parking: true,
    firstAid: true,
    drinkingWater: true,
  });

  const selectedVenue = delhiVenues.find(v => v.id === formData.venueId);

  // Get image for selected sport
  const getEventImage = () => {
    if (customImage) return customImage;
    if (formData.sport && sportImages[formData.sport]) {
      return sportImages[formData.sport];
    }
    return defaultSportImage;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const amenityOptions = [
    { key: 'foodStalls' as keyof EventAmenities, label: 'Food Stalls', icon: Utensils },
    { key: 'washrooms' as keyof EventAmenities, label: 'Washroom Facilities', icon: Droplets },
    { key: 'pwdFacilities' as keyof EventAmenities, label: 'PWD Accessible', icon: Accessibility },
    { key: 'parking' as keyof EventAmenities, label: 'Parking', icon: Car },
    { key: 'firstAid' as keyof EventAmenities, label: 'First Aid', icon: Heart },
    { key: 'drinkingWater' as keyof EventAmenities, label: 'Drinking Water', icon: GlassWater },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.sport || !formData.venueId || !formData.date || !formData.time) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const venue = delhiVenues.find(v => v.id === formData.venueId);

    const newEvent: Event = {
      id: `user_event_${Date.now()}`,
      title: formData.title,
      description: formData.description || 'No description provided.',
      sport: formData.sport,
      location: venue?.name || '',
      address: venue?.address || '',
      date: formData.date,
      time: formData.time,
      price: formData.isPaid ? formData.ticketPrice : 0,
      isPaid: formData.isPaid,
      spotsAvailable: formData.maxCapacity,
      totalSpots: formData.maxCapacity,
      organizer: user?.name || 'Event Organizer',
      organizerId: user?.id,
      image: getEventImage(),
      category: 'tournament',
      rating: 0,
      reviewCount: 0,
      amenities,
    };

    // Reset form
    setFormData({
      title: '',
      description: '',
      sport: '',
      venueId: '',
      date: '',
      time: '',
      isPaid: false,
      ticketPrice: 0,
      maxCapacity: 100,
    });

    setAmenities({
      foodStalls: true,
      washrooms: true,
      pwdFacilities: false,
      parking: true,
      firstAid: true,
      drinkingWater: true,
    });

    setCustomImage(null);

    onSuccess?.(newEvent);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cover Image Preview */}
      <div className="space-y-2">
        <Label>Event Cover Image</Label>
        <div className="relative rounded-xl overflow-hidden border border-border">
          <img
            src={getEventImage()}
            alt="Event cover"
            className="w-full h-40 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1461896836934-bbe02869f5c0?w=800';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between p-4">
            <p className="text-white text-sm">
              {customImage ? 'Custom Image' : formData.sport ? `Auto: ${formData.sport}` : 'Select a sport for auto-image'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Custom
            </Button>
          </div>
        </div>
        {customImage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCustomImage(null)}
            className="text-muted-foreground"
          >
            Use auto-generated image instead
          </Button>
        )}
      </div>

      {/* Event Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter event title"
          className="bg-secondary border-border"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your event..."
          className="bg-secondary border-border min-h-[100px]"
        />
      </div>

      {/* Sport Selection */}
      <div className="space-y-2">
        <Label>Sport * (auto-assigns cover image)</Label>
        <Select value={formData.sport} onValueChange={(value) => setFormData({ ...formData, sport: value })}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="Select a sport" />
          </SelectTrigger>
          <SelectContent>
            {sports.map((sport) => (
              <SelectItem key={sport} value={sport}>{sport}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Venue Selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Venue *
        </Label>
        <Select value={formData.venueId} onValueChange={(value) => setFormData({ ...formData, venueId: value })}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="Select a venue in Delhi" />
          </SelectTrigger>
          <SelectContent>
            {delhiVenues.map((venue) => (
              <SelectItem key={venue.id} value={venue.id}>
                <div>
                  <p className="font-medium">{venue.name}</p>
                  <p className="text-xs text-muted-foreground">Capacity: {venue.capacity.toLocaleString()}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedVenue && (
          <p className="text-xs text-muted-foreground">{selectedVenue.address}</p>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Date *
          </Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Time *
          </Label>
          <Input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>
      </div>

      {/* Max Capacity */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="h-4 w-4" /> Maximum Attendees
        </Label>
        <Input
          type="number"
          value={formData.maxCapacity}
          onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
          placeholder="Maximum number of attendees"
          className="bg-secondary border-border"
          max={selectedVenue?.capacity || 100000}
        />
        {selectedVenue && (
          <p className="text-xs text-muted-foreground">
            Venue max capacity: {selectedVenue.capacity.toLocaleString()}
          </p>
        )}
      </div>

      {/* Venue Amenities */}
      <div className="space-y-3">
        <Label>Venue Amenities</Label>
        <div className="grid grid-cols-2 gap-3">
          {amenityOptions.map((option) => (
            <div key={option.key} className="flex items-center gap-2">
              <Checkbox
                id={option.key}
                checked={amenities[option.key]}
                onCheckedChange={(checked) =>
                  setAmenities({ ...amenities, [option.key]: checked === true })
                }
              />
              <label
                htmlFor={option.key}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <option.icon className="h-4 w-4 text-muted-foreground" />
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Paid Event Toggle */}
      <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
        <div>
          <Label className="font-medium">Paid Event</Label>
          <p className="text-xs text-muted-foreground">Enable ticketing for your event</p>
        </div>
        <Switch
          checked={formData.isPaid}
          onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
        />
      </div>

      {/* Ticket Price (if paid) */}
      {formData.isPaid && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <Label className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" /> Ticket Price (₹)
          </Label>
          <Input
            type="number"
            value={formData.ticketPrice}
            onChange={(e) => setFormData({ ...formData, ticketPrice: parseInt(e.target.value) || 0 })}
            placeholder="Enter ticket price"
            className="bg-secondary border-border"
            min={0}
          />
        </motion.div>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full">
        <Trophy className="h-4 w-4 mr-2" />
        Create Event
      </Button>
    </form>
  );
};

export default HostEventForm;
