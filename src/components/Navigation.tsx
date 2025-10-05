import { Link, useLocation } from "react-router-dom";
import { Building2, Wrench, Briefcase, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/properties", label: "Properties", icon: Building2 },
    { to: "/maintenance", label: "Maintenance", icon: Wrench },
    { to: "/services", label: "Services", icon: Briefcase },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            PropManager
          </span>
        </Link>

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
      </nav>
    </header>
  );
};

export default Navigation;
