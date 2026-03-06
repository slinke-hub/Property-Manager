import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";

interface Notification {
  id: string;
  type: "announcement" | "overdue";
  title: string;
  priority?: string;
  created_at: string;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    const items: Notification[] = [];

    // Fetch recent announcements (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data: announcements } = await supabase
      .from("announcements")
      .select("id, title, priority, created_at")
      .gte("created_at", weekAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(5);

    if (announcements) {
      announcements.forEach((a) =>
        items.push({ id: a.id, type: "announcement", title: a.title, priority: a.priority, created_at: a.created_at })
      );
    }

    // Fetch overdue dues
    const now = new Date();
    const { data: overdueDues } = await supabase
      .from("monthly_dues")
      .select("id, month, year, amount")
      .eq("user_id", user!.id)
      .eq("status", "pending")
      .or(`year.lt.${now.getFullYear()},and(year.eq.${now.getFullYear()},month.lt.${now.getMonth() + 1})`);

    if (overdueDues && overdueDues.length > 0) {
      items.push({
        id: "overdue",
        type: "overdue",
        title: t("notifications.overdueDues").replace("{count}", String(overdueDues.length)),
        created_at: new Date().toISOString(),
      });
    }

    setNotifications(items);
  };

  const count = notifications.length;

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm">{t("notifications.title")}</h4>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">{t("notifications.empty")}</p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                to={n.type === "overdue" ? "/dues" : "/announcements"}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 p-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
              >
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                  n.type === "overdue" ? "bg-destructive" : n.priority === "urgent" ? "bg-destructive" : n.priority === "important" ? "bg-amber-500" : "bg-primary"
                }`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{n.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.type === "overdue" ? (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t("notifications.actionRequired")}</Badge>
                    ) : (
                      new Date(n.created_at).toLocaleDateString()
                    )}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
