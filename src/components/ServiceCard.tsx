import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Star } from "lucide-react";

interface ServiceCardProps {
  name: string;
  category: string;
  rating: number;
  phone: string;
  email: string;
  specialties: string[];
  available: boolean;
}

const ServiceCard = ({
  name,
  category,
  rating,
  phone,
  email,
  specialties,
  available,
}: ServiceCardProps) => {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>{category}</CardDescription>
          </div>
          <Badge variant={available ? "default" : "secondary"}>
            {available ? "Available" : "Busy"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span className="font-semibold">{rating.toFixed(1)}</span>
          <span className="text-muted-foreground">/5.0</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{email}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Specialties</p>
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <Badge key={specialty} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        <Button className="w-full" size="sm">Schedule Service</Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
