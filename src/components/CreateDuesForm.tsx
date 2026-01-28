import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Users } from "lucide-react";

interface CreateDuesFormProps {
  onDuesCreated: () => void;
}

const CreateDuesForm = ({ onDuesCreated }: CreateDuesFormProps) => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);

  const months = [
    { value: "1", label: t("months.january") },
    { value: "2", label: t("months.february") },
    { value: "3", label: t("months.march") },
    { value: "4", label: t("months.april") },
    { value: "5", label: t("months.may") },
    { value: "6", label: t("months.june") },
    { value: "7", label: t("months.july") },
    { value: "8", label: t("months.august") },
    { value: "9", label: t("months.september") },
    { value: "10", label: t("months.october") },
    { value: "11", label: t("months.november") },
    { value: "12", label: t("months.december") },
  ];

  const years = ["2024", "2025", "2026", "2027"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !month || !year) {
      toast.error(t("dues.fillAllFields"));
      return;
    }

    setLoading(true);

    try {
      // Fetch all owners
      const { data: ownerRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "owner");

      if (rolesError) throw rolesError;

      if (!ownerRoles || ownerRoles.length === 0) {
        toast.error(t("dues.noOwnersFound"));
        setLoading(false);
        return;
      }

      // Check for existing dues for this month/year
      const { data: existingDues } = await supabase
        .from("monthly_dues")
        .select("user_id")
        .eq("month", parseInt(month))
        .eq("year", parseInt(year));

      const existingUserIds = new Set(existingDues?.map(d => d.user_id) || []);
      
      // Filter out owners who already have dues for this month
      const ownersToCreate = ownerRoles.filter(o => !existingUserIds.has(o.user_id));

      if (ownersToCreate.length === 0) {
        toast.info(t("dues.duesAlreadyExist"));
        setLoading(false);
        return;
      }

      // Create dues for each owner
      const duesEntries = ownersToCreate.map(owner => ({
        user_id: owner.user_id,
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        status: "pending",
      }));

      const { error: insertError } = await supabase
        .from("monthly_dues")
        .insert(duesEntries);

      if (insertError) throw insertError;

      toast.success(t("dues.duesCreatedSuccess").replace("{count}", ownersToCreate.length.toString()));
      setAmount("");
      setMonth("");
      onDuesCreated();
    } catch (error: any) {
      console.error("Error creating dues:", error);
      toast.error(t("dues.errorCreatingDues"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t("dues.createMonthlyDues")}
        </CardTitle>
        <CardDescription>{t("dues.createMonthlyDuesDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t("dues.amount")} (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">{t("dues.month")}</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder={t("dues.selectMonth")} />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">{t("dues.year")}</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder={t("dues.selectYear")} />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {loading ? t("common.loading") : t("dues.createDuesForAllOwners")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateDuesForm;
