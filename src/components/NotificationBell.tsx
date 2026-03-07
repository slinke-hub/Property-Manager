import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/config/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";

interface Notification {
  id: string;
  type: "announcement" | "overdue" | "maintenance_update";
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
    try {
      const announcementsQuery = query(
        collection(db, "announcements"),
        where("created_at", ">=", weekAgo.toISOString()),
        orderBy("created_at", "desc"),
        limit(5)
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      announcementsSnapshot.docs.forEach((d) => {
        const a = d.data();
        items.push({ id: d.id, type: "announcement", title: a.title, priority: a.priority, created_at: a.created_at });
      });

      // Fetch overdue dues
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const duesQuery = query(
        collection(db, "monthly_dues"),
        where("user_id", "==", user!.id),
        where("status", "==", "pending")
      );
      const duesSnapshot = await getDocs(duesQuery);

      const overdueDues = duesSnapshot.docs.filter(d => {
        const data = d.data();
        return data.year < currentYear || (data.year === currentYear && data.month < currentMonth);
      });

      if (overdueDues.length > 0) {
        items.push({
          id: "overdue",
          type: "overdue",
          title: t("notifications.overdueDues").replace("{count}", String(overdueDues.length)),
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }

    // Add mock maintenance update
    items.push({
      id: "maint_update",
      type: "maintenance_update",
      title: "Your request 'Leaking Faucet' is now correctly scheduled.",
      created_at: new Date().toISOString(),
    });

    // Sort by created_at desc
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
                to={n.type === "overdue" ? "/dues" : n.type === "maintenance_update" ? "/maintenance" : "/announcements"}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 p-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
              >
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.type === "overdue" ? "bg-destructive" : n.type === "maintenance_update" ? "bg-blue-500" : n.priority === "urgent" ? "bg-destructive" : n.priority === "important" ? "bg-amber-500" : "bg-primary"
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
