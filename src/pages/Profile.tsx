import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Footer from "@/components/Footer";
import { db } from "@/config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { User, Mail, Shield, Save, Loader2, Phone, Building, Hash, Bell } from "lucide-react";

const Profile = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { role } = useUserRole(user);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [building, setBuilding] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setIsLoading(true);
    const docRef = doc(db, "users", user!.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.full_name) setFullName(data.full_name);
      if (data.phone) setPhone(data.phone);
      if (data.unit_number) setUnitNumber(data.unit_number);
      if (data.building) setBuilding(data.building);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error(t("profile.nameRequired"));
      return;
    }
    setIsSaving(true);
    try {
      await setDoc(doc(db, "users", user!.id), {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        unit_number: unitNumber.trim() || null,
        building: building.trim() || null,
      }, { merge: true });
      toast.success(t("profile.saved"));
    } catch (error) {
      console.error("Profile save error:", error);
      toast.error(t("profile.saveError"));
    }
    setIsSaving(false);
  };

  const getRoleLabel = (r: string | null) => {
    switch (r) {
      case "admin": return t("profile.roleAdmin");
      case "owner": return t("profile.roleOwner");
      case "property_manager": return t("profile.roleManager");
      default: return t("profile.roleUser");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20 w-full">
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <div className="w-full space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
              <User className="h-3 w-3" />
              {t("profile.badge")}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("profile.title")}</h1>
            <p className="text-muted-foreground">{t("profile.subtitle")}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                {t("profile.accountInfo")}
              </CardTitle>
              <CardDescription>{t("profile.accountInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("auth.email")}</Label>
                <Input value={user.email || ""} disabled />
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t("profile.role")}:</span>
                <Badge variant="secondary">{getRoleLabel(role)}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t("profile.personalInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("auth.fullName")}</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("profile.enterName")}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {t("profile.phone")}
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("profile.phonePlaceholder")}
                  disabled={isLoading}
                  type="tel"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5" />
                    {t("profile.building")}
                  </Label>
                  <Input
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    placeholder={t("profile.buildingPlaceholder")}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" />
                    {t("profile.unitNumber")}
                  </Label>
                  <Input
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    placeholder={t("profile.unitPlaceholder")}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2 w-full sm:w-auto">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t("profile.save")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Manage how you receive alerts and reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Rent & Dues Reminders</Label>
                  <p className="text-sm text-muted-foreground">Receive reminders before dues are late.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Maintenance Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified about status changes to your requests.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between pb-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Community Announcements</Label>
                  <p className="text-sm text-muted-foreground">Alerts for building-wide events and notices.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
