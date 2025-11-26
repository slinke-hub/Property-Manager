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
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Wallet = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole(user);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!roleLoading && role !== "owner") {
      navigate("/user-portal");
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  useEffect(() => {
    if (user && role === "owner") {
      fetchWalletData();
    }
  }, [user, role]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      // Fetch or create wallet
      let { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (walletError && walletError.code === "PGRST116") {
        // Wallet doesn't exist, create it
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({ user_id: user!.id, balance: 0 })
          .select()
          .single();

        if (createError) throw createError;
        wallet = newWallet;
      } else if (walletError) {
        throw walletError;
      }

      setBalance(Number(wallet.balance));

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch wallet data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current wallet
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (walletError) throw walletError;

      // Update balance
      const newBalance = Number(wallet.balance) + amount;
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", wallet.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          user_id: user!.id,
          type: "credit",
          amount: amount,
          description: "Deposit",
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Success",
        description: `$${amount.toFixed(2)} has been added to your wallet`,
      });

      setDepositAmount("");
      setIsDepositOpen(false);
      fetchWalletData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to deposit funds",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
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
        description: "You don't have enough balance to withdraw this amount",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current wallet
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (walletError) throw walletError;

      // Update balance
      const newBalance = Number(wallet.balance) - amount;
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", wallet.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          user_id: user!.id,
          type: "debit",
          amount: amount,
          description: "Withdrawal",
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Success",
        description: `$${amount.toFixed(2)} has been withdrawn from your wallet`,
      });

      setWithdrawAmount("");
      setIsWithdrawOpen(false);
      fetchWalletData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw funds",
        variant: "destructive",
      });
    }
  };

  if (authLoading || roleLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || role !== "owner") return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="flex-1 container py-8 space-y-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
              <WalletIcon className="h-8 w-8 text-primary" />
              {t("wallet.title")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("wallet.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="col-span-full md:col-span-2">
              <CardHeader>
                <CardTitle className="text-3xl">{t("wallet.balance")}</CardTitle>
                <CardDescription>{t("wallet.currentBalance")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-primary">${balance.toFixed(2)}</p>
                <div className="flex gap-4 mt-6">
                  <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <ArrowUpRight className="h-4 w-4" />
                        {t("wallet.deposit")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("wallet.depositMoney")}</DialogTitle>
                        <DialogDescription>
                          {t("wallet.depositDescription")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">{t("wallet.amount")}</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDepositOpen(false)}>
                          {t("wallet.cancel")}
                        </Button>
                        <Button onClick={handleDeposit}>
                          {t("wallet.confirmDeposit")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <ArrowDownRight className="h-4 w-4" />
                        {t("wallet.withdraw")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("wallet.withdrawMoney")}</DialogTitle>
                        <DialogDescription>
                          {t("wallet.withdrawDescription")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="withdraw-amount">{t("wallet.amount")}</Label>
                          <Input
                            id="withdraw-amount"
                            type="number"
                            placeholder="0.00"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            min="0"
                            step="0.01"
                            max={balance}
                          />
                          <p className="text-sm text-muted-foreground">
                            {t("wallet.availableBalance")}: ${balance.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>
                          {t("wallet.cancel")}
                        </Button>
                        <Button onClick={handleWithdraw}>
                          {t("wallet.confirmWithdraw")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t("wallet.paymentMethod")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t("wallet.noPaymentMethod")}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    {t("wallet.addPaymentMethod")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("wallet.recentTransactions")}</CardTitle>
              <CardDescription>{t("wallet.transactionHistory")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t("wallet.noTransactions")}
                  </p>
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === "credit" 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {transaction.type === "credit" ? (
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
                        transaction.type === "credit" ? "text-green-500" : "text-red-500"
                      }`}>
                        {transaction.type === "credit" ? "+" : "-"}${Number(transaction.amount).toFixed(2)}
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

export default Wallet;
