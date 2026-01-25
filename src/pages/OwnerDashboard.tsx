import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Wallet, Receipt, Calendar, Upload, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

const OwnerDashboard = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, loading: roleLoading } = useUserRole(user);
  const navigate = useNavigate();
  
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [myDues, setMyDues] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!roleLoading && role !== "owner") {
      navigate("/user-portal");
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch user's receipts
    const { data: receiptsData } = await supabase
      .from("receipts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (receiptsData) setReceipts(receiptsData);

    // Fetch wallet balance
    const { data: walletData } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (walletData) setWalletBalance(walletData.balance);

    // Fetch my dues
    const { data: duesData } = await supabase
      .from("monthly_dues")
      .select("*")
      .eq("user_id", user.id)
      .order("year", { ascending: false })
      .order("month", { ascending: false });
    
    if (duesData) setMyDues(duesData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadReceipt = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);

    try {
      // Convert file to base64 for AI processing
      const base64 = await fileToBase64(selectedFile);
      
      // Upload file to storage
      const fileName = `${user.id}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      // Create receipt record
      const { data: receiptData, error: receiptError } = await supabase
        .from("receipts")
        .insert({
          user_id: user.id,
          file_url: urlData.publicUrl,
          status: "pending",
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Call AI extraction
      const { data: sessionData } = await supabase.auth.getSession();
      const extractResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-receipt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({ imageBase64: base64 }),
        }
      );

      if (extractResponse.ok) {
        const extraction = await extractResponse.json();
        
        // Update receipt with extracted data
        await supabase
          .from("receipts")
          .update({
            extracted_iban: extraction.iban,
            extracted_amount: extraction.amount,
          })
          .eq("id", receiptData.id);

        // Get admin IBAN to verify
        const { data: adminSettings } = await supabase
          .from("admin_settings")
          .select("setting_value")
          .eq("setting_key", "admin_iban")
          .single();

        if (adminSettings && extraction.iban) {
          const cleanExtractedIban = extraction.iban.replace(/\s/g, "");
          const cleanAdminIban = adminSettings.setting_value.replace(/\s/g, "");
          
          if (cleanExtractedIban === cleanAdminIban && extraction.amount) {
            // Auto-verify and credit
            await verifyAndCreditReceipt(receiptData.id, extraction.amount);
            toast.success(t("ownerDashboard.receiptVerified"));
          } else {
            toast.info(t("ownerDashboard.receiptPending"));
          }
        } else {
          toast.info(t("ownerDashboard.receiptPending"));
        }
      } else {
        toast.warning(t("ownerDashboard.extractionFailed"));
      }

      setIsDialogOpen(false);
      setSelectedFile(null);
      fetchData();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("ownerDashboard.uploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  const verifyAndCreditReceipt = async (receiptId: string, amount: number) => {
    // Update receipt status
    await supabase
      .from("receipts")
      .update({ status: "verified" })
      .eq("id", receiptId);

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
          user_id: user!.id,
          amount,
          type: "contribution",
          description: `Receipt verified - Auto credited`,
        });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || role !== "owner") return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                {t("ownerDashboard.title")}
              </h1>
              <p className="text-muted-foreground mt-2">{t("ownerDashboard.subtitle")}</p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              {t("auth.signOut")}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  {t("ownerDashboard.personalWallet")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">€{walletBalance.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  {t("ownerDashboard.pendingReceipts")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {receipts.filter((r) => r.status === "pending").length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {t("ownerDashboard.pendingDues")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {myDues.filter((d) => d.status === "pending").length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-4 gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-auto py-4 flex flex-col gap-2">
                  <Upload className="h-5 w-5" />
                  {t("ownerDashboard.uploadReceipt")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("ownerDashboard.uploadReceiptTitle")}</DialogTitle>
                  <DialogDescription>{t("ownerDashboard.uploadReceiptDesc")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="receipt">{t("ownerDashboard.selectFile")}</Label>
                    <Input
                      id="receipt"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-2"
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      {t("ownerDashboard.selected")}: {selectedFile.name}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      {t("ownerDashboard.cancel")}
                    </Button>
                    <Button onClick={handleUploadReceipt} disabled={!selectedFile || isUploading}>
                      {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {t("ownerDashboard.upload")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="h-auto py-4" onClick={() => navigate("/wallet")}>
              <Wallet className="h-5 w-5 mr-2" />
              {t("ownerDashboard.myWallet")}
            </Button>

            <Button variant="outline" className="h-auto py-4" onClick={() => navigate("/community-wallet")}>
              <Receipt className="h-5 w-5 mr-2" />
              {t("ownerDashboard.communityWallet")}
            </Button>

            <Button variant="outline" className="h-auto py-4" onClick={() => navigate("/dues")}>
              <Calendar className="h-5 w-5 mr-2" />
              {t("ownerDashboard.viewDues")}
            </Button>
          </div>

          {/* Recent Receipts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                {t("ownerDashboard.recentReceipts")}
              </CardTitle>
              <CardDescription>{t("ownerDashboard.recentReceiptsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {receipts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {t("ownerDashboard.noReceipts")}
                </p>
              ) : (
                <div className="space-y-3">
                  {receipts.slice(0, 5).map((receipt) => (
                    <div
                      key={receipt.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(receipt.status)}
                        <div>
                          <p className="text-sm font-medium">
                            {receipt.extracted_amount
                              ? `€${receipt.extracted_amount}`
                              : t("ownerDashboard.amountPending")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(receipt.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          receipt.status === "verified"
                            ? "bg-green-500/20 text-green-600"
                            : receipt.status === "rejected"
                            ? "bg-red-500/20 text-red-600"
                            : "bg-yellow-500/20 text-yellow-600"
                        }`}
                      >
                        {receipt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OwnerDashboard;
