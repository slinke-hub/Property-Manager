import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertCircle, CheckCircle, Clock, MapPin } from "lucide-react";

interface MaintenanceCardProps {
  id: string;
  title: string;
  property: string;
  unit: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
  description: string;
  vendor?: string;
}

const MaintenanceCard = ({
  title,
  property,
  unit,
  priority,
  status,
  createdAt,
  description,
  vendor,
}: MaintenanceCardProps) => {
  const { t } = useLanguage();

  const priorityConfig = {
    low: { color: "bg-blue-500/10 text-blue-700 border-blue-200", icon: Clock },
    medium: { color: "bg-yellow-500/10 text-yellow-700 border-yellow-200", icon: Clock },
    high: { color: "bg-orange-500/10 text-orange-700 border-orange-200", icon: AlertCircle },
    urgent: { color: "bg-red-500/10 text-red-700 border-red-200", icon: AlertCircle },
  };

  const statusConfig = {
    pending: { color: "bg-gray-500/10 text-gray-700 border-gray-200", icon: Clock },
    "in-progress": { color: "bg-blue-500/10 text-blue-700 border-blue-200", icon: Clock },
    completed: { color: "bg-green-500/10 text-green-700 border-green-200", icon: CheckCircle },
  };

  const PriorityIcon = priorityConfig[priority].icon;
  const StatusIcon = statusConfig[status].icon;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="flex flex-col gap-1 text-sm mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {property} - {t("maintenance.unit")} {unit}
              </div>
              {vendor && (
                <div className="flex items-center gap-1 text-primary">
                  <CheckCircle className="h-3 w-3" />
                  Assigned to: {vendor}
                </div>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={priorityConfig[priority].color} variant="outline">
              <PriorityIcon className="h-3 w-3 mr-1" />
              {t(`maintenance.priority.${priority}`)}
            </Badge>
            <Badge className={statusConfig[status].color} variant="outline">
              <StatusIcon className="h-3 w-3 mr-1" />
              {t(`maintenance.status.${status}`)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">{t("maintenance.created")} {createdAt}</span>
          <Button size="sm" variant="outline">{t("maintenance.viewDetails")}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceCard;
