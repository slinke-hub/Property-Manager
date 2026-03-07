import { useState } from "react";
import Footer from "@/components/Footer";
import MaintenanceCard from "@/components/MaintenanceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

const Maintenance = () => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState("");
  const [reqDesc, setReqDesc] = useState("");
  const [reqProperty, setReqProperty] = useState("");
  const [reqPriority, setReqPriority] = useState("medium");

  const requests = [
    { id: "1", title: "Leaking Faucet", property: "Sunset Apartments", unit: "2B", priority: "medium" as const, status: "pending" as const, createdAt: "2 hours ago", description: "Kitchen sink faucet is leaking continuously." },
    { id: "2", title: "HVAC Not Working", property: "Riverside Complex", unit: "5A", priority: "urgent" as const, status: "in-progress" as const, createdAt: "4 hours ago", description: "Air conditioning unit not producing cold air.", vendor: "Crystal Clear HVAC" },
    { id: "3", title: "Broken Window", property: "Garden View Suites", unit: "1C", priority: "high" as const, status: "pending" as const, createdAt: "1 day ago", description: "Bedroom window cracked, needs replacement." },
    { id: "4", title: "Light Bulb Replacement", property: "Downtown Plaza", unit: "3D", priority: "low" as const, status: "completed" as const, createdAt: "2 days ago", description: "Hallway light bulb needs replacement.", vendor: "ElectraServe Solutions" },
    { id: "5", title: "Clogged Drain", property: "Metro Heights", unit: "4E", priority: "medium" as const, status: "in-progress" as const, createdAt: "5 hours ago", description: "Bathroom sink drain is clogged.", vendor: "QuickFix Plumbing" },
  ];

  const filterByStatus = (status: string) => {
    if (status === "all") return requests;
    return requests.filter((req) => req.status === status);
  };

  const handleSubmitRequest = () => {
    if (!reqTitle.trim() || !reqDesc.trim()) {
      toast.error(t("maintenanceForm.fillFields"));
      return;
    }
    toast.success(t("maintenanceForm.submitSuccess"));
    setReqTitle("");
    setReqDesc("");
    setReqProperty("");
    setReqPriority("medium");
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-b from-background to-secondary/20">
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t("maintenance.title")}</h1>
            <p className="text-muted-foreground mt-2">{t("maintenance.subtitle")}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("maintenance.newRequest")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("maintenanceForm.createTitle")}</DialogTitle>
                <DialogDescription>{t("maintenanceForm.createDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("maintenanceForm.titleLabel")}</Label>
                  <Input value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} placeholder={t("maintenanceForm.titlePlaceholder")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("maintenanceForm.descLabel")}</Label>
                  <Textarea value={reqDesc} onChange={(e) => setReqDesc(e.target.value)} placeholder={t("maintenanceForm.descPlaceholder")} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>{t("maintenanceForm.propertyLabel")}</Label>
                  <Input value={reqProperty} onChange={(e) => setReqProperty(e.target.value)} placeholder={t("maintenanceForm.propertyPlaceholder")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("maintenanceForm.priorityLabel")}</Label>
                  <Select value={reqPriority} onValueChange={setReqPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("maintenanceForm.low")}</SelectItem>
                      <SelectItem value="medium">{t("maintenanceForm.medium")}</SelectItem>
                      <SelectItem value="high">{t("maintenanceForm.high")}</SelectItem>
                      <SelectItem value="urgent">{t("maintenanceForm.urgent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common.close")}</Button>
                <Button onClick={handleSubmitRequest}>{t("maintenanceForm.submit")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("maintenance.search")} className="pl-9" />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">{t("maintenance.allRequests")}</TabsTrigger>
            <TabsTrigger value="pending">{t("maintenance.pending")}</TabsTrigger>
            <TabsTrigger value="in-progress">{t("maintenance.inProgress")}</TabsTrigger>
            <TabsTrigger value="completed">{t("maintenance.completed")}</TabsTrigger>
          </TabsList>
          {["all", "pending", "in-progress", "completed"].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {filterByStatus(status).map((request) => (
                <MaintenanceCard key={request.id} {...request} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Maintenance;
