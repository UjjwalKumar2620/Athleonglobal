import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Calendar, Clock, Users, Filter, Ticket, Plus, Info, X, Utensils, Droplets, Accessibility, Car, Heart, GlassWater } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { delhiEvents, sports, Event, EventAmenities } from '@/data/events';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import StarRating from '@/components/StarRating';
import HostEventForm from '@/components/HostEventForm';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Helper to get user events from localStorage
const getUserEvents = (): Event[] => {
  try {
    const stored = localStorage.getItem('athleon_user_events');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save user events to localStorage
const saveUserEvents = (events: Event[]) => {
  localStorage.setItem('athleon_user_events', JSON.stringify(events));
};

// Event Info Modal Component
const EventInfoModal: React.FC<{
  event: Event | null;
  open: boolean;
  onClose: () => void;
}> = ({ event, open, onClose }) => {
  if (!event) return null;

  const defaultAmenities: EventAmenities = {
    foodStalls: true,
    washrooms: true,
    pwdFacilities: true,
    parking: true,
    firstAid: true,
    drinkingWater: true,
  };

  const amenities = event.amenities || defaultAmenities;

  const amenityItems = [
    { key: 'foodStalls', label: 'Food Stalls', icon: Utensils, available: amenities.foodStalls },
    { key: 'washrooms', label: 'Washroom Facilities', icon: Droplets, available: amenities.washrooms },
    { key: 'pwdFacilities', label: 'PWD Accessible', icon: Accessibility, available: amenities.pwdFacilities },
    { key: 'parking', label: 'Parking Available', icon: Car, available: amenities.parking },
    { key: 'firstAid', label: 'First Aid Station', icon: Heart, available: amenities.firstAid },
    { key: 'drinkingWater', label: 'Drinking Water', icon: GlassWater, available: amenities.drinkingWater },
  ];

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Event Details
          </DialogTitle>
          <DialogDescription>
            {event.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Price */}
          <div className="bg-secondary/50 p-4 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">Ticket Price</h4>
            <p className="text-2xl font-bold text-primary">
              {event.isPaid ? `₹${event.price}` : 'FREE'}
            </p>
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Date & Time</h4>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>{event.time}</span>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Venue</h4>
            <p className="font-medium text-foreground">{event.location}</p>
            <p className="text-sm text-muted-foreground">{event.address}</p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
            >
              <MapPin className="h-4 w-4" />
              Open in Google Maps
            </a>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Venue Amenities</h4>
            <div className="grid grid-cols-2 gap-3">
              {amenityItems.map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center gap-2 p-2 rounded-lg ${item.available
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-secondary/50 text-muted-foreground line-through'
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spots */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>{event.spotsAvailable} / {event.totalSpots} spots available</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EventCard: React.FC<{
  event: Event;
  isViewer: boolean;
  isOwner: boolean;
  onAction: (event: Event) => void;
  onInfo: (event: Event) => void;
  onCancel: (event: Event) => void;
}> = ({ event, isViewer, isOwner, onAction, onInfo, onCancel }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="relative h-48">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${event.isPaid ? 'bg-amber-500/90 text-white' : 'bg-green-500/90 text-white'
            }`}>
            {event.isPaid ? `₹${event.price}` : t('events.free')}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/90 text-primary-foreground">
            {event.sport}
          </span>
        </div>
        {isOwner && (
          <div className="absolute top-12 left-3">
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-500/90 text-white">
              Your Event
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1 text-foreground">{event.title}</h3>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={event.rating} />
          <span className="text-sm text-muted-foreground">({event.reviewCount} reviews)</span>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>{event.spotsAvailable} / {event.totalSpots} spots</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onInfo(event)}
            className="shrink-0"
          >
            <Info className="h-4 w-4" />
          </Button>
          {isOwner ? (
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onCancel(event)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Event
            </Button>
          ) : (
            <Button
              variant="default"
              className="flex-1"
              onClick={() => onAction(event)}
            >
              {isViewer ? (
                <>
                  <Ticket className="h-4 w-4 mr-2" />
                  {t('events.buyTicket')}
                </>
              ) : (
                t('events.register')
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const EventsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [hostFormOpen, setHostFormOpen] = useState(false);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [infoModalEvent, setInfoModalEvent] = useState<Event | null>(null);
  const [cancelConfirmEvent, setCancelConfirmEvent] = useState<Event | null>(null);

  const isViewer = user?.role === 'viewer';
  const isOrganizer = user?.role === 'organizer';

  // Load user events on mount
  useEffect(() => {
    setUserEvents(getUserEvents());
  }, []);

  // Merge user events with delhi events
  const allEvents = [...userEvents, ...delhiEvents];

  const filteredEvents = allEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'all' || event.sport === selectedSport;
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === 'free' && !event.isPaid) ||
      (priceFilter === 'paid' && event.isPaid);
    return matchesSearch && matchesSport && matchesPrice;
  });

  const handleEventAction = (event: Event) => {
    if (isViewer) {
      toast({
        title: 'Ticket Booking',
        description: `Processing ticket for ${event.title}. Redirecting to payment...`,
      });
    } else {
      toast({
        title: 'Registration Successful',
        description: `You have registered for ${event.title}!`,
      });
    }
  };

  const handleEventCreated = (newEvent: Event) => {
    const updatedEvents = [newEvent, ...userEvents];
    setUserEvents(updatedEvents);
    saveUserEvents(updatedEvents);
    setHostFormOpen(false);
    toast({
      title: 'Event Created!',
      description: `Your event "${newEvent.title}" is now live.`,
    });
  };

  const handleCancelEvent = (event: Event) => {
    const updatedEvents = userEvents.filter(e => e.id !== event.id);
    setUserEvents(updatedEvents);
    saveUserEvents(updatedEvents);
    setCancelConfirmEvent(null);
    toast({
      title: 'Event Cancelled',
      description: `"${event.title}" has been cancelled.`,
      variant: 'destructive',
    });
  };

  const isEventOwner = (event: Event) => {
    return event.organizerId === user?.id;
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
            Sports <span className="text-primary">{t('events.title')}</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('events.subtitle')}
          </p>

          {isOrganizer && (
            <Button
              className="mt-6"
              size="lg"
              onClick={() => setHostFormOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Host an Event
            </Button>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border p-4 rounded-xl mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search events or locations..."
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
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full md:w-36 bg-secondary border-border">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredEvents.length} events {userEvents.length > 0 && `(${userEvents.length} your events)`}
          </p>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sort by date</span>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isViewer={isViewer}
              isOwner={isEventOwner(event)}
              onAction={handleEventAction}
              onInfo={setInfoModalEvent}
              onCancel={setCancelConfirmEvent}
            />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No events found matching your criteria.</p>
          </div>
        )}

        {/* Event Info Modal */}
        <EventInfoModal
          event={infoModalEvent}
          open={!!infoModalEvent}
          onClose={() => setInfoModalEvent(null)}
        />

        {/* Cancel Event Confirmation */}
        <AlertDialog open={!!cancelConfirmEvent} onOpenChange={() => setCancelConfirmEvent(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel "{cancelConfirmEvent?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Event</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => cancelConfirmEvent && handleCancelEvent(cancelConfirmEvent)}
              >
                Cancel Event
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Host Event Dialog */}
        <Dialog open={hostFormOpen} onOpenChange={setHostFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Host a New Event</DialogTitle>
            </DialogHeader>
            <HostEventForm onSuccess={handleEventCreated} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EventsPage;
