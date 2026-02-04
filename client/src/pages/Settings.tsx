import { Icon } from "@/components/common/Icon";
import { Button } from "@/components/ui/Button";
import { Bell, Lock, Globe, Moon } from "lucide-react";

const Settings = () => {
    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your preferences and application settings.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                {/* Notification Settings */}
                <div className="p-6 flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="p-2 bg-blue-50 text-brand-blue rounded-lg">
                            <Icon icon={Bell} size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
                            <p className="text-sm text-gray-500">Manage how you receive alerts and updates.</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                </div>

                {/* Security */}
                <div className="p-6 flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Icon icon={Lock} size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Security</h3>
                            <p className="text-sm text-gray-500">Password, 2FA, and login sessions.</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                </div>

                {/* Appearance */}
                <div className="p-6 flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Icon icon={Moon} size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Appearance</h3>
                            <p className="text-sm text-gray-500">Customize the look and feel.</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">Theme</Button>
                </div>

                {/* Language */}
                <div className="p-6 flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <Icon icon={Globe} size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Language</h3>
                            <p className="text-sm text-gray-500">Select your preferred language.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">English</span>
                        <Button variant="outline" size="sm">Change</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
