import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";

const Wallet = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole(user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!roleLoading && role !== "owner") {
      navigate("/user-portal");
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || role !== "owner") return null;

  const transactions = [
    { id: 1, type: "credit", amount: 500, description: "Monthly rent payment", date: "2024-01-15" },
    { id: 2, type: "debit", amount: 150, description: "Plumbing service", date: "2024-01-10" },
    { id: 3, type: "debit", amount: 80, description: "Cleaning service", date: "2024-01-05" },
  ];

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
                <p className="text-5xl font-bold text-primary">$2,450.00</p>
                <div className="flex gap-4 mt-6">
                  <Button className="gap-2">
                    <ArrowUpRight className="h-4 w-4" />
                    {t("wallet.deposit")}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <ArrowDownRight className="h-4 w-4" />
                    {t("wallet.withdraw")}
                  </Button>
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
                {transactions.map((transaction) => (
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
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      transaction.type === "credit" ? "text-green-500" : "text-red-500"
                    }`}>
                      {transaction.type === "credit" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
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
