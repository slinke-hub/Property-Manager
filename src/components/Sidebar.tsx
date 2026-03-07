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

interface SidebarProps {
    onNavigate?: () => void;
    className?: string;
}

export const SidebarContent = ({ onNavigate = () => { }, className }: SidebarProps) => {
    const location = useLocation();
    const { t, isRTL } = useLanguage();
    const { user, signOut } = useAuth();
    const { role } = useUserRole(user);
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
        onNavigate();
    };

    const baseNavItems = [
        { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
        { to: "/announcements", label: t("nav.announcements"), icon: Megaphone },
        { to: "/maintenance", label: t("nav.maintenance"), icon: Wrench },
        { to: "/messages", label: "Messages", icon: MessageSquare },
        { to: "/forum", label: t("nav.forum"), icon: MessageSquare },
        { to: "/polls", label: t("nav.polls"), icon: Vote },
        { to: "/amenities", label: "Amenities", icon: Calendar },
        { to: "/documents", label: t("nav.documents"), icon: FileText },
        { to: "/community-wallet", label: t("nav.communityWallet"), icon: Wallet },
    ];

    const roleNavItems = [];

    if (user && (role === "owner" || role === "admin")) {
        roleNavItems.push(
            { to: "/owner-dashboard", label: t("nav.ownerDashboard"), icon: Home },
            { to: "/dues", label: t("nav.dues"), icon: Calendar }
        );
    }

    if (user && role === "admin") {
        roleNavItems.push(
            { to: "/admin/receipts", label: t("nav.adminReceipts"), icon: Receipt },
            { to: "/admin-portal", label: t("portal.admin.title"), icon: Briefcase },
            { to: "/vendors", label: "Vendors", icon: Briefcase },
            { to: "/leases", label: "Leases", icon: FileText },
            { to: "/analytics", label: "Analytics", icon: LayoutDashboard }
        );
    }

    const allNavItems = [...baseNavItems, ...roleNavItems];

    return (
        <div className={cn("flex flex-col h-full bg-background border-r border-border", className)}>
            <div className="h-14 sm:h-16 flex items-center px-4 sm:px-6 border-b border-border shrink-0">
                <Link to="/" onClick={onNavigate} className="flex items-center gap-2 font-semibold text-lg sm:text-xl shrink-0">
                    <Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {t("nav.appName")}
                    </span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
                {allNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full",
                                "hover:bg-secondary hover:text-foreground",
                                isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground",
                                isRTL && "flex-row-reverse"
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-border mt-auto space-y-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <ThemeSwitcher />
                        <LanguageSwitcher />
                    </div>
                    {user && <NotificationBell />}
                </div>

                {user ? (
                    <div className="space-y-2 mt-2">
                        <Button variant="ghost" className="w-full gap-2 justify-start" onClick={() => { navigate("/profile"); onNavigate(); }}>
                            <User className="h-4 w-4" />
                            {t("profile.badge")}
                        </Button>
                        <Button variant="outline" className="w-full gap-2 justify-start mt-2" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4" />
                            {t("nav.signOut")}
                        </Button>
                    </div>
                ) : (
                    <div className="pt-2">
                        <Button variant="default" className="w-full gap-2" onClick={() => { navigate("/auth"); onNavigate(); }}>
                            <LogIn className="h-4 w-4" />
                            {t("nav.signIn")}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
