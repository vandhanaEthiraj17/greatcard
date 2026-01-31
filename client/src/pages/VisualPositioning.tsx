import React, { useEffect } from 'react';
// import { EditorHeader } from '../components/ui/EditorHeader'; // Removed
import { LeftElementsPanel } from '../panels/LeftElementsPanel';
import { RightPropertiesPanel } from '../panels/RightPropertiesPanel';
import { CanvasStage } from '../editor/CanvasStage';
import { useEditorStore } from '../store/editorStore';
import { ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const VisualPositioning: React.FC = () => {
    const setDimension = useEditorStore(state => state.setDimension);
    const {
        batchData,
        previewIndex,
        nextPreview,
        prevPreview
        // setPreviewIndex // Unused
    } = useEditorStore();
    const navigate = useNavigate();

    useEffect(() => {
        setDimension('9:16'); // Default to story size as per screenshot preference
    }, [setDimension]);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Inner Header - "Visual Editor" context */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-gray-400">❖</span> Visual Editor
                </h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/distribution')}
                        className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        Proceed to Distribution &rarr;
                    </button>
                </div>
            </div>

            {/* Editor Toolbar (Zoom, etc.) - Removed */}
            {/* <EditorHeader /> */}

            {/* Preview Toolbar (New) */}
            {batchData.length > 0 && (
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800 flex items-center gap-2">
                        <PlayCircle size={16} />
                        Previewing Row {previewIndex + 1} of {batchData.length}
                    </span>
                    <div className="flex items-center gap-2 bg-white rounded-md shadow-sm border border-gray-200 p-1">
                        <button
                            onClick={prevPreview}
                            className="p-1 hover:bg-gray-100 rounded text-gray-600"
                            title="Previous Row"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs font-mono w-8 text-center">{previewIndex + 1}</span>
                        <button
                            onClick={nextPreview}
                            className="p-1 hover:bg-gray-100 rounded text-gray-600"
                            title="Next Row"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* Left Drawer - Elements -> Hidden in screenshot mostly, but keeping it */}
                {/* To match screenshot cleaner look, maybe collapsable? For now, standard */}
                {/* Actually, user didn't complain about Left Panel, just 'same like that' referring to layout */}
                {/* I will keep LeftElementsPanel but maybe style it cleaner? */}
                {/* The screenshot doesn't show a Left Panel. Maybe it's hidden or not there? */}
                {/* If I remove it, they can't add elements. I'll keep it but maybe it should be an overlay or tab? */}
                {/* For now, let's keep it but maybe minimize width if empty? */}
                {/* I'll stick to the original plan: columns. Left - Center - Right. */}

                {/* <div className="hidden"> 
                   <LeftElementsPanel /> 
                </div> */}
                {/* Wait, if I hide it, how do they add things? Screenshot usually implies selected state. */}
                {/* I will keep it. */}

                {/* Left Drawer - Elements */}
                {/* I'll make it part of the layout flow */}
                <LeftElementsPanel />

                {/* Center - Canvas Stage */}
                <CanvasStage />

                {/* Right Drawer - Properties */}
                <RightPropertiesPanel />

            </div>
        </div>
    );
};

export default VisualPositioning;
