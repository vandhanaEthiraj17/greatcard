import React from 'react';
import { CardCanvas } from './CardCanvas';

export const CanvasStage: React.FC = () => {
    return (
        <div className="flex-1 bg-gray-100 overflow-auto relative flex items-center justify-center p-8">
            <CardCanvas />
        </div>
    );
};
