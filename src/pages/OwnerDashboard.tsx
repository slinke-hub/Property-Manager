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
import Footer from "@/components/Footer";
import { db, storage } from "@/config/firebase";
import { collection, query, where, orderBy, getDocs, limit, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
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
    } else if (!roleLoading && role !== "owner" && role !== "admin") {
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

    try {
      // Fetch user's receipts
      const receiptsQuery = query(collection(db, "receipts"), where("user_id", "==", user.id), orderBy("created_at", "desc"));
      const receiptsSnapshot = await getDocs(receiptsQuery);
      setReceipts(receiptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch wallet balance
      const walletQuery = query(collection(db, "wallets"), where("user_id", "==", user.id), limit(1));
      const walletSnapshot = await getDocs(walletQuery);
      if (!walletSnapshot.empty) {
        setWalletBalance(walletSnapshot.docs[0].data().balance);
      } else {
        setWalletBalance(0);
      }

      // Fetch my dues
      const duesQuery = query(collection(db, "monthly_dues"), where("user_id", "==", user.id), orderBy("year", "desc"), orderBy("month", "desc"));
      const duesSnapshot = await getDocs(duesQuery);
      setMyDues(duesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
      const storageRef = ref(storage, `receipts/${fileName}`);
      await uploadString(storageRef, base64, 'base64', { contentType: selectedFile.type });

      // Get public URL
      const publicUrl = await getDownloadURL(storageRef);

      // Create receipt record in Firestore
      const receiptRef = await addDoc(collection(db, "receipts"), {
        user_id: user.id,
        file_url: publicUrl,
        status: "pending",
        created_at: new Date().toISOString()
      });

      // AI Extraction is unavailable on Firebase without a Cloud Function, 
      // so we will simulate it being set to pending.
      toast.info(t("ownerDashboard.receiptPending"));

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
    await updateDoc(doc(db, "receipts", receiptId), { status: "verified" });

    // Get community wallet
    const walletQuery = query(collection(db, "community_wallet"), limit(1));
    const walletSnapshot = await getDocs(walletQuery);

    if (!walletSnapshot.empty) {
      const walletDoc = walletSnapshot.docs[0];
      const walletData = walletDoc.data();

      // Update community wallet balance
      await updateDoc(doc(db, "community_wallet", walletDoc.id), {
        balance: walletData.balance + amount
      });

      // Create transaction record
      await addDoc(collection(db, "community_transactions"), {
        community_wallet_id: walletDoc.id,
        user_id: user!.id,
        amount,
        type: "contribution",
        description: `Receipt verified - Auto credited`,
        created_at: new Date().toISOString()
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

  if (!user || (role !== "owner" && role !== "admin")) return null;

  return (
    <div className="min-h-screen flex flex-col w-full">
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <div className="w-full space-y-8">
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
                        className={`text-xs px-2 py-1 rounded ${receipt.status === "verified"
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
