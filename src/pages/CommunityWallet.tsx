import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Users, ArrowUpRight, ArrowDownRight, PiggyBank } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CommunityWallet = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole(user);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionDescription, setContributionDescription] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [walletId, setWalletId] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Fetch community wallet
      const { data: wallet, error: walletError } = await supabase
        .from("community_wallet")
        .select("*")
        .single();

      if (walletError) throw walletError;
      
      setBalance(Number(wallet.balance));
      setWalletId(wallet.id);

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("community_transactions")
        .select("*")
        .eq("community_wallet_id", wallet.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

      // Fetch contributions summary
      const { data: contributionsData, error: contributionsError } = await supabase
        .from("community_contributions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (contributionsError) throw contributionsError;
      setContributions(contributionsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch community wallet data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async () => {
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      // Add contribution record
      const { error: contributionError } = await supabase
        .from("community_contributions")
        .insert({
          user_id: user!.id,
          amount: amount,
          month: month,
          year: year,
          description: contributionDescription || `Monthly fee for ${month}/${year}`,
        });

      if (contributionError) {
        if (contributionError.code === '23505') {
          toast({
            title: "Already contributed",
            description: `You have already contributed for ${month}/${year}`,
            variant: "destructive",
          });
          return;
        }
        throw contributionError;
      }

      // Update wallet balance
      const newBalance = balance + amount;
      const { error: updateError } = await supabase
        .from("community_wallet")
        .update({ balance: newBalance })
        .eq("id", walletId);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("community_transactions")
        .insert({
          community_wallet_id: walletId,
          user_id: user!.id,
          type: "contribution",
          amount: amount,
          description: contributionDescription || `Monthly contribution for ${month}/${year}`,
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Success",
        description: `$${amount.toFixed(2)} has been contributed to the community wallet`,
      });

      setContributionAmount("");
      setContributionDescription("");
      setIsContributeOpen(false);
      fetchWalletData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to contribute",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: "Insufficient funds",
        description: "The community wallet doesn't have enough balance",
        variant: "destructive",
      });
      return;
    }

    if (!paymentDescription.trim()) {
      toast({
        title: "Description required",
        description: "Please provide a description for this payment",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update wallet balance
      const newBalance = balance - amount;
      const { error: updateError } = await supabase
        .from("community_wallet")
        .update({ balance: newBalance })
        .eq("id", walletId);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("community_transactions")
        .insert({
          community_wallet_id: walletId,
          user_id: user!.id,
          type: "payment",
          amount: amount,
          description: paymentDescription,
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Success",
        description: `$${amount.toFixed(2)} payment has been made from the community wallet`,
      });

      setPaymentAmount("");
      setPaymentDescription("");
      setIsPaymentOpen(false);
      fetchWalletData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to make payment",
        variant: "destructive",
      });
    }
  };

  if (authLoading || roleLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) return null;

  const isAdmin = role === "admin";
  const isOwner = role === "owner";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="flex-1 container py-8 space-y-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              {t("communityWallet.title")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("communityWallet.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="col-span-full md:col-span-2">
              <CardHeader>
                <CardTitle className="text-3xl">{t("communityWallet.balance")}</CardTitle>
                <CardDescription>{t("communityWallet.sharedBalance")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-primary">${balance.toFixed(2)}</p>
                <div className="flex gap-4 mt-6">
                  {isOwner && (
                    <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <ArrowUpRight className="h-4 w-4" />
                          {t("communityWallet.contribute")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("communityWallet.addContribution")}</DialogTitle>
                          <DialogDescription>
                            {t("communityWallet.contributionDescription")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="contribution-amount">{t("communityWallet.amount")}</Label>
                            <Input
                              id="contribution-amount"
                              type="number"
                              placeholder="0.00"
                              value={contributionAmount}
                              onChange={(e) => setContributionAmount(e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contribution-description">{t("communityWallet.description")}</Label>
                            <Textarea
                              id="contribution-description"
                              placeholder={t("communityWallet.descriptionPlaceholder")}
                              value={contributionDescription}
                              onChange={(e) => setContributionDescription(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsContributeOpen(false)}>
                            {t("communityWallet.cancel")}
                          </Button>
                          <Button onClick={handleContribute}>
                            {t("communityWallet.confirmContribution")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  {isAdmin && (
                    <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <ArrowDownRight className="h-4 w-4" />
                          {t("communityWallet.makePayment")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("communityWallet.makePaymentTitle")}</DialogTitle>
                          <DialogDescription>
                            {t("communityWallet.paymentDescription")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="payment-amount">{t("communityWallet.amount")}</Label>
                            <Input
                              id="payment-amount"
                              type="number"
                              placeholder="0.00"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              min="0"
                              step="0.01"
                              max={balance}
                            />
                            <p className="text-sm text-muted-foreground">
                              {t("communityWallet.availableBalance")}: ${balance.toFixed(2)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="payment-description">{t("communityWallet.description")} *</Label>
                            <Textarea
                              id="payment-description"
                              placeholder={t("communityWallet.paymentDescriptionPlaceholder")}
                              value={paymentDescription}
                              onChange={(e) => setPaymentDescription(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
                            {t("communityWallet.cancel")}
                          </Button>
                          <Button onClick={handlePayment}>
                            {t("communityWallet.confirmPayment")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  {t("communityWallet.info")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t("communityWallet.infoText")}
                  </p>
                  {isAdmin && (
                    <p className="text-sm font-medium text-primary">
                      {t("communityWallet.adminInfo")}
                    </p>
                  )}
                  {isOwner && (
                    <p className="text-sm font-medium text-primary">
                      {t("communityWallet.ownerInfo")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("communityWallet.recentTransactions")}</CardTitle>
              <CardDescription>{t("communityWallet.transactionHistory")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t("communityWallet.noTransactions")}
                  </p>
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === "contribution" 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {transaction.type === "contribution" ? (
                            <ArrowDownRight className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className={`font-semibold ${
                        transaction.type === "contribution" ? "text-green-500" : "text-red-500"
                      }`}>
                        {transaction.type === "contribution" ? "+" : "-"}${Number(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityWallet;