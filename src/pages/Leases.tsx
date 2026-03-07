import { useState } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, FileSignature, FileText, CheckCircle2, Clock, Ban } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addYears } from "date-fns";

const Leases = () => {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
    const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
    const [selectedLease, setSelectedLease] = useState<any>(null);
    const [signature, setSignature] = useState("");

    const leases = [
        {
            id: "L-1001",
            tenant: "John Doe",
            property: "Sunset Apartments",
            unit: "2B",
            startDate: "2023-09-01",
            endDate: "2024-08-31",
            rentAmount: "$1,200",
            status: "active",
            signedByTenant: true,
            signedByManager: true
        },
        {
            id: "L-1002",
            tenant: "Jane Smith",
            property: "Riverside Complex",
            unit: "5A",
            startDate: "2024-03-15",
            endDate: "2025-03-14",
            rentAmount: "$1,500",
            status: "pending_signature",
            signedByTenant: false,
            signedByManager: true
        },
        {
            id: "L-1003",
            tenant: "Michael Johnson",
            property: "Garden View Suites",
            unit: "1C",
            startDate: "2022-01-01",
            endDate: "2023-12-31",
            rentAmount: "$1,100",
            status: "expired",
            signedByTenant: true,
            signedByManager: true
        }
    ];

    const handleSignLease = () => {
        if (!signature.trim()) {
            toast({
                title: "Signature Required",
                description: "Please type your full name to sign the document.",
                variant: "destructive"
            });
            return;
        }

        toast({
            title: "Document Signed Successfully",
            description: `Lease ${selectedLease?.id} has been digitally signed by ${signature}.`,
        });
        setSignature("");
        setIsSignDialogOpen(false);
        setSelectedLease(null);
    };

    const handleGenerateLease = () => {
        toast({
            title: "Lease Generated",
            description: "A new lease agreement has been drafted and sent to the tenant for review.",
        });
        setIsGenerateDialogOpen(false);
    };

    const filteredLeases = leases.filter(l =>
        l.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>;
            case 'pending_signature':
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Pending Signature</Badge>;
            case 'expired':
                return <Badge variant="outline" className="text-red-700 border-red-200"><Ban className="w-3 h-3 mr-1" /> Expired</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="min-h-screen flex flex-col w-full bg-gradient-to-b from-background to-secondary/20">
            <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Lease & Contracts</h1>
                        <p className="text-muted-foreground mt-2">
                            Generate, track, and digitally sign lease agreements.
                        </p>
                    </div>

                    <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Draft New Lease
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Draft Lease Agreement</DialogTitle>
                                <DialogDescription>
                                    Create a new standard lease agreement for a tenant.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Tenant</Label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder="Select an existing tenant or applicant" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tenant1">Alice Wonderland</SelectItem>
                                            <SelectItem value="tenant2">Bob Builder</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Property</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select Property" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="prop1">Sunset Apartments</SelectItem>
                                                <SelectItem value="prop2">Riverside Complex</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Unit</Label>
                                        <Input placeholder="e.g. 101" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input type="date" defaultValue={format(addYears(new Date(), 1), "yyyy-MM-dd")} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Monthly Rent Amount</Label>
                                    <Input type="number" placeholder="1500" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleGenerateLease}>Generate & Send</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by tenant, property, or lease ID..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {filteredLeases.map((lease) => (
                            <Card key={lease.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="py-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">{lease.tenant}</CardTitle>
                                            <CardDescription className="text-sm mt-1 flex gap-2">
                                                <span className="font-mono text-xs bg-secondary px-2 rounded-sm text-secondary-foreground">{lease.id}</span>
                                                {lease.property} - Unit {lease.unit}
                                            </CardDescription>
                                        </div>
                                        {getStatusBadge(lease.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="py-2 text-sm">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-muted-foreground">Start Date</p>
                                            <p className="font-medium">{lease.startDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">End Date</p>
                                            <p className="font-medium">{lease.endDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Rent</p>
                                            <p className="font-medium">{lease.rentAmount}/mo</p>
                                        </div>
                                        <div className="flex flex-col gap-1 text-xs justify-center">
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className={`w-3 h-3 ${lease.signedByManager ? 'text-green-500' : 'text-muted-foreground'}`} />
                                                <span className={lease.signedByManager ? '' : 'text-muted-foreground'}>Manager Signed</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className={`w-3 h-3 ${lease.signedByTenant ? 'text-green-500' : 'text-muted-foreground'}`} />
                                                <span className={lease.signedByTenant ? '' : 'text-muted-foreground'}>Tenant Signed</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="py-4 border-t border-border/50 flex justify-end gap-2">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <FileText className="w-4 h-4" /> View PDF
                                    </Button>
                                    {lease.status === 'pending_signature' && (
                                        <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="gap-2" onClick={() => setSelectedLease(lease)}>
                                                    <FileSignature className="w-4 h-4" /> Sign Document
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>E-Signature for {selectedLease?.id}</DialogTitle>
                                                    <DialogDescription>
                                                        By typing your name below, you agree that your electronic signature is the legally binding equivalent to your handwritten signature.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="p-4 bg-secondary/50 rounded-md border text-sm max-h-32 overflow-y-auto">
                                                        I acknowledge that I have read and agree to all terms and conditions outlined in Lease Agreement {selectedLease?.id} for {selectedLease?.property}, Unit {selectedLease?.unit}.
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Electronic Signature (Type Full Name)</Label>
                                                        <Input
                                                            value={signature}
                                                            onChange={(e) => setSignature(e.target.value)}
                                                            placeholder="John Smith"
                                                            className="font-serif text-lg py-6"
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => { setIsSignDialogOpen(false); setSignature(""); }}>Cancel</Button>
                                                    <Button onClick={handleSignLease}>Sign & Accept</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-primary/5 border-primary/20 sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-lg">Contract Summary</CardTitle>
                                <CardDescription>Property Manager overview</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Active Leases</span>
                                    <span className="font-semibold text-lg">145</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Pending Signatures</span>
                                    <span className="font-semibold text-lg text-yellow-600">12</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Expiring in 30 days</span>
                                    <span className="font-semibold text-lg text-red-500">8</span>
                                </div>
                                <div className="pt-4 border-t border-border/50">
                                    <Button className="w-full" variant="outline" onClick={() => toast({ title: "Reminders Sent", description: "Email reminders have been sent to 12 tenants with pending signatures." })}>
                                        Remind Unsigned Tenants
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Leases;
