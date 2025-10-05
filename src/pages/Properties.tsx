import Navigation from "@/components/Navigation";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

const Properties = () => {
  const properties = [
    {
      id: "1",
      title: "Sunset Apartments",
      address: "123 Main St, Downtown",
      units: 24,
      occupied: 22,
      revenue: "$48,000",
      status: "active" as const,
    },
    {
      id: "2",
      title: "Riverside Complex",
      address: "456 River Rd, Westside",
      units: 36,
      occupied: 32,
      revenue: "$72,000",
      status: "active" as const,
    },
    {
      id: "3",
      title: "Garden View Suites",
      address: "789 Park Ave, Eastside",
      units: 18,
      occupied: 16,
      revenue: "$36,000",
      status: "maintenance" as const,
    },
    {
      id: "4",
      title: "Downtown Plaza",
      address: "321 Center St, Downtown",
      units: 42,
      occupied: 40,
      revenue: "$84,000",
      status: "active" as const,
    },
    {
      id: "5",
      title: "Lakeside Residences",
      address: "654 Lake Dr, Northside",
      units: 30,
      occupied: 0,
      revenue: "$0",
      status: "vacant" as const,
    },
    {
      id: "6",
      title: "Metro Heights",
      address: "987 Metro Blvd, Uptown",
      units: 28,
      occupied: 25,
      revenue: "$56,000",
      status: "active" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="container py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Properties</h1>
            <p className="text-muted-foreground mt-2">
              Manage your real estate portfolio
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Properties;
