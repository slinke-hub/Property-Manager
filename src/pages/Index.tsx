import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Users, ArrowRight, LogIn, Megaphone, MessageSquare, FileText, Wallet, Calendar, Home, Vote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-property.jpg";

const Index = () => {
  const { t } = useLanguage();

  const features = [
    { to: "/announcements", icon: Megaphone, title: t("home.announcements"), desc: t("home.announcementsDesc"), gradient: "from-primary to-primary/80" },
    { to: "/maintenance", icon: Wrench, title: t("home.trackMaintenance"), desc: t("home.trackMaintenanceDesc"), gradient: "from-accent to-accent/80" },
    { to: "/forum", icon: MessageSquare, title: t("home.communityForum"), desc: t("home.communityForumDesc"), gradient: "from-green-500 to-green-600" },
    { to: "/polls", icon: Vote, title: t("home.polls"), desc: t("home.pollsDesc"), gradient: "from-indigo-500 to-indigo-600" },
    { to: "/documents", icon: FileText, title: t("home.documents"), desc: t("home.documentsDesc"), gradient: "from-purple-500 to-purple-600" },
    { to: "/community-wallet", icon: Wallet, title: t("home.sharedWallet"), desc: t("home.sharedWalletDesc"), gradient: "from-primary to-primary/80" },
    { to: "/dues", icon: Calendar, title: t("home.duesPayments"), desc: t("home.duesPaymentsDesc"), gradient: "from-accent to-accent/80" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="container relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
          <div className="max-w-3xl space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20">
              <Home className="h-4 w-4" />
              {t("home.badge")}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              {t("home.title")}
              <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("home.titleHighlight")}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">{t("home.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/owner-dashboard">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  {t("home.goToDashboard")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  <LogIn className="h-4 w-4" />
                  {t("auth.signIn")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("home.quickActions")}</h2>
            <p className="text-muted-foreground">{t("home.quickActionsSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Link key={f.to} to={f.to} className="group">
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                    <CardHeader className="pb-3">
                      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-3 sm:mb-4`}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors">{f.title}</CardTitle>
                      <CardDescription className="text-sm">{f.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
