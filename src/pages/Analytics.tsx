import { useState } from "react";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";
import { DollarSign, Home, Wrench, TrendingUp, Users } from "lucide-react";

const revenueData = [
    { month: "Jan", revenue: 42000, expenses: 15000 },
    { month: "Feb", revenue: 45000, expenses: 18000 },
    { month: "Mar", revenue: 50000, expenses: 16000 },
    { month: "Apr", revenue: 48000, expenses: 22000 },
    { month: "May", revenue: 53000, expenses: 19000 },
    { month: "Jun", revenue: 58000, expenses: 24000 },
    { month: "Jul", revenue: 62000, expenses: 21000 },
];

const occupancyData = [
    { name: "Occupied", value: 168 },
    { name: "Vacant", value: 12 },
    { name: "Maintenance", value: 4 },
];

const maintenanceData = [
    { name: "Plumbing", requests: 45 },
    { name: "Electrical", requests: 30 },
    { name: "HVAC", requests: 62 },
    { name: "Appliance", requests: 28 },
    { name: "General", requests: 55 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const OCCUPANCY_COLORS = ['#10b981', '#ef4444', '#f59e0b']; // green, red, yellow

const Analytics = () => {
    const { t } = useLanguage();
    const [timeRange, setTimeRange] = useState("6m");

    return (
        <div className="min-h-screen flex flex-col w-full bg-gradient-to-b from-background to-secondary/20">
            <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Analytics Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Comprehensive overview of financial performance and property health.
                    </p>
                </div>

                {/* Top level KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
                            <DollarSign className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$358,000</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-green-500 font-medium">+14.5%</span> from last year
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                            <Home className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">91.3%</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-green-500 font-medium">+2.1%</span> from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">342</div>
                            <p className="text-xs text-muted-foreground mt-1">Across 6 properties</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open Maintenance</CardTitle>
                            <Wrench className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3 text-red-500" />
                                <span className="text-red-500 font-medium">+5</span> since last week
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="financial" className="space-y-4">
                    <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                        <TabsTrigger value="financial">Financial</TabsTrigger>
                        <TabsTrigger value="operations">Operations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="financial" className="space-y-4">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Cash Flow Overview</CardTitle>
                                <CardDescription>Monthly revenue versus expenses for the selected period.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px] pl-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip formatter={(value) => `$${value}`} />
                                        <Legend />
                                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                                        <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="operations" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Unit Status</CardTitle>
                                    <CardDescription>Current distribution of all property units.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px] flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={occupancyData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {occupancyData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={OCCUPANCY_COLORS[index % OCCUPANCY_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Maintenance by Category</CardTitle>
                                    <CardDescription>Volume of requests categorized by service type.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={maintenanceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} width={80} />
                                            <Tooltip />
                                            <Bar dataKey="requests" name="Total Requests" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                                {maintenanceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            <Footer />
        </div>
    );
};

export default Analytics;
