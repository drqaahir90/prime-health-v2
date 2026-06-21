import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { initializeDefaults } from './lib/db';

// Public pages
import Layout from './components/Layout';
import Home from './pages/Home';
import { DoctorsPage, DoctorProfile } from './pages/Doctors';
import Services from './pages/Services';
import { BlogList, BlogDetail } from './pages/Blog';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import ConsultationForm from './pages/ConsultationForm';
import PaymentPage from './pages/PaymentPage';
import Login from './pages/Login';
import AdminTest from './pages/AdminTest';

// Admin
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import DoctorManager from './admin/DoctorManager';
import ServiceManager from './admin/ServiceManager';
import ConsultationManager from './admin/ConsultationManager';
import { BlogManager, FAQManager, TestimonialsManager, PosterManager, HomeManager } from './admin/ContentManagers';
import { PatientsManager, PrescriptionsManager } from './admin/PatientManagers';
import { SettingsManager, ThemeManager, TranslationManager, PaymentManager } from './admin/SettingsManagers';
import ContactPage from './admin/ContactPage';

// Initialize defaults on first load
initializeDefaults();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

// Main App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* DEBUG: Test route to verify routing works */}
      <Route path="/test" element={<AdminTest />} />
      
      {/* ============ ADMIN ROUTES ============ */}
      <Route path="/admin/login" element={<Login />} />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="home" element={<HomeManager />} />
        <Route path="doctors" element={<DoctorManager />} />
        <Route path="services" element={<ServiceManager />} />
        <Route path="blog" element={<BlogManager />} />
        <Route path="faq" element={<FAQManager />} />
        <Route path="testimonials" element={<TestimonialsManager />} />
        <Route path="posters" element={<PosterManager />} />
        <Route path="consultations" element={<ConsultationManager />} />
        <Route path="patients" element={<PatientsManager />} />
        <Route path="prescriptions" element={<PrescriptionsManager />} />
        <Route path="payments" element={<PaymentManager />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="settings" element={<SettingsManager />} />
        <Route path="translations" element={<TranslationManager />} />
        <Route path="theme" element={<ThemeManager />} />
      </Route>
      
      {/* ============ PUBLIC ROUTES ============ */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/doctors" element={<Layout><DoctorsPage /></Layout>} />
      <Route path="/doctors/:id" element={<Layout><DoctorProfile /></Layout>} />
      <Route path="/services" element={<Layout><Services /></Layout>} />
      <Route path="/blog" element={<Layout><BlogList /></Layout>} />
      <Route path="/blog/:id" element={<Layout><BlogDetail /></Layout>} />
      <Route path="/faq" element={<Layout><FAQ /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/consultation" element={<Layout><ConsultationForm /></Layout>} />
      <Route path="/payment/:id" element={<Layout><PaymentPage /></Layout>} />
      
      {/* ============ CATCH-ALL ============ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App with providers
export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AppRoutes />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  );
}
