import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Plus, Send, Trash2, User } from "lucide-react";

interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  comment_count?: number;
}

interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
}

const Forum = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { role } = useUserRole(user);
  const navigate = useNavigate();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data: postsData } = await supabase
      .from("forum_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postsData) {
      // Get comment counts
      const postIds = postsData.map((p) => p.id);
      const { data: commentsData } = await supabase
        .from("forum_comments")
        .select("post_id")
        .in("post_id", postIds);

      const countMap: Record<string, number> = {};
      commentsData?.forEach((c) => {
        countMap[c.post_id] = (countMap[c.post_id] || 0) + 1;
      });

      const enriched = postsData.map((p) => ({ ...p, comment_count: countMap[p.id] || 0 }));
      setPosts(enriched);

      // Fetch profiles
      const userIds = [...new Set(postsData.map((p) => p.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);
        if (profilesData) {
          const map: Record<string, string> = {};
          profilesData.forEach((p) => { map[p.user_id] = p.full_name || t("forum.anonymous"); });
          setProfiles(map);
        }
      }
    }
    setIsLoading(false);
  };

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error(t("announcements.fillFields"));
      return;
    }
    const { error } = await supabase.from("forum_posts").insert({
      user_id: user!.id,
      title: title.trim(),
      content: content.trim(),
      category,
    });
    if (error) {
      toast.error(t("forum.createError"));
    } else {
      toast.success(t("forum.createSuccess"));
      setTitle("");
      setContent("");
      setCategory("general");
      setIsDialogOpen(false);
      fetchPosts();
    }
  };

  const openPost = async (post: ForumPost) => {
    setSelectedPost(post);
    const { data } = await supabase
      .from("forum_comments")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    if (data) {
      const userIds = [...new Set(data.map((c) => c.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);
        if (profilesData) {
          profilesData.forEach((p) => {
            profiles[p.user_id] = p.full_name || t("forum.anonymous");
          });
          setProfiles({ ...profiles });
        }
      }
      setComments(data.map((c) => ({ ...c, author_name: profiles[c.user_id] })));
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !selectedPost) return;
    const { error } = await supabase.from("forum_comments").insert({
      post_id: selectedPost.id,
      user_id: user!.id,
      content: newComment.trim(),
    });
    if (error) {
      toast.error(t("forum.commentError"));
    } else {
      setNewComment("");
      openPost(selectedPost);
      fetchPosts();
    }
  };

  const handleDeletePost = async (id: string) => {
    const { error } = await supabase.from("forum_posts").delete().eq("id", id);
    if (!error) {
      toast.success(t("forum.postDeleted"));
      setSelectedPost(null);
      fetchPosts();
    }
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      general: "bg-primary/10 text-primary",
      maintenance: "bg-accent/10 text-accent",
      safety: "bg-destructive/10 text-destructive",
      social: "bg-green-500/10 text-green-600",
      suggestion: "bg-purple-500/10 text-purple-600",
    };
    return colors[cat] || colors.general;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-b from-background to-secondary/20">
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
                <MessageSquare className="h-3 w-3" />
                {t("forum.badge")}
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{t("forum.title")}</h1>
              <p className="text-muted-foreground">{t("forum.subtitle")}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("forum.newPost")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("forum.createPost")}</DialogTitle>
                  <DialogDescription>{t("forum.createPostDesc")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("announcements.titleLabel")}</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("forum.titlePlaceholder")} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("forum.categoryLabel")}</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">{t("forum.categories.general")}</SelectItem>
                        <SelectItem value="maintenance">{t("forum.categories.maintenance")}</SelectItem>
                        <SelectItem value="safety">{t("forum.categories.safety")}</SelectItem>
                        <SelectItem value="social">{t("forum.categories.social")}</SelectItem>
                        <SelectItem value="suggestion">{t("forum.categories.suggestion")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("announcements.contentLabel")}</Label>
                    <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={t("forum.contentPlaceholder")} rows={5} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common.close")}</Button>
                  <Button onClick={handleCreatePost}>{t("forum.post")}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {selectedPost ? (
            <div className="space-y-6">
              <Button variant="ghost" onClick={() => setSelectedPost(null)} className="gap-2">
                ← {t("common.back")}
              </Button>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(selectedPost.category)}>{t(`forum.categories.${selectedPost.category}`)}</Badge>
                      </div>
                      <CardTitle className="text-xl">{selectedPost.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <User className="h-3 w-3" />
                        {profiles[selectedPost.user_id] || t("forum.anonymous")} · {new Date(selectedPost.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {(selectedPost.user_id === user.id || role === "admin") && (
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePost(selectedPost.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 whitespace-pre-wrap">{selectedPost.content}</p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="font-semibold">{t("forum.comments")} ({comments.length})</h3>
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3 p-4 bg-secondary/30 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{profiles[c.user_id] || t("forum.anonymous")}</span>
                        <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-foreground/80">{c.content}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t("forum.commentPlaceholder")}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  />
                  <Button onClick={handleComment} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader><div className="h-5 bg-muted rounded w-1/3" /></CardHeader>
                  </Card>
                ))
              ) : posts.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground font-medium">{t("forum.empty")}</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30" onClick={() => openPost(post)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getCategoryColor(post.category)} variant="secondary">
                              {t(`forum.categories.${post.category}`)}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {profiles[post.user_id] || t("forum.anonymous")} · {new Date(post.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <MessageSquare className="h-4 w-4" />
                          {post.comment_count}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/70 line-clamp-2">{post.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Forum;
