import { Link, useLocation, useNavigate } from "react-router-dom";
import { Wrench, Briefcase, LogIn, LogOut, Wallet, Receipt, Calendar, Home, Menu, Megaphone, MessageSquare, FileText, LayoutDashboard, Vote, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

  const baseNavItems = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/announcements", label: t("nav.announcements"), icon: Megaphone },
    { to: "/maintenance", label: t("nav.maintenance"), icon: Wrench },
    { to: "/forum", label: t("nav.forum"), icon: MessageSquare },
    { to: "/polls", label: t("nav.polls"), icon: Vote },
    { to: "/documents", label: t("nav.documents"), icon: FileText },
    { to: "/community-wallet", label: t("nav.communityWallet"), icon: Wallet },
  ];

  const roleNavItems: { to: string; label: string; icon: typeof Home }[] = [];

  if (user && (role === "owner" || role === "admin")) {
    roleNavItems.push(
      { to: "/owner-dashboard", label: t("nav.ownerDashboard"), icon: Home },
      { to: "/dues", label: t("nav.dues"), icon: Calendar }
    );
  }

  if (user && role === "admin") {
    roleNavItems.push(
      { to: "/admin/receipts", label: t("nav.adminReceipts"), icon: Receipt }
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
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              "hover:bg-secondary hover:text-foreground",
              isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground",
              mobile && "w-full"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg sm:text-xl shrink-0">
          <Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hidden sm:inline">
            {t("nav.appName")}
          </span>
        </Link>

        <div className="hidden xl:flex items-center gap-1 overflow-x-auto">
          <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
            <NavLinks />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationBell />
          <ThemeSwitcher />
          <LanguageSwitcher />
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} className="hidden md:flex">
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">{t("nav.signOut")}</span>
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate("/auth")} className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden md:inline">{t("nav.signIn")}</span>
              </Button>
            )}
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="xl:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className="w-72 overflow-y-auto">
              <div className="flex flex-col gap-4 mt-8">
                <NavLinks mobile onItemClick={() => setMobileMenuOpen(false)} />
                <div className="border-t border-border pt-4 mt-4 space-y-2">
                  {user && (
                    <Button variant="ghost" className="w-full gap-2 justify-start" onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}>
                      <User className="h-4 w-4" />
                      {t("profile.badge")}
                    </Button>
                  )}
                  {user ? (
                    <Button variant="outline" className="w-full gap-2" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                      <LogOut className="h-4 w-4" />
                      {t("nav.signOut")}
                    </Button>
                  ) : (
                    <Button variant="default" className="w-full gap-2" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}>
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
