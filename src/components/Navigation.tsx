import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, Wrench, Briefcase, LayoutDashboard, LogIn, LogOut, Wallet, Receipt, Calendar, Home, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const { t, isRTL } = useLanguage();
  const { user, signOut } = useAuth();
  const { role } = useUserRole(user);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Base nav items visible to all
  const baseNavItems = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/properties", label: t("nav.properties"), icon: Building2 },
    { to: "/maintenance", label: t("nav.maintenance"), icon: Wrench },
    { to: "/services", label: t("nav.services"), icon: Briefcase },
    { to: "/community-wallet", label: t("nav.communityWallet"), icon: Wallet },
  ];

  // Role-specific nav items
  const roleNavItems = [];
  
  if (user && role === "owner") {
    roleNavItems.push(
      { to: "/owner-dashboard", label: t("nav.ownerDashboard"), icon: Home },
      { to: "/dues", label: t("nav.dues"), icon: Calendar }
    );
  }
  
  if (user && role === "admin") {
    roleNavItems.push(
      { to: "/admin/receipts", label: t("nav.adminReceipts"), icon: Receipt },
      { to: "/dues", label: t("nav.dues"), icon: Calendar }
    );
  }

  const allNavItems = [...baseNavItems, ...roleNavItems];

  const NavLinks = ({ mobile = false, onItemClick = () => {} }) => (
    <>
      {allNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to;
        
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              "hover:bg-secondary hover:text-foreground",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground",
              mobile && "w-full"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            {t("nav.appName")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
            <NavLinks />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
          
          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">{t("nav.signOut")}</span>
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate("/auth")}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden md:inline">{t("nav.signIn")}</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                <NavLinks mobile onItemClick={() => setMobileMenuOpen(false)} />
                
                <div className="border-t border-border pt-4 mt-4">
                  {user ? (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2" 
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      {t("nav.signOut")}
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      className="w-full gap-2" 
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogIn className="h-4 w-4" />
                      {t("nav.signIn")}
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
