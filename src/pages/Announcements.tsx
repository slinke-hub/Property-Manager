import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Megaphone, Plus, AlertTriangle, Info, Bell, Trash2 } from "lucide-react";

interface Announcement {
  id: string;
  user_id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
}

const Announcements = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { role } = useUserRole(user);
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchAnnouncements();
  }, [user]);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAnnouncements(data);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error(t("announcements.fillFields"));
      return;
    }
    const { error } = await supabase.from("announcements").insert({
      user_id: user!.id,
      title: title.trim(),
      content: content.trim(),
      priority,
    });
    if (error) {
      toast.error(t("announcements.createError"));
    } else {
      toast.success(t("announcements.createSuccess"));
      setTitle("");
      setContent("");
      setPriority("normal");
      setIsDialogOpen(false);
      fetchAnnouncements();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (!error) {
      toast.success(t("announcements.deleted"));
      fetchAnnouncements();
    }
  };

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case "urgent": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "important": return <Bell className="h-4 w-4 text-accent" />;
      default: return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "urgent": return <Badge variant="destructive">{t("announcements.urgent")}</Badge>;
      case "important": return <Badge className="bg-accent text-accent-foreground">{t("announcements.important")}</Badge>;
      default: return <Badge variant="secondary">{t("announcements.normal")}</Badge>;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
                <Megaphone className="h-3 w-3" />
                {t("announcements.badge")}
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{t("announcements.title")}</h1>
              <p className="text-muted-foreground">{t("announcements.subtitle")}</p>
            </div>
            {role === "admin" && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("announcements.create")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("announcements.createTitle")}</DialogTitle>
                    <DialogDescription>{t("announcements.createDesc")}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("announcements.titleLabel")}</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("announcements.titlePlaceholder")} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("announcements.contentLabel")}</Label>
                      <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={t("announcements.contentPlaceholder")} rows={5} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("announcements.priorityLabel")}</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">{t("announcements.normal")}</SelectItem>
                          <SelectItem value="important">{t("announcements.important")}</SelectItem>
                          <SelectItem value="urgent">{t("announcements.urgent")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common.close")}</Button>
                    <Button onClick={handleCreate}>{t("announcements.publish")}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader><div className="h-5 bg-muted rounded w-1/3" /><div className="h-3 bg-muted rounded w-1/4 mt-2" /></CardHeader>
                  <CardContent><div className="h-16 bg-muted rounded" /></CardContent>
                </Card>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Megaphone className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">{t("announcements.empty")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <Card key={a.id} className={`transition-all hover:shadow-md ${a.priority === "urgent" ? "border-destructive/30 bg-destructive/5" : a.priority === "important" ? "border-accent/30 bg-accent/5" : ""}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getPriorityIcon(a.priority)}
                        <div>
                          <CardTitle className="text-lg">{a.title}</CardTitle>
                          <CardDescription>{new Date(a.created_at).toLocaleDateString()}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(a.priority)}
                        {role === "admin" && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80 whitespace-pre-wrap">{a.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Announcements;
