import React from 'react';
import { Undo, Redo, ZoomIn, ZoomOut, Play, Save } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { IconButton } from './IconButton';

export const Toolbar: React.FC = () => {
    const {
        undo,
        redo,
        scale,
        setScale,
        togglePreviewMode,
        isPreviewMode,
        elements,
        width,
        height
    } = useEditorStore();

    const handleZoomIn = () => setScale(Math.min(scale + 0.1, 1.5));
    const handleZoomOut = () => setScale(Math.max(scale - 0.1, 0.5));

    const handleSave = () => {
        const output = {
            ratio: `${width}:${height}`, // Simplified ratio logic
            elements: elements.map(({ id, ...rest }) => rest), // Remove internal ID for clean export if needed, but keeping for now
            dimensions: { width, height }
        };
        console.log('Saved Layout:', JSON.stringify(output, null, 2));
        alert('Layout saved to console (check dev tools)');
    };

    return (
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-800 tracking-tight">GreetCard Editor</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <IconButton icon={Undo} onClick={undo} label="" variant="ghost" className="h-8 w-8" />
                    <IconButton icon={Redo} onClick={redo} label="" variant="ghost" className="h-8 w-8" />
                </div>

                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 px-2">
                    <IconButton icon={ZoomOut} onClick={handleZoomOut} variant="ghost" className="h-8 w-8" />
                    <span className="text-xs font-mono w-10 text-center">{Math.round(scale * 100)}%</span>
                    <IconButton icon={ZoomIn} onClick={handleZoomIn} variant="ghost" className="h-8 w-8" />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={togglePreviewMode}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isPreviewMode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <Play size={16} />
                    {isPreviewMode ? 'Exit Preview' : 'Preview'}
                </button>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <Save size={16} />
                    Save Layout
                </button>
            </div>
        </div>
    );
};
