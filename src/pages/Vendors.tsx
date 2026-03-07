import { useState } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, Search, Building2, Phone, Mail, Star, Wrench, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Vendors = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newVendor, setNewVendor] = useState({ name: "", service: "", phone: "", email: "" });

    const vendors = [
        {
            id: "1",
            name: "QuickFix Plumbing",
            service: "Plumbing",
            rating: 4.8,
            completedJobs: 142,
            phone: "(555) 123-4567",
            email: "service@quickfix.com",
            status: "active",
            verified: true
        },
        {
            id: "2",
            name: "ElectraServe Solutions",
            service: "Electrical",
            rating: 4.9,
            completedJobs: 89,
            phone: "(555) 987-6543",
            email: "contact@electraserve.com",
            status: "active",
            verified: true
        },
        {
            id: "3",
            name: "Crystal Clear HVAC",
            service: "HVAC",
            rating: 4.5,
            completedJobs: 56,
            phone: "(555) 456-7890",
            email: "support@crystalhvac.com",
            status: "active",
            verified: true
        },
        {
            id: "4",
            name: "GreenThumb Landscaping",
            service: "Landscaping",
            rating: 4.7,
            completedJobs: 210,
            phone: "(555) 222-3333",
            email: "hello@greenthumb.com",
            status: "inactive",
            verified: false
        }
    ];

    const handleAddVendor = () => {
        if (!newVendor.name || !newVendor.service) {
            toast({
                title: "Missing fields",
                description: "Please fill in the required vendor details.",
                variant: "destructive"
            });
            return;
        }

        toast({
            title: "Vendor Added",
            description: `${newVendor.name} has been successfully added to the directory.`,
        });
        setNewVendor({ name: "", service: "", phone: "", email: "" });
        setIsDialogOpen(false);
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.service.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col w-full bg-gradient-to-b from-background to-secondary/20">
            <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Vendor Directory</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage external contractors and service providers.
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add New Vendor
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Vendor</DialogTitle>
                                <DialogDescription>
                                    Enter the details of the new service provider to add them to the directory.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Company Name</Label>
                                    <Input
                                        id="name"
                                        value={newVendor.name}
                                        onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
                                        placeholder="e.g. Apex Repairs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="service">Service Category</Label>
                                    <Input
                                        id="service"
                                        value={newVendor.service}
                                        onChange={e => setNewVendor({ ...newVendor, service: e.target.value })}
                                        placeholder="e.g. general, plumbing, electrical"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={newVendor.phone}
                                        onChange={e => setNewVendor({ ...newVendor, phone: e.target.value })}
                                        placeholder="(555) 000-0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newVendor.email}
                                        onChange={e => setNewVendor({ ...newVendor, email: e.target.value })}
                                        placeholder="contact@company.com"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddVendor}>Save Vendor</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or category..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map((vendor) => (
                        <Card key={vendor.id} className="transition-all hover:shadow-md flex flex-col">
                            <CardHeader className="pb-3 border-b border-border/50">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                        {vendor.status}
                                    </Badge>
                                    {vendor.verified && (
                                        <div className="flex items-center text-green-600 dark:text-green-500 text-xs font-medium gap-1">
                                            <ShieldCheck className="h-4 w-4" />
                                            Verified
                                        </div>
                                    )}
                                </div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    {vendor.name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 font-medium text-foreground/80">
                                    <Wrench className="h-4 w-4 text-muted-foreground" />
                                    {vendor.service}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3 flex-1">
                                <div className="flex flex-col gap-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4 shrink-0" />
                                        <span>{vendor.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{vendor.email}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-secondary/20 pt-4 flex items-center justify-between border-t border-border/50">
                                <div className="flex items-center gap-1.5 font-medium text-sm">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    {vendor.rating}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">{vendor.completedJobs}</span> jobs
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Vendors;
