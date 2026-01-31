import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/navigation/Sidebar';
import Header from '@/components/navigation/Header';

const AppLayout = () => {
    const location = useLocation();

    // Simple map to get title from path
    const getPageTitle = () => {
        switch (location.pathname) {
            case '/dashboard': return 'Dashboard & Analytics';
            case '/generate': return 'Generate Template';
            case '/select-template': return 'Select Template';
            case '/input-data': return 'Input Data';
            case '/visual-positioning':
            case '/editor': return 'Visual Positioning';
            case '/distribution': return 'Output & Distribution';
            default: return 'Overview';
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">
            <Sidebar />

            <main className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
                <Header title={getPageTitle()} />

                <div className="flex-1 p-6 md:p-8 overflow-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Outlet />
                    </div>
                </div>

                <footer className="h-12 bg-white border-t border-gray-200 flex items-center justify-between px-8 text-xs text-gray-400">
                    <span>&copy; 2024 GreatCard Inc.</span>
                    <span className="hidden md:inline">Enterprise Edition v1.0.0</span>
                </footer>
            </main>
        </div>
    );
};

export default AppLayout;
