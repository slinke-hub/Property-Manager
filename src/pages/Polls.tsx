import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Vote, Plus, Trash2, CheckCircle2, Clock } from "lucide-react";

interface Poll {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  options: string[];
  category: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  option_index: number;
}

const Polls = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { role } = useUserRole(user);
  const navigate = useNavigate();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<PollVote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newOptions, setNewOptions] = useState(["", ""]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchPolls();
  }, [user]);

  const fetchPolls = async () => {
    setIsLoading(true);
    const { data: pollsData } = await supabase
      .from("polls")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: votesData } = await supabase
      .from("poll_votes")
      .select("*");

    if (pollsData) {
      setPolls(pollsData.map((p: any) => ({ ...p, options: p.options as string[] })));
    }
    if (votesData) setVotes(votesData);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    const filteredOptions = newOptions.filter((o) => o.trim());
    if (!newTitle.trim() || filteredOptions.length < 2) {
      toast.error(t("polls.fillFields"));
      return;
    }

    const { error } = await supabase.from("polls").insert({
      user_id: user!.id,
      title: newTitle.trim(),
      description: newDesc.trim() || null,
      options: filteredOptions,
      category: newCategory,
    });

    if (error) {
      toast.error(t("polls.createError"));
    } else {
      toast.success(t("polls.createSuccess"));
      setNewTitle("");
      setNewDesc("");
      setNewOptions(["", ""]);
      setIsCreateOpen(false);
      fetchPolls();
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    const existingVote = votes.find((v) => v.poll_id === pollId && v.user_id === user!.id);

    if (existingVote) {
      if (existingVote.option_index === optionIndex) return;
      const { error } = await supabase
        .from("poll_votes")
        .update({ option_index: optionIndex })
        .eq("id", existingVote.id);
      if (error) { toast.error(t("polls.voteError")); return; }
    } else {
      const { error } = await supabase.from("poll_votes").insert({
        poll_id: pollId,
        user_id: user!.id,
        option_index: optionIndex,
      });
      if (error) { toast.error(t("polls.voteError")); return; }
    }
    toast.success(t("polls.voteSuccess"));
    fetchPolls();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("polls").delete().eq("id", id);
    toast.success(t("polls.deleted"));
    fetchPolls();
  };

  const handleClosePoll = async (id: string) => {
    await supabase.from("polls").update({ is_active: false }).eq("id", id);
    toast.success(t("polls.closed"));
    fetchPolls();
  };

  const getVotesForPoll = (pollId: string) => votes.filter((v) => v.poll_id === pollId);
  const getUserVote = (pollId: string) => votes.find((v) => v.poll_id === pollId && v.user_id === user?.id);

  const getCategoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      general: "bg-primary/10 text-primary",
      maintenance: "bg-amber-500/10 text-amber-600",
      rules: "bg-purple-500/10 text-purple-600",
      social: "bg-green-500/10 text-green-600",
    };
    return colors[cat] || colors.general;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-b from-background to-secondary/20">
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
                <Vote className="h-3 w-3" />
                {t("polls.badge")}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("polls.title")}</h1>
              <p className="text-muted-foreground">{t("polls.subtitle")}</p>
            </div>
            {role === "admin" && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    {t("polls.create")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{t("polls.createTitle")}</DialogTitle>
                    <DialogDescription>{t("polls.createDesc")}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("polls.questionLabel")}</Label>
                      <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={t("polls.questionPlaceholder")} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("polls.descriptionLabel")}</Label>
                      <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder={t("polls.descPlaceholder")} rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("polls.categoryLabel")}</Label>
                      <Select value={newCategory} onValueChange={setNewCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">{t("polls.categories.general")}</SelectItem>
                          <SelectItem value="maintenance">{t("polls.categories.maintenance")}</SelectItem>
                          <SelectItem value="rules">{t("polls.categories.rules")}</SelectItem>
                          <SelectItem value="social">{t("polls.categories.social")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("polls.optionsLabel")}</Label>
                      {newOptions.map((opt, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const updated = [...newOptions];
                              updated[i] = e.target.value;
                              setNewOptions(updated);
                            }}
                            placeholder={`${t("polls.option")} ${i + 1}`}
                          />
                          {newOptions.length > 2 && (
                            <Button variant="ghost" size="icon" onClick={() => setNewOptions(newOptions.filter((_, idx) => idx !== i))}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {newOptions.length < 6 && (
                        <Button variant="outline" size="sm" onClick={() => setNewOptions([...newOptions, ""])}>{t("polls.addOption")}</Button>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{t("common.cancel")}</Button>
                    <Button onClick={handleCreate}>{t("polls.publish")}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse"><CardContent className="h-40" /></Card>
              ))}
            </div>
          ) : polls.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Vote className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">{t("polls.empty")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => {
                const pollVotes = getVotesForPoll(poll.id);
                const userVote = getUserVote(poll.id);
                const totalVotes = pollVotes.length;

                return (
                  <Card key={poll.id} className={!poll.is_active ? "opacity-70" : ""}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={getCategoryBadge(poll.category)} variant="outline">
                              {t(`polls.categories.${poll.category}`)}
                            </Badge>
                            {!poll.is_active && (
                              <Badge variant="secondary">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {t("polls.closedLabel")}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">{poll.title}</CardTitle>
                          {poll.description && <CardDescription>{poll.description}</CardDescription>}
                        </div>
                        {role === "admin" && (
                          <div className="flex gap-2 shrink-0">
                            {poll.is_active && (
                              <Button variant="outline" size="sm" onClick={() => handleClosePoll(poll.id)}>
                                <Clock className="h-3 w-3 mr-1" />{t("polls.closePoll")}
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(poll.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {poll.options.map((option, idx) => {
                        const optionVotes = pollVotes.filter((v) => v.option_index === idx).length;
                        const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
                        const isSelected = userVote?.option_index === idx;

                        return (
                          <button
                            key={idx}
                            onClick={() => poll.is_active && handleVote(poll.id, idx)}
                            disabled={!poll.is_active}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${isSelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/50"
                              } ${!poll.is_active ? "cursor-default" : "cursor-pointer"}`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium">{option}</span>
                              <span className="text-xs text-muted-foreground">{optionVotes} {t("polls.votes")} ({percentage.toFixed(0)}%)</span>
                            </div>
                            <Progress value={percentage} className="h-1.5" />
                          </button>
                        );
                      })}
                      <p className="text-xs text-muted-foreground pt-1">
                        {totalVotes} {t("polls.totalVotes")} · {new Date(poll.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Polls;
