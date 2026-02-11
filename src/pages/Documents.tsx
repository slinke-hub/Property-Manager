import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Plus, Upload, Download, Trash2, FolderOpen, Loader2 } from "lucide-react";

interface Document {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  is_shared: boolean;
  created_at: string;
}

const Documents = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { role } = useUserRole(user);
  const navigate = useNavigate();

  const [myDocs, setMyDocs] = useState<Document[]>([]);
  const [sharedDocs, setSharedDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [isShared, setIsShared] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    const { data: myData } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (myData) setMyDocs(myData);

    const { data: sharedData } = await supabase
      .from("documents")
      .select("*")
      .eq("is_shared", true)
      .order("created_at", { ascending: false });
    if (sharedData) setSharedDocs(sharedData);

    setIsLoading(false);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast.error(t("documents.fillFields"));
      return;
    }
    setIsUploading(true);
    try {
      const fileName = `${user!.id}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, selectedFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(fileName);

      const { error } = await supabase.from("documents").insert({
        user_id: user!.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        file_url: urlData.publicUrl,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        is_shared: role === "admin" ? isShared : false,
      });
      if (error) throw error;

      toast.success(t("documents.uploadSuccess"));
      setTitle("");
      setDescription("");
      setCategory("general");
      setIsShared(false);
      setSelectedFile(null);
      setIsDialogOpen(false);
      fetchDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("documents.uploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc: Document) => {
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    if (!error) {
      toast.success(t("documents.deleted"));
      fetchDocuments();
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getCategoryLabel = (cat: string) => t(`documents.categories.${cat}`) || cat;

  if (!user) return null;

  const renderDocList = (docs: Document[], canDelete: boolean) => (
    docs.length === 0 ? (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">{t("documents.empty")}</p>
        </CardContent>
      </Card>
    ) : (
      <div className="grid gap-4">
        {docs.map((doc) => (
          <Card key={doc.id} className="transition-all hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Badge variant="secondary" className="text-xs">{getCategoryLabel(doc.category)}</Badge>
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>·</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                  {doc.description && <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                {canDelete && (doc.user_id === user!.id || role === "admin") && (
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
                <FileText className="h-3 w-3" />
                {t("documents.badge")}
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{t("documents.title")}</h1>
              <p className="text-muted-foreground">{t("documents.subtitle")}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  {t("documents.upload")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("documents.uploadTitle")}</DialogTitle>
                  <DialogDescription>{t("documents.uploadDesc")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("announcements.titleLabel")}</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("documents.titlePlaceholder")} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("documents.descriptionLabel")}</Label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("documents.descPlaceholder")} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("documents.categoryLabel")}</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">{t("documents.categories.general")}</SelectItem>
                        <SelectItem value="contract">{t("documents.categories.contract")}</SelectItem>
                        <SelectItem value="warranty">{t("documents.categories.warranty")}</SelectItem>
                        <SelectItem value="floorplan">{t("documents.categories.floorplan")}</SelectItem>
                        <SelectItem value="meeting">{t("documents.categories.meeting")}</SelectItem>
                        <SelectItem value="rules">{t("documents.categories.rules")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {role === "admin" && (
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="shared" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} className="rounded border-input" />
                      <Label htmlFor="shared">{t("documents.shareWithCommunity")}</Label>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{t("documents.selectFile")}</Label>
                    <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common.close")}</Button>
                  <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                    {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t("documents.uploadBtn")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="my-docs">
            <TabsList className="bg-secondary/80 border border-border p-1 h-auto">
              <TabsTrigger value="my-docs" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 py-2.5">
                {t("documents.myDocuments")}
              </TabsTrigger>
              <TabsTrigger value="shared" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 py-2.5">
                {t("documents.sharedDocuments")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my-docs" className="mt-6">
              {renderDocList(myDocs, true)}
            </TabsContent>
            <TabsContent value="shared" className="mt-6">
              {renderDocList(sharedDocs, role === "admin")}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Documents;
