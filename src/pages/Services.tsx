import Navigation from "@/components/Navigation";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, Search } from "lucide-react";

const Services = () => {
  const { t } = useLanguage();
  const services = [
    {
      id: "1",
      name: "Quick Fix Plumbing",
      category: "Plumbing",
      rating: 4.8,
      phone: "(555) 123-4567",
      email: "contact@quickfix.com",
      specialties: ["Emergency Repairs", "Pipe Installation", "Drain Cleaning"],
      available: true,
    },
    {
      id: "2",
      name: "Elite HVAC Services",
      category: "HVAC",
      rating: 4.9,
      phone: "(555) 234-5678",
      email: "info@elitehvac.com",
      specialties: ["AC Repair", "Heating", "Maintenance"],
      available: true,
    },
    {
      id: "3",
      name: "Bright Spark Electrical",
      category: "Electrical",
      rating: 4.7,
      phone: "(555) 345-6789",
      email: "service@brightspark.com",
      specialties: ["Wiring", "Panel Upgrades", "Lighting"],
      available: false,
    },
    {
      id: "4",
      name: "Green Lawn Care",
      category: "Landscaping",
      rating: 4.6,
      phone: "(555) 456-7890",
      email: "hello@greenlawn.com",
      specialties: ["Mowing", "Trimming", "Seasonal Cleanup"],
      available: true,
    },
    {
      id: "5",
      name: "Professional Cleaners Co",
      category: "Cleaning",
      rating: 4.9,
      phone: "(555) 567-8901",
      email: "contact@proclean.com",
      specialties: ["Deep Cleaning", "Move-out", "Post-Construction"],
      available: true,
    },
    {
      id: "6",
      name: "Secure Lock Solutions",
      category: "Locksmith",
      rating: 4.8,
      phone: "(555) 678-9012",
      email: "help@securelock.com",
      specialties: ["Lock Changes", "Key Duplication", "Emergency Access"],
      available: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="container py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t("services.title")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("services.subtitle")}
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("services.addProvider")}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("services.search")}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Services;
