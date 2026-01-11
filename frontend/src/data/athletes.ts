export interface Athlete {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  sport: string;
  position: string;
  location: string;
  avatar: string;
  bio: string;
  experience: string;
  rating: number;
  stats: { label: string; value: string | number }[];
  videos: { title: string; views: string }[];
  achievements: string[];
}

export const sampleAthletes: Athlete[] = [
  {
    id: '1',
    name: 'Virat Singh',
    email: 'virat.singh@gmail.com',
    phone: '+91 98765 43210',
    address: '45 Lajpat Nagar, New Delhi, 110024',
    sport: 'Cricket',
    position: 'Batsman',
    location: 'Delhi, India',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Aggressive opening batsman with exceptional timing and footwork. Represented Delhi in Ranji Trophy.',
    experience: '8 years',
    rating: 4.8,
    stats: [
      { label: 'Matches', value: 156 },
      { label: 'Runs', value: '5,420' },
      { label: 'Avg', value: 42.5 },
      { label: 'Strike Rate', value: 138 },
    ],
    videos: [
      { title: 'Century vs Mumbai', views: '45K' },
      { title: 'Match Winning 89*', views: '32K' },
    ],
    achievements: ['Delhi U-19 Captain', 'Ranji Trophy Winner', 'Best Batsman 2024'],
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 87654 32109',
    address: '78 Vasant Vihar, New Delhi, 110057',
    sport: 'Badminton',
    position: 'Singles Player',
    location: 'Delhi, India',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'National level badminton player with quick reflexes and strategic gameplay. Trained under Olympic coach.',
    experience: '6 years',
    rating: 4.6,
    stats: [
      { label: 'Tournaments', value: 48 },
      { label: 'Wins', value: 35 },
      { label: 'Ranking', value: '#12' },
      { label: 'Win Rate', value: '73%' },
    ],
    videos: [
      { title: 'National Finals Highlights', views: '28K' },
      { title: 'Training Session', views: '15K' },
    ],
    achievements: ['National Silver Medalist', 'State Champion 2023', 'Junior National Winner'],
  },
  {
    id: '3',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@gmail.com',
    phone: '+91 76543 21098',
    address: '23 Defence Colony, New Delhi, 110024',
    sport: 'Football',
    position: 'Striker',
    location: 'Delhi, India',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    bio: 'Clinical striker with excellent positioning and finishing ability. Captain of Delhi FC youth team.',
    experience: '7 years',
    rating: 4.5,
    stats: [
      { label: 'Matches', value: 120 },
      { label: 'Goals', value: 78 },
      { label: 'Assists', value: 34 },
      { label: 'Minutes/Goal', value: 95 },
    ],
    videos: [
      { title: 'Hat-trick vs Goa', views: '52K' },
      { title: 'Free Kick Goals', views: '41K' },
    ],
    achievements: ['I-League Youth Champion', 'Golden Boot 2024', 'Delhi FC Best Player'],
  },
  {
    id: '4',
    name: 'Sneha Patel',
    email: 'sneha.patel@gmail.com',
    phone: '+91 65432 10987',
    address: '56 Greater Kailash, New Delhi, 110048',
    sport: 'Swimming',
    position: 'Freestyle',
    location: 'Delhi, India',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    bio: 'Competitive swimmer specializing in freestyle and butterfly. National record holder in 100m freestyle.',
    experience: '10 years',
    rating: 4.9,
    stats: [
      { label: 'Medals', value: 45 },
      { label: 'Records', value: 3 },
      { label: 'Best Time', value: '52.4s' },
      { label: 'Ranking', value: '#2' },
    ],
    videos: [
      { title: 'National Record Swim', views: '89K' },
      { title: 'Training Routine', views: '23K' },
    ],
    achievements: ['National Record Holder', 'Asian Games Bronze', 'SAI Scholarship'],
  },
  {
    id: '5',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@gmail.com',
    phone: '+91 54321 09876',
    address: '12 Rohini Sector 9, New Delhi, 110085',
    sport: 'Basketball',
    position: 'Point Guard',
    location: 'Delhi, India',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    bio: 'Dynamic point guard with excellent court vision and leadership skills. Led Delhi to 3 consecutive state titles.',
    experience: '5 years',
    rating: 4.4,
    stats: [
      { label: 'Games', value: 85 },
      { label: 'Points/Game', value: 18.5 },
      { label: 'Assists/Game', value: 7.2 },
      { label: 'Win Rate', value: '68%' },
    ],
    videos: [
      { title: 'State Finals MVP', views: '18K' },
      { title: 'Best Plays 2024', views: '12K' },
    ],
    achievements: ['State Champion 3x', 'MVP Finals 2024', 'Delhi Team Captain'],
  },
  {
    id: '6',
    name: 'Ananya Reddy',
    email: 'ananya.reddy@gmail.com',
    phone: '+91 43210 98765',
    address: '89 Saket, New Delhi, 110017',
    sport: 'Tennis',
    position: 'Singles Player',
    location: 'Delhi, India',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    bio: 'Powerful baseline player with a deadly two-handed backhand. Trained at national tennis academy.',
    experience: '9 years',
    rating: 4.7,
    stats: [
      { label: 'Tournaments', value: 62 },
      { label: 'Titles', value: 14 },
      { label: 'Ranking', value: '#8' },
      { label: 'Win Rate', value: '71%' },
    ],
    videos: [
      { title: 'National Semi-Final', views: '34K' },
      { title: 'Backhand Masterclass', views: '27K' },
    ],
    achievements: ['National Finalist', 'Junior Wimbledon Qualifier', 'AITA Ranking #8'],
  },
];
