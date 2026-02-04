import { useState, useRef, useEffect } from 'react';
import { Bell, User, Search, Settings, LogOut, UserCircle } from 'lucide-react';
import { Icon } from '@/components/common/Icon';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
    title?: string;
}

const Header = ({ title = "Dashboard" }: HeaderProps) => {
    const logout = useAuthStore((state: any) => state.logout);
    const user = useAuthStore((state) => state.user);

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            logout();
            // AppLayout will handle redirect
        }
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center px-6 justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800 tracking-tight">{title}</h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Search Bar - Visual Only */}
                <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-64 border border-transparent focus-within:border-brand-blue focus-within:bg-white transition-all">
                    <Icon icon={Search} className="text-gray-400 mr-2" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                    />
                </div>

                <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block"></div>

                {/* Actions */}
                <Link to="/notifications">
                    <button className="p-2 text-gray-500 hover:text-brand-blue hover:bg-blue-50 rounded-full transition-colors relative">
                        <Icon icon={Bell} size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-brand-red rounded-full border border-white"></span>
                    </button>
                </Link>

                <div className="relative" ref={profileRef}>
                    <div
                        className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <div className="w-9 h-9 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue border border-brand-blue/20 overflow-hidden">
                            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <Icon icon={User} size={18} />}
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-gray-700">{user?.name || "Admin User"}</p>
                            <p className="text-xs text-gray-400">Administrator</p>
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                        <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-900">{user?.name || "Admin User"}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email || "admin@greetcard.com"}</p>
                            </div>
                            <div className="py-1">
                                <Link
                                    to="/profile"
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Icon icon={UserCircle} size={16} /> Profile
                                </Link>
                                <Link
                                    to="/settings"
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Icon icon={Settings} size={16} /> Settings
                                </Link>
                            </div>
                            <div className="border-t border-gray-100 py-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Icon icon={LogOut} size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
export default Header;
