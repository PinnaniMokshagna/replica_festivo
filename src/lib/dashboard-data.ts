export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface NavItem {
  label: string;
  icon: string;
}

export interface SummaryCard {
  id: string;
  label: string;
  value: string;
  icon: string;
  accent: 'sage' | 'gold' | 'dark';
  change?: string;
  trend?: 'up' | 'down';
}

export interface UpcomingEvent {
  id: string;
  customer: string;
  type: string;
  date: string;
  time: string;
  location: string;
  budget: string;
  status: BookingStatus;
}

export interface BookingRequest {
  id: string;
  customer: string;
  avatar: string;
  service: string;
  budget: string;
  eventDate: string;
  status: BookingStatus;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
}

export interface Review {
  id: string;
  customer: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  reply?: string;
  reply_date?: string;
}

export interface Package {
  id: string;
  name: string;
  price: string;
  services: string[];
  popular?: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'payment' | 'booking' | 'review' | 'package';
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'LayoutDashboard' },
  { label: 'Verify Documents', icon: 'ShieldCheck' },
  { label: 'Bookings', icon: 'CalendarCheck' },
  { label: 'Calendar', icon: 'CalendarDays' },
  { label: 'Messages', icon: 'MessageSquare' },
  { label: 'Portfolio', icon: 'Images' },
  { label: 'Packages', icon: 'Package' },
  { label: 'Reviews', icon: 'Star' },
  { label: 'Earnings', icon: 'Wallet' },
  { label: 'Analytics', icon: 'BarChart3' },
  { label: 'Deals', icon: 'Tag' },
  { label: 'Settings', icon: 'Settings' },
  { label: 'Support', icon: 'LifeBuoy' },
];

export const summaryCards: SummaryCard[] = [
  {
    id: 'requests',
    label: 'New Requests',
    value: '0',
    icon: 'BellRing',
    accent: 'sage',
    change: '0 today',
    trend: 'up',
  },
  {
    id: 'confirmed',
    label: 'Confirmed Bookings',
    value: '0',
    icon: 'CalendarCheck',
    accent: 'sage',
    change: '0 this week',
    trend: 'up',
  },
  {
    id: 'earnings',
    label: "Today's Earnings",
    value: '₹0',
    icon: 'IndianRupee',
    accent: 'gold',
    change: '₹0 total',
    trend: 'up',
  },
  {
    id: 'rating',
    label: 'Average Rating',
    value: '0.0',
    icon: 'Star',
    accent: 'gold',
    change: '0 reviews',
    trend: 'up',
  },
];

export const upcomingEvents: UpcomingEvent[] = [];
export const bookingRequests: BookingRequest[] = [];
export const scheduleItems: ScheduleItem[] = [];
export const reviews: Review[] = [];
export const packages: Package[] = [];
export const notifications: NotificationItem[] = [];
export const earningsData = [];

export const profileTasks = [
  { id: '1', label: 'Upload Portfolio', done: true },
  { id: '2', label: 'Verify Documents', done: true },
  { id: '3', label: 'Add Packages', done: true },
  { id: '4', label: 'Bank Verification', done: false },
];

export const portfolioImages = [
  { id: '1', query: 'indian wedding photography ceremony' },
  { id: '2', query: 'elegant event decoration flowers' },
  { id: '3', query: 'corporate event stage lighting' },
  { id: '4', query: 'birthday party celebration decoration' },
  { id: '5', query: 'bridal makeup portrait indian' },
  { id: '6', query: 'dj night party lights' },
];
