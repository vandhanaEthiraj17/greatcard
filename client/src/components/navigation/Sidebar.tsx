import { useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Wand2,
    LayoutTemplate,
    LogOut
} from 'lucide-react';
import { Icon, cn } from '@/components/common/Icon';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/generate', label: 'Generate AI Card', icon: Wand2 },
    { path: '/create', label: 'Create Project', icon: LayoutTemplate },
];

import { Logo } from '@/components/common/Logo';

// ... (keep imports)

const Sidebar = () => {
    const location = useLocation();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-30 hidden md:flex flex-col shadow-lg">
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
                    <Logo size={32} />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Main Menu</p>

                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                isActive
                                    ? "bg-brand-blue text-white shadow-md shadow-blue-200"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-brand-blue"
                            )}
                        >
                            <Icon
                                icon={item.icon}
                                className={cn(isActive ? "text-white" : "text-gray-500 group-hover:text-brand-blue")}
                                size={20}
                            />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to logout?")) {
                            useAuthStore.getState().logout();
                            // Navigation will be handled by AppLayout redirect
                        }
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                >
                    <Icon icon={LogOut} size={20} />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
