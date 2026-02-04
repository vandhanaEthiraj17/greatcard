import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import Dashboard from '@/pages/Dashboard';
import GenerateTemplate from '@/pages/GenerateTemplate';
import TemplateWorkflow from '@/pages/TemplateWorkflow';
import VisualPositioning from '@/pages/VisualPositioning';
import TemplateBuilder from '@/pages/TemplateBuilder';
import Notifications from '@/pages/Notifications';
import AuthLanding from '@/pages/AuthLanding';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/generate" element={<GenerateTemplate />} />
                <Route path="/create" element={<TemplateWorkflow />} />
                <Route path="/editor" element={<VisualPositioning />} />
                <Route path="/builder" element={<TemplateBuilder />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/auth" element={<AuthLanding />} />
        </Routes>
    );
};

export default AppRoutes;
