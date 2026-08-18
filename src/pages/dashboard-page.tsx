import { motion } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { UpcomingEvents } from '@/components/dashboard/upcoming-events';
import { BookingRequests } from '@/components/dashboard/booking-requests';
import { AvailabilityCard } from '@/components/dashboard/availability-card';
import { ProfileCompletion } from '@/components/dashboard/profile-completion';
import { TodaySchedule } from '@/components/dashboard/today-schedule';
import { PerformanceCard } from '@/components/dashboard/performance-card';
import { EarningsCard } from '@/components/dashboard/earnings-card';
import { PortfolioPreview } from '@/components/dashboard/portfolio-preview';
import { PackagesSection } from '@/components/dashboard/packages-section';
import { ReviewsSection } from '@/components/dashboard/reviews-section';
import { NotificationsCard } from '@/components/dashboard/notifications-card';
import { PageHeader } from '@/components/dashboard/page-header';
import { KycGateBanner } from '@/components/dashboard/kyc-gate-banner';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Your business at a glance" icon={LayoutDashboard} />

      {/* KYC Document Verification Banner */}
      <KycGateBanner />

      {/* Hero Summary */}
      <SummaryCards />

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        {/* Left column 70% */}
        <div className="space-y-6">
          <UpcomingEvents />
          <BookingRequests />
          <EarningsCard />
          <PortfolioPreview />
          <PackagesSection />
          <ReviewsSection />
        </div>

        {/* Right column 30% */}
        <div className="space-y-6">
          <AvailabilityCard />
          <ProfileCompletion />
          <TodaySchedule />
          <PerformanceCard />
          <NotificationsCard />
        </div>
      </div>
    </div>
  );
}
