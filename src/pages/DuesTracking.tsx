import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CreateDuesForm from "@/components/CreateDuesForm";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, CheckCircle, XCircle, Clock, Check } from "lucide-react";
import { toast } from "sonner";

interface DuesData {
  id: string;
  user_id: string;
  user_email?: string;
  month: number;
  year: number;
  amount: number;
  status: string;
  paid_at: string | null;
}

interface ProfileData {
  user_id: string;
  full_name: string | null;
}

const DuesTracking = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole(user);
  const navigate = useNavigate();
  
  const [myDues, setMyDues] = useState<DuesData[]>([]);
  const [allDues, setAllDues] = useState<DuesData[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDues();
    }
  }, [user, role, selectedYear]);

  const fetchDues = async () => {
    if (!user) return;

    // Fetch my dues
    const { data: myDuesData } = await supabase
      .from("monthly_dues")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", selectedYear)
      .order("month", { ascending: true });
    
    if (myDuesData) setMyDues(myDuesData);

    // If admin, fetch all dues
    if (role === "admin") {
      const { data: allDuesData } = await supabase
        .from("monthly_dues")
        .select("*")
        .eq("year", selectedYear)
        .order("month", { ascending: true });
      
      if (allDuesData) {
        setAllDues(allDuesData);
        
        // Fetch profiles for user names
        const userIds = [...new Set(allDuesData.map((d) => d.user_id))];
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", userIds);
          
          if (profilesData) {
            const profileMap: Record<string, string> = {};
            profilesData.forEach((p: ProfileData) => {
              profileMap[p.user_id] = p.full_name || "Unknown User";
            });
            setProfiles(profileMap);
          }
        }
      }
    }
  };

  const handleMarkAsPaid = async (dueId: string) => {
    try {
      const { error } = await supabase
        .from("monthly_dues")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", dueId);

      if (error) throw error;

      toast.success(t("dues.markAsPaidSuccess"));
      fetchDues();
    } catch (error) {
      console.error("Error marking due as paid:", error);
      toast.error(t("dues.markAsPaidError"));
    }
  };
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "overdue":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getMonthName = (month: number) => {
    const monthKeys = [
      "months.january", "months.february", "months.march", "months.april",
      "months.may", "months.june", "months.july", "months.august",
      "months.september", "months.october", "months.november", "months.december"
    ];
    return t(monthKeys[month - 1]);
  };

  const calculateYearlyTotal = (dues: DuesData[]) => {
    return dues.reduce((sum, d) => sum + d.amount, 0);
  };

  const calculatePaidTotal = (dues: DuesData[]) => {
    return dues.filter((d) => d.status === "paid").reduce((sum, d) => sum + d.amount, 0);
  };

  if (authLoading || roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) return null;

  const years = [2024, 2025, 2026];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              {t("dues.title")}
            </h1>
            <p className="text-muted-foreground mt-2">{t("dues.subtitle")}</p>
          </div>

          {/* Year Selector */}
          <div className="flex gap-2">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedYear === year
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          <Tabs defaultValue="my-dues">
            <TabsList>
              <TabsTrigger value="my-dues">{t("dues.myDues")}</TabsTrigger>
              {role === "admin" && (
                <TabsTrigger value="all-dues">{t("dues.allDues")}</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="my-dues" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t("dues.yearlyTotal")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">€{calculateYearlyTotal(myDues).toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t("dues.paidTotal")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      €{calculatePaidTotal(myDues).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t("dues.pendingTotal")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-yellow-600">
                      €{(calculateYearlyTotal(myDues) - calculatePaidTotal(myDues)).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Dues Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {t("dues.monthlyBreakdown")}
                  </CardTitle>
                  <CardDescription>{t("dues.monthlyBreakdownDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {myDues.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      {t("dues.noDues")}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("dues.month")}</TableHead>
                          <TableHead>{t("dues.amount")}</TableHead>
                          <TableHead>{t("dues.status")}</TableHead>
                          <TableHead>{t("dues.paidDate")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myDues.map((due) => (
                          <TableRow key={`${due.month}-${due.year}`}>
                            <TableCell>{getMonthName(due.month)}</TableCell>
                            <TableCell>€{due.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(due.status)}
                                <span className="capitalize">{t(`dues.status${due.status.charAt(0).toUpperCase() + due.status.slice(1)}`)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {due.paid_at
                                ? new Date(due.paid_at).toLocaleDateString()
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {role === "admin" && (
              <TabsContent value="all-dues" className="space-y-6">
                {/* Create Dues Form for Admins */}
                <CreateDuesForm onDuesCreated={fetchDues} />

                {/* Admin Summary */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t("dues.totalExpected")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        €{calculateYearlyTotal(allDues).toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t("dues.totalCollected")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">
                        €{calculatePaidTotal(allDues).toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t("dues.totalOutstanding")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-red-600">
                        €{(calculateYearlyTotal(allDues) - calculatePaidTotal(allDues)).toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* All Owners Dues Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("dues.allOwnersDues")}</CardTitle>
                    <CardDescription>{t("dues.allOwnersDuesDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {allDues.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        {t("dues.noDues")}
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("dues.owner")}</TableHead>
                            <TableHead>{t("dues.month")}</TableHead>
                            <TableHead>{t("dues.amount")}</TableHead>
                            <TableHead>{t("dues.status")}</TableHead>
                            <TableHead>{t("dues.paidDate")}</TableHead>
                            <TableHead>{t("dues.actions")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allDues.map((due, index) => (
                            <TableRow key={`${due.user_id}-${due.month}-${due.year}-${index}`}>
                              <TableCell>{profiles[due.user_id] || due.user_id}</TableCell>
                              <TableCell>{getMonthName(due.month)}</TableCell>
                              <TableCell>€{due.amount.toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(due.status)}
                                  <span className="capitalize">{t(`dues.status${due.status.charAt(0).toUpperCase() + due.status.slice(1)}`)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {due.paid_at
                                  ? new Date(due.paid_at).toLocaleDateString()
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {due.status !== "paid" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMarkAsPaid(due.id)}
                                    className="gap-1"
                                  >
                                    <Check className="h-3 w-3" />
                                    {t("dues.markAsPaid")}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DuesTracking;
