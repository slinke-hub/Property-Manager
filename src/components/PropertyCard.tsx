import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, DollarSign } from "lucide-react";

interface PropertyCardProps {
  title: string;
  address: string;
  units: number;
  occupied: number;
  revenue: string;
  status: "active" | "maintenance" | "vacant";
  imageUrl?: string;
}

const PropertyCard = ({ title, address, units, occupied, revenue, status }: PropertyCardProps) => {
  const statusColors = {
    active: "bg-green-500/10 text-green-700 border-green-200",
    maintenance: "bg-amber-500/10 text-amber-700 border-amber-200",
    vacant: "bg-gray-500/10 text-gray-700 border-gray-200",
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg group cursor-pointer">
      <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="absolute bottom-4 left-4">
          <Badge className={statusColors[status]} variant="outline">
            {status}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3" />
          {address}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Units</span>
            </div>
            <p className="font-semibold text-foreground">{units}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-muted-foreground">Occupied</p>
            <p className="font-semibold text-foreground">
              {occupied}/{units}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>Revenue</span>
            </div>
            <p className="font-semibold text-foreground">{revenue}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
