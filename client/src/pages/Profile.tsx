import { User, Mail, Shield } from "lucide-react";
import { Icon } from "@/components/common/Icon";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";

const Profile = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-brand-blue/10 to-purple-100"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-12 mb-6">
                        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md inline-block">
                            {user?.avatar ? (
                                <img src={user.avatar} className="w-full h-full rounded-full object-cover bg-gray-50" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <Icon icon={User} size={40} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user?.name || "Admin User"}</h1>
                            <p className="text-gray-500">Administrator</p>
                        </div>

                        <div className="grid gap-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="p-2 bg-white rounded-lg border border-gray-200">
                                    <Icon icon={Mail} className="text-gray-500" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Email Address</p>
                                    <p className="text-sm text-gray-500">{user?.email || "admin@greetcard.com"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="p-2 bg-white rounded-lg border border-gray-200">
                                    <Icon icon={Shield} className="text-gray-500" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Role</p>
                                    <p className="text-sm text-gray-500">Super Admin</p>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full sm:w-auto">Edit Profile</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
