import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Maintenance from "./pages/Maintenance";
import Services from "./pages/Services";
import Auth from "./pages/Auth";
import UserPortal from "./pages/UserPortal";
import AdminPortal from "./pages/AdminPortal";
import Wallet from "./pages/Wallet";
import CommunityWallet from "./pages/CommunityWallet";
import OwnerDashboard from "./pages/OwnerDashboard";
import DuesTracking from "./pages/DuesTracking";
import AdminReceiptReview from "./pages/AdminReceiptReview";
import Announcements from "./pages/Announcements";
import Forum from "./pages/Forum";
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/services" element={<Services />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/user-portal" element={<UserPortal />} />
              <Route path="/admin-portal" element={<AdminPortal />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/community-wallet" element={<CommunityWallet />} />
              <Route path="/owner-dashboard" element={<OwnerDashboard />} />
              <Route path="/dues" element={<DuesTracking />} />
              <Route path="/admin/receipts" element={<AdminReceiptReview />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/documents" element={<Documents />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
