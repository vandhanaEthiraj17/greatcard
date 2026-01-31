import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import Dashboard from '@/pages/Dashboard';
import GenerateTemplate from '@/pages/GenerateTemplate';
import TemplateWorkflow from '@/pages/TemplateWorkflow';
import VisualPositioning from '@/pages/VisualPositioning';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/generate" element={<GenerateTemplate />} />
                <Route path="/create" element={<TemplateWorkflow />} />
                <Route path="/editor" element={<VisualPositioning />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
