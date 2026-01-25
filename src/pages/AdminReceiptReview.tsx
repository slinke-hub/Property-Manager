import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Receipt, CheckCircle, XCircle, Clock, Eye, Settings, Loader2 } from "lucide-react";

interface ReceiptData {
  id: string;
  user_id: string;
  file_url: string;
  extracted_iban: string | null;
  extracted_amount: number | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface ProfileData {
  user_id: string;
  full_name: string | null;
}

const AdminReceiptReview = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole(user);
  const navigate = useNavigate();
  
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [adminIban, setAdminIban] = useState("");
  const [reviewAmount, setReviewAmount] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!roleLoading && role !== "admin") {
      navigate("/user-portal");
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  useEffect(() => {
    if (user && role === "admin") {
      fetchData();
    }
  }, [user, role]);

  const fetchData = async () => {
    // Fetch all receipts
    const { data: receiptsData } = await supabase
      .from("receipts")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (receiptsData) {
      setReceipts(receiptsData);
      
      // Fetch profiles for user names
      const userIds = [...new Set(receiptsData.map((r) => r.user_id))];
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

    // Fetch admin IBAN
    const { data: settingsData } = await supabase
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "admin_iban")
      .single();
    
    if (settingsData) {
      setAdminIban(settingsData.setting_value);
    }
  };

  const openReview = (receipt: ReceiptData) => {
    setSelectedReceipt(receipt);
    setReviewAmount(receipt.extracted_amount?.toString() || "");
    setReviewNotes("");
    setIsReviewOpen(true);
  };

  const handleVerify = async () => {
    if (!selectedReceipt || !reviewAmount) return;
    
    setIsProcessing(true);
    try {
      const amount = parseFloat(reviewAmount);
      
      // Update receipt status
      await supabase
        .from("receipts")
        .update({
          status: "verified",
          extracted_amount: amount,
          admin_notes: reviewNotes || null,
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedReceipt.id);

      // Get community wallet
      const { data: walletData } = await supabase
        .from("community_wallet")
        .select("*")
        .single();

      if (walletData) {
        // Update community wallet balance
        await supabase
          .from("community_wallet")
          .update({ balance: walletData.balance + amount })
          .eq("id", walletData.id);

        // Create transaction record
        await supabase
          .from("community_transactions")
          .insert({
            community_wallet_id: walletData.id,
            user_id: selectedReceipt.user_id,
            amount,
            type: "contribution",
            description: `Receipt verified by admin - ${profiles[selectedReceipt.user_id] || "User"}`,
          });
      }

      // Send notification
      await sendNotification(selectedReceipt.id, "verified", amount);

      toast.success(t("adminReceipts.verifySuccess"));
      setIsReviewOpen(false);
      fetchData();
    } catch (error) {
      console.error("Verify error:", error);
      toast.error(t("adminReceipts.verifyError"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReceipt) return;
    
    setIsProcessing(true);
    try {
      await supabase
        .from("receipts")
        .update({
          status: "rejected",
          admin_notes: reviewNotes || "Rejected by admin",
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedReceipt.id);

      await sendNotification(selectedReceipt.id, "rejected");

      toast.success(t("adminReceipts.rejectSuccess"));
      setIsReviewOpen(false);
      fetchData();
    } catch (error) {
      console.error("Reject error:", error);
      toast.error(t("adminReceipts.rejectError"));
    } finally {
      setIsProcessing(false);
    }
  };

  const sendNotification = async (receiptId: string, type: string, amount?: number) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-receipt-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({
            type,
            receiptId,
            userEmail: "user@example.com", // Would get from profiles
            amount,
            notes: reviewNotes,
          }),
        }
      );
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  const handleUpdateIban = async () => {
    try {
      await supabase
        .from("admin_settings")
        .update({ setting_value: adminIban })
        .eq("setting_key", "admin_iban");

      toast.success(t("adminReceipts.ibanUpdated"));
      setIsSettingsOpen(false);
    } catch (error) {
      console.error("IBAN update error:", error);
      toast.error(t("adminReceipts.ibanError"));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const pendingReceipts = receipts.filter((r) => r.status === "pending");
  const processedReceipts = receipts.filter((r) => r.status !== "pending");

  if (authLoading || roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || role !== "admin") return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                {t("adminReceipts.title")}
              </h1>
              <p className="text-muted-foreground mt-2">{t("adminReceipts.subtitle")}</p>
            </div>
            <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              {t("adminReceipts.settings")}
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("adminReceipts.pendingReview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600">{pendingReceipts.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("adminReceipts.verified")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {receipts.filter((r) => r.status === "verified").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("adminReceipts.rejected")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  {receipts.filter((r) => r.status === "rejected").length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                {t("adminReceipts.pending")} ({pendingReceipts.length})
              </TabsTrigger>
              <TabsTrigger value="processed">
                {t("adminReceipts.processed")} ({processedReceipts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    {t("adminReceipts.pendingReceipts")}
                  </CardTitle>
                  <CardDescription>{t("adminReceipts.pendingReceiptsDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingReceipts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {t("adminReceipts.noPending")}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminReceipts.owner")}</TableHead>
                          <TableHead>{t("adminReceipts.extractedIban")}</TableHead>
                          <TableHead>{t("adminReceipts.extractedAmount")}</TableHead>
                          <TableHead>{t("adminReceipts.uploadedAt")}</TableHead>
                          <TableHead>{t("adminReceipts.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingReceipts.map((receipt) => (
                          <TableRow key={receipt.id}>
                            <TableCell>{profiles[receipt.user_id] || "Unknown"}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-secondary px-2 py-1 rounded">
                                {receipt.extracted_iban || "Not extracted"}
                              </code>
                            </TableCell>
                            <TableCell>
                              {receipt.extracted_amount
                                ? `€${receipt.extracted_amount.toFixed(2)}`
                                : "Not extracted"}
                            </TableCell>
                            <TableCell>
                              {new Date(receipt.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" onClick={() => openReview(receipt)}>
                                <Eye className="h-4 w-4 mr-1" />
                                {t("adminReceipts.review")}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="processed">
              <Card>
                <CardHeader>
                  <CardTitle>{t("adminReceipts.processedReceipts")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {processedReceipts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {t("adminReceipts.noProcessed")}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminReceipts.owner")}</TableHead>
                          <TableHead>{t("adminReceipts.amount")}</TableHead>
                          <TableHead>{t("adminReceipts.status")}</TableHead>
                          <TableHead>{t("adminReceipts.notes")}</TableHead>
                          <TableHead>{t("adminReceipts.processedAt")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedReceipts.map((receipt) => (
                          <TableRow key={receipt.id}>
                            <TableCell>{profiles[receipt.user_id] || "Unknown"}</TableCell>
                            <TableCell>
                              {receipt.extracted_amount
                                ? `€${receipt.extracted_amount.toFixed(2)}`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(receipt.status)}
                                <span className="capitalize">{receipt.status}</span>
                              </div>
                            </TableCell>
                            <TableCell>{receipt.admin_notes || "-"}</TableCell>
                            <TableCell>
                              {new Date(receipt.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("adminReceipts.reviewReceipt")}</DialogTitle>
            <DialogDescription>{t("adminReceipts.reviewReceiptDesc")}</DialogDescription>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("adminReceipts.owner")}</Label>
                  <p className="text-sm mt-1">{profiles[selectedReceipt.user_id] || "Unknown"}</p>
                </div>
                <div>
                  <Label>{t("adminReceipts.uploadedAt")}</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedReceipt.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <Label>{t("adminReceipts.extractedIban")}</Label>
                <code className="block text-sm mt-1 bg-secondary px-3 py-2 rounded">
                  {selectedReceipt.extracted_iban || "Could not extract IBAN"}
                </code>
              </div>

              <div>
                <Label>{t("adminReceipts.adminIban")}</Label>
                <code className="block text-sm mt-1 bg-secondary px-3 py-2 rounded">
                  {adminIban}
                </code>
                {selectedReceipt.extracted_iban && (
                  <p className={`text-xs mt-1 ${
                    selectedReceipt.extracted_iban.replace(/\s/g, "") === adminIban.replace(/\s/g, "")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {selectedReceipt.extracted_iban.replace(/\s/g, "") === adminIban.replace(/\s/g, "")
                      ? "✓ IBAN matches"
                      : "✗ IBAN does not match"}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="amount">{t("adminReceipts.verifyAmount")}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={reviewAmount}
                  onChange={(e) => setReviewAmount(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">{t("adminReceipts.notes")}</Label>
                <Textarea
                  id="notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={t("adminReceipts.notesPlaceholder")}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>{t("adminReceipts.receiptImage")}</Label>
                <div className="mt-1 border rounded-lg overflow-hidden">
                  <img
                    src={selectedReceipt.file_url}
                    alt="Receipt"
                    className="max-h-64 w-full object-contain bg-secondary"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
                  {t("adminReceipts.cancel")}
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
                  {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t("adminReceipts.reject")}
                </Button>
                <Button onClick={handleVerify} disabled={!reviewAmount || isProcessing}>
                  {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t("adminReceipts.verify")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminReceipts.settingsTitle")}</DialogTitle>
            <DialogDescription>{t("adminReceipts.settingsDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="adminIban">{t("adminReceipts.adminIbanLabel")}</Label>
              <Input
                id="adminIban"
                value={adminIban}
                onChange={(e) => setAdminIban(e.target.value)}
                placeholder="ES00 0000 0000 0000 0000 0000"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("adminReceipts.adminIbanHint")}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                {t("adminReceipts.cancel")}
              </Button>
              <Button onClick={handleUpdateIban}>{t("adminReceipts.saveSettings")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReceiptReview;
