import { useState } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar as CalendarIcon, Clock, Users, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const mockAmenities = [
    {
        id: "1",
        name: "Clubhouse",
        description: "Spacious clubhouse perfect for private events and parties.",
        capacity: 50,
        price: "$50/hour",
        icon: Users,
        availableTimes: ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"],
    },
    {
        id: "2",
        name: "Swimming Pool",
        description: "Olympic-sized pool. Reservation required for lane swimming.",
        capacity: 10,
        price: "Free",
        icon: Clock,
        availableTimes: ["08:00 AM", "10:00 AM", "1:-00 PM", "3:00 PM"],
    },
    {
        id: "3",
        name: "Tennis Court",
        description: "Well-maintained outdoor tennis court.",
        capacity: 4,
        price: "$10/hour",
        icon: CalendarIcon,
        availableTimes: ["07:00 AM", "09:00 AM", "11:00 AM", "4:00 PM"],
    },
];

const Amenities = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [selectedAmenity, setSelectedAmenity] = useState<any>(null);

    const handleBooking = () => {
        if (!date || !selectedTime) {
            toast({
                title: "Incomplete details",
                description: "Please select a date and time for your booking.",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Booking Confirmed!",
            description: `You have successfully booked ${selectedAmenity.name} for ${format(date, "PPP")} at ${selectedTime}.`,
        });

        // Reset selection
        setSelectedTime("");
        setSelectedAmenity(null);
    };

    return (
        <div className="min-h-screen flex flex-col w-full bg-gradient-to-b from-background to-secondary/20">
            <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Amenities Booking</h1>
                    <p className="text-muted-foreground mt-2">
                        Reserve common areas and facilities for your convenience.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-semibold">Available Amenities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mockAmenities.map((amenity) => {
                                const Icon = amenity.icon;
                                return (
                                    <Card key={amenity.id} className="flex flex-col h-full hover:shadow-md transition-all">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                                    <Icon className="h-5 w-5 text-primary" />
                                                </div>
                                                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                                                    {amenity.price}
                                                </span>
                                            </div>
                                            <CardTitle>{amenity.name}</CardTitle>
                                            <CardDescription>{amenity.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>Capacity: {amenity.capacity} people</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        className="w-full"
                                                        onClick={() => setSelectedAmenity(amenity)}
                                                    >
                                                        Book Now
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Book {amenity.name}</DialogTitle>
                                                        <DialogDescription>
                                                            Select your preferred date and time for the reservation.
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="grid gap-4 py-4">
                                                        <div className="flex flex-col items-center gap-4">
                                                            <Calendar
                                                                mode="single"
                                                                selected={date}
                                                                onSelect={setDate}
                                                                className="rounded-md border shadow"
                                                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">Select Time</label>
                                                            <Select onValueChange={setSelectedTime} value={selectedTime}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select an available time slot" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {amenity.availableTimes.map((time) => (
                                                                        <SelectItem key={time} value={time}>
                                                                            {time}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    <DialogFooter>
                                                        <Button type="submit" onClick={handleBooking}>Confirm Booking</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">Your Bookings</h2>
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center justify-center text-center space-y-3 py-8">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="text-muted-foreground">You don't have any active bookings.</p>
                                    <Button variant="outline" className="mt-4">View History</Button>
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

export default Amenities;
