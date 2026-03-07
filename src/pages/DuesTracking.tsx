import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import CreateDuesForm from "@/components/CreateDuesForm";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar, CheckCircle, XCircle, Clock, Check, AlertTriangle,
  TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight,
  DollarSign, Users, BarChart3, Receipt
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  const [isLoading, setIsLoading] = useState(true);

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

  // Auto-detect overdue dues on load
  useEffect(() => {
    if (myDues.length > 0) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const overdueDues = myDues.filter(
        (d) =>
          d.status === "pending" &&
          (d.year < currentYear || (d.year === currentYear && d.month < currentMonth))
      );
      if (overdueDues.length > 0) {
        toast.warning(
          t("dues.overdueWarning").replace("{count}", overdueDues.length.toString()),
          { duration: 6000 }
        );
      }
    }
  }, [myDues]);

  const fetchDues = async () => {
    if (!user) return;
    setIsLoading(true);

    const { data: myDuesData } = await supabase
      .from("monthly_dues")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", selectedYear)
      .order("month", { ascending: true });

    if (myDuesData) setMyDues(myDuesData);

    if (role === "admin") {
      const { data: allDuesData } = await supabase
        .from("monthly_dues")
        .select("*")
        .eq("year", selectedYear)
        .order("month", { ascending: true });

      if (allDuesData) {
        setAllDues(allDuesData);
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
    setIsLoading(false);
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

  const getMonthName = (month: number) => {
    const monthKeys = [
      "months.january", "months.february", "months.march", "months.april",
      "months.may", "months.june", "months.july", "months.august",
      "months.september", "months.october", "months.november", "months.december"
    ];
    return t(monthKeys[month - 1]);
  };

  const getMonthShort = (month: number) => {
    return getMonthName(month).substring(0, 3);
  };

  // Computed stats
  const stats = useMemo(() => {
    const yearlyTotal = myDues.reduce((sum, d) => sum + d.amount, 0);
    const paidTotal = myDues.filter((d) => d.status === "paid").reduce((sum, d) => sum + d.amount, 0);
    const pendingTotal = yearlyTotal - paidTotal;
    const paidCount = myDues.filter((d) => d.status === "paid").length;
    const totalCount = myDues.length;
    const progressPercent = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const overdueDues = myDues.filter(
      (d) => d.status === "pending" &&
        (d.year < currentYear || (d.year === currentYear && d.month < currentMonth))
    );

    return { yearlyTotal, paidTotal, pendingTotal, paidCount, totalCount, progressPercent, overdueDues };
  }, [myDues]);

  const adminStats = useMemo(() => {
    const yearlyTotal = allDues.reduce((sum, d) => sum + d.amount, 0);
    const paidTotal = allDues.filter((d) => d.status === "paid").reduce((sum, d) => sum + d.amount, 0);
    const pendingTotal = yearlyTotal - paidTotal;
    const uniqueUsers = new Set(allDues.map(d => d.user_id)).size;
    const collectionRate = yearlyTotal > 0 ? (paidTotal / yearlyTotal) * 100 : 0;
    return { yearlyTotal, paidTotal, pendingTotal, uniqueUsers, collectionRate };
  }, [allDues]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex flex-col w-full">
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-6 w-96" />
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  const years = [2024, 2025, 2026];

  return (
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-b from-background to-secondary/20">
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
                <Calendar className="h-3 w-3" />
                {t("dues.title")}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {t("dues.title")}
              </h1>
              <p className="text-muted-foreground text-lg">{t("dues.subtitle")}</p>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedYear === year
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="my-dues" className="space-y-6">
            <TabsList className="bg-secondary/80 border border-border p-1 h-auto">
              <TabsTrigger value="my-dues" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 py-2.5">
                <Wallet className="h-4 w-4 mr-2" />
                {t("dues.myDues")}
              </TabsTrigger>
              {role === "admin" && (
                <TabsTrigger value="all-dues" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 py-2.5">
                  <Users className="h-4 w-4 mr-2" />
                  {t("dues.allDues")}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="my-dues" className="space-y-6">
              {/* Overdue Alert */}
              {stats.overdueDues.length > 0 && (
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="font-semibold">{t("dues.overdueAlert")}</AlertTitle>
                  <AlertDescription>
                    {t("dues.overdueAlertDesc")
                      .replace("{count}", stats.overdueDues.length.toString())
                      .replace("{amount}", `€${stats.overdueDues.reduce((s, d) => s + d.amount, 0).toFixed(2)}`)}
                  </AlertDescription>
                </Alert>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-primary/10 via-background to-background">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-6 translate-x-6" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <CardDescription className="text-xs font-medium uppercase tracking-wider">
                        {t("dues.yearlyTotal")}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold tracking-tight">€{stats.yearlyTotal.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedYear}</p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-green-500/10 via-background to-background">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -translate-y-6 translate-x-6" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      </div>
                      <CardDescription className="text-xs font-medium uppercase tracking-wider">
                        {t("dues.paidTotal")}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold tracking-tight text-green-600">€{stats.paidTotal.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.paidCount} / {stats.totalCount} {t("dues.month").toLowerCase()}s</p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-amber-500/10 via-background to-background">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -translate-y-6 translate-x-6" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <ArrowDownRight className="h-4 w-4 text-amber-600" />
                      </div>
                      <CardDescription className="text-xs font-medium uppercase tracking-wider">
                        {t("dues.pendingTotal")}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold tracking-tight text-amber-600">€{stats.pendingTotal.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.overdueDues.length} {t("dues.overdueAlert").toLowerCase()}</p>
                  </CardContent>
                </Card>

                {/* Progress Card */}
                <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-accent/10 via-background to-background">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -translate-y-6 translate-x-6" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-accent" />
                      </div>
                      <CardDescription className="text-xs font-medium uppercase tracking-wider">
                        {t("dues.progress") || "Progress"}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-3xl font-bold tracking-tight">{Math.round(stats.progressPercent)}%</p>
                    <Progress value={stats.progressPercent} className="h-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Timeline */}
              <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                        {t("dues.monthlyBreakdown")}
                      </CardTitle>
                      <CardDescription className="mt-1">{t("dues.monthlyBreakdownDesc")}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stats.paidCount}/{stats.totalCount} {t("dues.paidTotal").toLowerCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-6 space-y-3">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                    </div>
                  ) : myDues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium">{t("dues.noDues")}</p>
                      <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs">
                        No dues have been assigned for {selectedYear} yet.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {myDues.map((due) => {
                        const now = new Date();
                        const isOverdue = due.status === "pending" &&
                          (due.year < now.getFullYear() || (due.year === now.getFullYear() && due.month < now.getMonth() + 1));
                        const isCurrent = due.year === now.getFullYear() && due.month === now.getMonth() + 1;

                        return (
                          <div
                            key={`${due.month}-${due.year}`}
                            className={`flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/30 ${isCurrent ? "bg-primary/5 border-l-2 border-l-primary" : ""
                              } ${isOverdue ? "bg-destructive/5 border-l-2 border-l-destructive" : ""}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold ${due.status === "paid"
                                  ? "bg-green-500/10 text-green-600"
                                  : isOverdue
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                {getMonthShort(due.month)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{getMonthName(due.month)} {due.year}</p>
                                <p className="text-xs text-muted-foreground">
                                  {due.paid_at
                                    ? `${t("dues.paidDate")}: ${new Date(due.paid_at).toLocaleDateString()}`
                                    : isCurrent ? "Current month" : isOverdue ? t("dues.overdueAlert") : "Upcoming"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <p className="font-semibold text-lg tabular-nums">€{due.amount.toFixed(2)}</p>
                              <Badge
                                variant={due.status === "paid" ? "default" : isOverdue ? "destructive" : "secondary"}
                                className={`capitalize min-w-[80px] justify-center ${due.status === "paid" ? "bg-green-500/90 hover:bg-green-500" : ""
                                  }`}
                              >
                                {due.status === "paid" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {isOverdue && due.status !== "paid" && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {!isOverdue && due.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                {t(`dues.status${due.status.charAt(0).toUpperCase() + due.status.slice(1)}`)}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {role === "admin" && (
              <TabsContent value="all-dues" className="space-y-6">
                {/* Create Dues Form */}
                <CreateDuesForm onDuesCreated={fetchDues} />

                {/* Admin Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 via-background to-background">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <CardDescription className="text-xs font-medium uppercase tracking-wider">
                          {t("dues.totalExpected")}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold tracking-tight">€{adminStats.yearlyTotal.toFixed(2)}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md bg-gradient-to-br from-green-500/10 via-background to-background">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <CardDescription className="text-xs font-medium uppercase tracking-wider">
                          {t("dues.totalCollected")}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold tracking-tight text-green-600">€{adminStats.paidTotal.toFixed(2)}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md bg-gradient-to-br from-destructive/10 via-background to-background">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <ArrowDownRight className="h-4 w-4 text-destructive" />
                        </div>
                        <CardDescription className="text-xs font-medium uppercase tracking-wider">
                          {t("dues.totalOutstanding")}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold tracking-tight text-destructive">€{adminStats.pendingTotal.toFixed(2)}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md bg-gradient-to-br from-accent/10 via-background to-background">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-accent" />
                        </div>
                        <CardDescription className="text-xs font-medium uppercase tracking-wider">
                          Collection Rate
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-3xl font-bold tracking-tight">{Math.round(adminStats.collectionRate)}%</p>
                      <Progress value={adminStats.collectionRate} className="h-2" />
                    </CardContent>
                  </Card>
                </div>

                {/* All Owners Dues Table */}
                <Card className="border-0 shadow-md overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Users className="h-5 w-5 text-primary" />
                          {t("dues.allOwnersDues")}
                        </CardTitle>
                        <CardDescription className="mt-1">{t("dues.allOwnersDuesDesc")}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {adminStats.uniqueUsers} owners
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {allDues.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Receipt className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">{t("dues.noDues")}</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                              <TableHead className="font-semibold">{t("dues.owner")}</TableHead>
                              <TableHead className="font-semibold">{t("dues.month")}</TableHead>
                              <TableHead className="font-semibold">{t("dues.amount")}</TableHead>
                              <TableHead className="font-semibold">{t("dues.status")}</TableHead>
                              <TableHead className="font-semibold">{t("dues.paidDate")}</TableHead>
                              <TableHead className="font-semibold text-right">{t("dues.actions")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allDues.map((due, index) => {
                              const now = new Date();
                              const isOverdue = due.status === "pending" &&
                                (due.year < now.getFullYear() || (due.year === now.getFullYear() && due.month < now.getMonth() + 1));

                              return (
                                <TableRow
                                  key={`${due.user_id}-${due.month}-${due.year}-${index}`}
                                  className={isOverdue ? "bg-destructive/5" : ""}
                                >
                                  <TableCell className="font-medium">{profiles[due.user_id] || due.user_id.slice(0, 8) + "..."}</TableCell>
                                  <TableCell>{getMonthName(due.month)}</TableCell>
                                  <TableCell className="font-semibold tabular-nums">€{due.amount.toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={due.status === "paid" ? "default" : isOverdue ? "destructive" : "secondary"}
                                      className={`capitalize ${due.status === "paid" ? "bg-green-500/90 hover:bg-green-500" : ""}`}
                                    >
                                      {due.status === "paid" && <CheckCircle className="h-3 w-3 mr-1" />}
                                      {isOverdue && <AlertTriangle className="h-3 w-3 mr-1" />}
                                      {!isOverdue && due.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                      {t(`dues.status${due.status.charAt(0).toUpperCase() + due.status.slice(1)}`)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {due.paid_at
                                      ? new Date(due.paid_at).toLocaleDateString()
                                      : "—"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {due.status !== "paid" && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleMarkAsPaid(due.id)}
                                        className="gap-1.5 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                        {t("dues.markAsPaid")}
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
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
