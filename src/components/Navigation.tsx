import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, Wrench, Briefcase, LayoutDashboard, LogIn, LogOut, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";

const Navigation = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/properties", label: t("nav.properties"), icon: Building2 },
    { to: "/maintenance", label: t("nav.maintenance"), icon: Wrench },
    { to: "/services", label: t("nav.services"), icon: Briefcase },
    { to: "/community-wallet", label: t("nav.communityWallet"), icon: Wallet },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            {t("nav.appName")}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  "hover:bg-secondary hover:text-foreground",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {user ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav.signOut")}</span>
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate("/auth")}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav.signIn")}</span>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
