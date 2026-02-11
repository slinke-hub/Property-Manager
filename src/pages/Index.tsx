import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Users, ArrowRight, LogIn, Megaphone, MessageSquare, FileText, Wallet, Calendar, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-property.jpg";

const Index = () => {
  const { t } = useLanguage();

  const features = [
    { to: "/announcements", icon: Megaphone, title: t("home.announcements"), desc: t("home.announcementsDesc"), gradient: "from-primary to-primary/80" },
    { to: "/maintenance", icon: Wrench, title: t("home.trackMaintenance"), desc: t("home.trackMaintenanceDesc"), gradient: "from-accent to-accent/80" },
    { to: "/forum", icon: MessageSquare, title: t("home.communityForum"), desc: t("home.communityForumDesc"), gradient: "from-green-500 to-green-600" },
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
        <div className="container relative py-24 sm:py-32">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20">
              <Home className="h-4 w-4" />
              {t("home.badge")}
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              {t("home.title")}
              <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("home.titleHighlight")}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">{t("home.subtitle")}</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/owner-dashboard">
                <Button size="lg" className="gap-2">
                  {t("home.goToDashboard")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  {t("auth.signIn")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container pb-24">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{t("home.quickActions")}</h2>
            <p className="text-muted-foreground">{t("home.quickActionsSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Link key={f.to} to={f.to} className="group">
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                    <CardHeader>
                      <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">{f.title}</CardTitle>
                      <CardDescription>{f.desc}</CardDescription>
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
