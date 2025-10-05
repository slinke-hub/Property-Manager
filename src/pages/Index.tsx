import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Wrench, TrendingUp, Users, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-property.jpg";

const Index = () => {
  const { t } = useLanguage();
  
  const stats = [
    { label: t("stats.totalProperties"), value: "6", icon: Building2, trend: `+2 ${t("stats.thisMonth")}` },
    { label: t("stats.activeRequests"), value: "12", icon: Wrench, trend: `3 ${t("stats.urgent")}` },
    { label: t("stats.occupancyRate"), value: "91%", icon: Users, trend: `+5% ${t("stats.fromLastMonth")}` },
    { label: t("stats.monthlyRevenue"), value: "$296K", icon: TrendingUp, trend: `+12% ${t("stats.growth")}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="container relative py-24 sm:py-32">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t("home.badge")}
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              {t("home.title")}
              <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("home.titleHighlight")}
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              {t("home.subtitle")}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/properties">
                <Button size="lg" className="gap-2">
                  {t("home.viewProperties")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/maintenance">
                <Button size="lg" variant="outline" className="gap-2">
                  {t("home.maintenanceRequests")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>{stat.label}</CardDescription>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <CardTitle className="text-3xl">{stat.value}</CardTitle>
                    <p className="text-xs text-muted-foreground">{stat.trend}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container pb-24">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{t("home.quickActions")}</h2>
            <p className="text-muted-foreground">
              {t("home.quickActionsSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/properties" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {t("home.manageProperties")}
                  </CardTitle>
                  <CardDescription>
                    {t("home.managePropertiesDesc")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/maintenance" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center mb-4">
                    <Wrench className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {t("home.trackMaintenance")}
                  </CardTitle>
                  <CardDescription>
                    {t("home.trackMaintenanceDesc")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/services" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {t("home.serviceProviders")}
                  </CardTitle>
                  <CardDescription>
                    {t("home.serviceProvidersDesc")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
