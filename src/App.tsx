import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider as MainAuthProvider } from './lib/auth';
import { AuthProvider as DashboardAuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Public & Customer Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import VendorsPage from './pages/VendorsPage';
import VendorDetailPage from './pages/VendorDetailPage';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AuthPage from './pages/AuthPage';
import ExplorePage from './pages/ExplorePage';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BudgetPlannerPage from './pages/BudgetPlannerPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import VendorRegistrationPage from './pages/VendorRegistrationPage';

// Vendor Portal Layout & Pages
import { VendorPortalLayout } from './components/dashboard/VendorPortalLayout';
import { DashboardPage } from './pages/dashboard-page';
import { VerifyDocumentsPage } from './pages/verify-documents-page';
import { BookingsPage } from './pages/bookings-page';
import { CalendarPage } from './pages/calendar-page';
import { MessagesPage } from './pages/messages-page';
import { PortfolioPage } from './pages/portfolio-page';
import { PackagesPage } from './pages/packages-page';
import { ReviewsPage } from './pages/reviews-page';
import { EarningsPage } from './pages/earnings-page';
import { AnalyticsPage } from './pages/analytics-page';
import { DealsPage } from './pages/deals-page';
import { SettingsPage } from './pages/settings-page';
import { SupportPage } from './pages/support-page';
import { NotificationsPage } from './pages/notifications-page';

export default function App() {
  return (
    <MainAuthProvider>
      <DashboardAuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/vendors/:slug" element={<VendorDetailPage />} />
              <Route path="/book/:slug" element={<BookingPage />} />
              <Route path="/confirmation/:ref" element={<ConfirmationPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/vendor-registration" element={<VendorRegistrationPage />} />
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/budget-planner" element={<BudgetPlannerPage />} />
              <Route path="/category/:category" element={<CategoryDetailPage />} />

              {/* Vendor Portal Routes */}
              <Route path="/vendor-dashboard" element={<VendorPortalLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="verify-documents" element={<VerifyDocumentsPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="portfolio" element={<PortfolioPage />} />
                <Route path="packages" element={<PackagesPage />} />
                <Route path="reviews" element={<ReviewsPage />} />
                <Route path="earnings" element={<EarningsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="deals" element={<DealsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </DashboardAuthProvider>
    </MainAuthProvider>
  );
}
