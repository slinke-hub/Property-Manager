import { Outlet } from "react-router-dom";
import { SidebarContent } from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Menu, Home } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

export const AppLayout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isRTL, t } = useLanguage();

    return (
        <div className="min-h-screen bg-background flex w-full">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 fixed inset-y-0 z-50">
                <SidebarContent />
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col lg:ml-64 min-h-screen transition-all w-full max-w-full">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between h-14 px-4">
                    <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
                        <Home className="h-5 w-5 text-primary" />
                        <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            {t("nav.appName")}
                        </span>
                    </Link>

                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side={isRTL ? "right" : "left"} className="p-0 w-72">
                            <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
                        </SheetContent>
                    </Sheet>
                </header>

                {/* Page Content */}
                <main className="flex-1 w-full max-w-full overflow-hidden flex flex-col">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
