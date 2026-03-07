import { useState } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Send, MoreVertical, Phone, Video, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const contacts = [
    { id: "1", name: "Alice Wonderland", role: "Manager", status: "online", lastMessage: "I'll dispatch a plumber tomorrow.", timestamp: "10:42 AM", unread: 2 },
    { id: "2", name: "Bob Builder", role: "Tenant (Apt 2B)", status: "offline", lastMessage: "Thanks for the update!", timestamp: "Yesterday", unread: 0 },
    { id: "3", name: "Charlie Chaplin", role: "Tenant (Apt 3C)", status: "online", lastMessage: "Could you check my recent rent payment?", timestamp: "Yesterday", unread: 0 },
    { id: "4", name: "Diana Prince", role: "Owner", status: "offline", lastMessage: "Please review the new policy draft.", timestamp: "Monday", unread: 0 },
    { id: "5", name: "Eve Polastri", role: "Maintenance", status: "online", lastMessage: "Finished the repairs in Unit 5A.", timestamp: "Last Week", unread: 0 },
];

const initialMessages = [
    { id: "m1", senderId: "1", text: "Hello! We received your maintenance request regarding the leaking faucet.", timestamp: "10:30 AM", isMe: false },
    { id: "m2", senderId: "me", text: "Hi Alice, yes it's been leaking since last night.", timestamp: "10:35 AM", isMe: true },
    { id: "m3", senderId: "1", text: "I apologize for the inconvenience. I'll dispatch a plumber tomorrow.", timestamp: "10:42 AM", isMe: false },
];

const Messages = () => {
    const { t } = useLanguage();
    const [selectedContact, setSelectedContact] = useState(contacts[0]);
    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState("");

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage = {
            id: `m${Date.now()}`,
            senderId: "me",
            text: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setMessages([...messages, newMessage]);
        setInputValue("");
    };

    return (
        <div className="min-h-screen flex flex-col w-full bg-background">
            <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 flex overflow-hidden lg:h-[calc(100vh-4rem)]">
                <div className="flex w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden h-[80vh] lg:h-full">

                    {/* Contacts Sidebar */}
                    <div className="w-full md:w-80 border-r border-border flex flex-col bg-muted/20">
                        <div className="p-4 border-b border-border">
                            <h1 className="text-xl font-bold mb-4">Messages</h1>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search messages..." className="pl-9 bg-background" />
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-1">
                                {contacts.map((contact) => (
                                    <button
                                        key={contact.id}
                                        onClick={() => setSelectedContact(contact)}
                                        className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${selectedContact.id === contact.id ? 'bg-primary/10' : 'hover:bg-muted'}`}
                                    >
                                        <div className="relative">
                                            <Avatar>
                                                <AvatarFallback className="bg-primary/20 text-primary">
                                                    {contact.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="font-semibold truncate pr-2">{contact.name}</span>
                                                <span className="text-xs text-muted-foreground shrink-0">{contact.timestamp}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground truncate pr-2">{contact.lastMessage}</span>
                                                {contact.unread > 0 && (
                                                    <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
                                                        {contact.unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Chat Area */}
                    <div className="hidden md:flex flex-col flex-1 bg-background relative">
                        {/* Chat Header */}
                        <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback className="bg-primary/20 text-primary">
                                        {selectedContact.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="font-semibold">{selectedContact.name}</h2>
                                    <p className="text-xs text-muted-foreground">{selectedContact.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon"><Info className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                <div className="text-center">
                                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">Today</span>
                                </div>
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                            <div
                                                className={`px-4 py-2 rounded-2xl ${msg.isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm'}`}
                                            >
                                                {msg.text}
                                            </div>
                                            <span className="text-xs text-muted-foreground mt-1 px-1">{msg.timestamp}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t border-border bg-card">
                            <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your message..."
                                    className="rounded-full pr-12 bg-background focus-visible:ring-1"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="rounded-full absolute right-1 top-1 h-8 w-8"
                                    disabled={!inputValue.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* <Footer /> - Omitted for a more app-like feel on messaging */}
        </div>
    );
};

export default Messages;
