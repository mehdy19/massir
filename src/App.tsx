import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import Auth from "./pages/Auth";
import UserHome from "./pages/UserHome";
import TripDetails from "./pages/TripDetails";
import MyBookings from "./pages/MyBookings";
import DriverDashboard from "./pages/DriverDashboard";
import NewTrip from "./pages/NewTrip";
import Account from "./pages/Account";
import TrackTrip from "./pages/TrackTrip";
import AdDetails from "./pages/AdDetails";
import DriverAds from "./pages/DriverAds";
import NewAd from "./pages/NewAd";
import BottomNav from "./components/BottomNav";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole?: "user" | "driver" }) => {
  const { user, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={userRole === "driver" ? "/driver" : "/"} />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to={userRole === "driver" ? "/driver" : "/"} /> : <Auth />} />
        
        {/* User Routes */}
        <Route path="/" element={<ProtectedRoute allowedRole="user"><UserHome /></ProtectedRoute>} />
        <Route path="/trip/:id" element={<ProtectedRoute allowedRole="user"><TripDetails /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute allowedRole="user"><MyBookings /></ProtectedRoute>} />
        <Route path="/track/:id" element={<ProtectedRoute allowedRole="user"><TrackTrip /></ProtectedRoute>} />
        <Route path="/ad/:id" element={<ProtectedRoute allowedRole="user"><AdDetails /></ProtectedRoute>} />
        
        {/* Driver Routes */}
        <Route path="/driver" element={<ProtectedRoute allowedRole="driver"><DriverDashboard /></ProtectedRoute>} />
        <Route path="/driver/new-trip" element={<ProtectedRoute allowedRole="driver"><NewTrip /></ProtectedRoute>} />
        <Route path="/driver/ads" element={<ProtectedRoute allowedRole="driver"><DriverAds /></ProtectedRoute>} />
        <Route path="/driver/new-ad" element={<ProtectedRoute allowedRole="driver"><NewAd /></ProtectedRoute>} />
        
        {/* Shared Routes */}
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
