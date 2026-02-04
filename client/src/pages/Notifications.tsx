import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/common/Icon";
import { Bell, Check, Clock } from "lucide-react";

const NOTIFICATIONS = [
    {
        id: 1,
        title: "Welcome to GreetCard!",
        message: "Get started by creating your first card template.",
        time: "Just now",
        read: false,
        type: "info"
    },
    {
        id: 2,
        title: "System Update",
        message: "We've updated the editor with new features.",
        time: "2 hours ago",
        read: true,
        type: "system"
    },
    {
        id: 3,
        title: "New Template Added",
        message: "Check out the new 'Anniversary' collection.",
        time: "1 day ago",
        read: true,
        type: "content"
    }
];

const Notifications = () => {
    return (
        <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-brand-blue">
                            <Icon icon={Bell} size={24} />
                        </div>
                        Notifications
                    </h1>
                    <p className="text-gray-500 mt-1">Stay updated with latest activities and alerts</p>
                </div>
                <Button variant="outline">
                    <Icon icon={Check} className="mr-2" size={16} /> Mark all as read
                </Button>
            </div>

            <div className="space-y-4">
                {NOTIFICATIONS.map((notif) => (
                    <div
                        key={notif.id}
                        className={`
                            p-4 rounded-xl border transition-all duration-200 hover:shadow-md
                            ${notif.read ? 'bg-white border-gray-200' : 'bg-blue-50/50 border-blue-100'}
                        `}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 w-2 h-2 rounded-full ${notif.read ? 'bg-gray-300' : 'bg-brand-blue'}`} />
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`text-sm font-semibold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                        {notif.title}
                                    </h3>
                                    <Badge variant="secondary" className="text-xs text-gray-500 font-normal flex items-center gap-1">
                                        <Icon icon={Clock} size={12} /> {notif.time}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
