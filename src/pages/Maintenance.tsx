import Navigation from "@/components/Navigation";
import MaintenanceCard from "@/components/MaintenanceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, Search } from "lucide-react";

const Maintenance = () => {
  const { t } = useLanguage();
  const requests = [
    {
      id: "1",
      title: "Leaking Faucet",
      property: "Sunset Apartments",
      unit: "2B",
      priority: "medium" as const,
      status: "pending" as const,
      createdAt: "2 hours ago",
      description: "Kitchen sink faucet is leaking continuously. Needs immediate attention.",
    },
    {
      id: "2",
      title: "HVAC Not Working",
      property: "Riverside Complex",
      unit: "5A",
      priority: "urgent" as const,
      status: "in-progress" as const,
      createdAt: "4 hours ago",
      description: "Air conditioning unit not producing cold air. Temperature rising.",
    },
    {
      id: "3",
      title: "Broken Window",
      property: "Garden View Suites",
      unit: "1C",
      priority: "high" as const,
      status: "pending" as const,
      createdAt: "1 day ago",
      description: "Bedroom window cracked, needs replacement for security.",
    },
    {
      id: "4",
      title: "Light Bulb Replacement",
      property: "Downtown Plaza",
      unit: "3D",
      priority: "low" as const,
      status: "completed" as const,
      createdAt: "2 days ago",
      description: "Hallway light bulb needs replacement.",
    },
    {
      id: "5",
      title: "Clogged Drain",
      property: "Metro Heights",
      unit: "4E",
      priority: "medium" as const,
      status: "in-progress" as const,
      createdAt: "5 hours ago",
      description: "Bathroom sink drain is clogged and draining slowly.",
    },
  ];

  const filterByStatus = (status: string) => {
    if (status === "all") return requests;
    return requests.filter((req) => req.status === status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="container py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t("maintenance.title")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("maintenance.subtitle")}
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("maintenance.newRequest")}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("maintenance.search")}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">{t("maintenance.allRequests")}</TabsTrigger>
            <TabsTrigger value="pending">{t("maintenance.pending")}</TabsTrigger>
            <TabsTrigger value="in-progress">{t("maintenance.inProgress")}</TabsTrigger>
            <TabsTrigger value="completed">{t("maintenance.completed")}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filterByStatus("all").map((request) => (
              <MaintenanceCard key={request.id} {...request} />
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filterByStatus("pending").map((request) => (
              <MaintenanceCard key={request.id} {...request} />
            ))}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            {filterByStatus("in-progress").map((request) => (
              <MaintenanceCard key={request.id} {...request} />
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filterByStatus("completed").map((request) => (
              <MaintenanceCard key={request.id} {...request} />
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Maintenance;
