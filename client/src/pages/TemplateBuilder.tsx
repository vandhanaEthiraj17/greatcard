import { useEffect, useState } from 'react';
import { useEditorStore, Layer } from "@/store/editorStore";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/common/Icon";
import {
    LayoutTemplate, Lock, Unlock, Save, Layers, Upload,
    Type, Image, Square, Move, Code, Eye
} from "lucide-react";

import { VisualCanvas } from "@/components/editor/VisualCanvas";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { LayerListPanel } from "@/components/editor/LayerListPanel";

const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1920;

export const TemplateBuilder = () => {
    const {
        setTemplateBuilderMode,
        setLayoutLayers,
        layoutLayers,
        addLayoutLayer,
        selectedId
    } = useEditorStore();

    const [leftActiveTab, setLeftActiveTab] = useState<'layers' | 'assets'>('layers');

    useEffect(() => {
        setTemplateBuilderMode(true);
        // Start with empty or base layer if none, but don't overwrite if loading
        if (layoutLayers.length === 0) {
            setLayoutLayers([
                {
                    id: 'bg-1',
                    type: 'background',
                    name: 'Background',
                    content: '', // Empty for color or image
                    x: 0, y: 0,
                    visible: true,
                    locked: true,
                    width: DEFAULT_WIDTH,
                    height: DEFAULT_HEIGHT,
                    style: { backgroundColor: '#ffffff' }
                }
            ]);
        }

        return () => setTemplateBuilderMode(false);
    }, []);

    const handleSave = () => {
        const templateData = {
            metadata: {
                name: "New Template",
                dimensions: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
                categories: ["Birthday"],
                version: "1.0"
            },
            layers: layoutLayers
        };

        const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `template-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                if (data.layers && Array.isArray(data.layers)) {
                    setLayoutLayers(data.layers);
                } else {
                    alert("Invalid template file format");
                }
            } catch (err) {
                console.error(err);
                alert("Failed to parse JSON");
            }
        };
        reader.readAsText(file);
    };

    const addText = () => {
        addLayoutLayer({
            id: `text-${Date.now()}`,
            type: 'text',
            name: 'New Text',
            content: 'Double click to edit',
            x: DEFAULT_WIDTH / 2,
            y: DEFAULT_HEIGHT / 2,
            visible: true,
            style: { font: 'Inter', size: 48, color: '#000000', align: 'center' }
        });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
            {/* BUILDER HEADER */}
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-purple-600 text-white p-2 rounded-lg">
                        <Icon icon={Code} size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">Template Builder</h1>
                        <p className="text-xs text-gray-500">Creating 'New Template'</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleLoad}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            title="Load JSON"
                        />
                        <Button variant="outline"><Upload size={16} className="mr-2" /> Load JSON</Button>
                    </div>
                    <Button variant="outline" onClick={() => console.log('Preview')}><Eye size={16} className="mr-2" /> Preview</Button>
                    <Button variant="cta" onClick={handleSave}><Save size={16} className="mr-2" /> Save JSON</Button>
                </div>
            </div>

            {/* BUILDER WORKSPACE */}
            <div className="flex-1 flex overflow-hidden">

                {/* TOOL CHEST (Left Strip) */}
                <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4 z-20">
                    <button
                        onClick={() => setLeftActiveTab('layers')}
                        className={`p-3 rounded-xl transition-all ${leftActiveTab === 'layers' ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:bg-gray-50'}`}
                        title="Layers"
                    >
                        <Icon icon={Layers} size={24} />
                    </button>
                    <button
                        onClick={() => setLeftActiveTab('assets')}
                        className={`p-3 rounded-xl transition-all ${leftActiveTab === 'assets' ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:bg-gray-50'}`}
                        title="Assets"
                    >
                        <Icon icon={LayoutTemplate} size={24} />
                    </button>
                </div>

                {/* LEFT DRAWER (Layers or Assets) */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-10">
                    {leftActiveTab === 'layers' ? (
                        <LayerListPanel />
                    ) : (
                        <div className="p-4 space-y-4">
                            <h3 className="font-bold text-gray-700">Add Assets</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="flex-col h-20 gap-2" onClick={addText}>
                                    <Type size={24} />
                                    <span className="text-xs">Add Text</span>
                                </Button>
                                <Button variant="outline" className="flex-col h-20 gap-2">
                                    <Image size={24} />
                                    <span className="text-xs">Add Image</span>
                                </Button>
                                <Button variant="outline" className="flex-col h-20 gap-2">
                                    <Square size={24} />
                                    <span className="text-xs">Add Shape</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* VISUAL CANVAS (Middle) */}
                <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-12 relative">
                    {/* Safe Zone Overlay / Grid lines could go here */}
                    <div className="border border-purple-200 shadow-2xl relative bg-white">
                        <VisualCanvas
                            width={DEFAULT_WIDTH}
                            height={DEFAULT_HEIGHT}
                            zoom={50}
                            backgroundUrl={null}
                        />
                        {/* Builder Overlay - e.g. showing margins */}
                        <div className="absolute inset-0 border-2 border-dashed border-purple-300 pointer-events-none opacity-50 m-[40px]"></div>
                        <div className="absolute top-2 right-2 bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded">Builder Mode Active</div>
                    </div>
                </div>

                {/* PROPERTIES PANEL (Right) */}
                <PropertiesPanel />
            </div>
        </div>
    );
};

export default TemplateBuilder;
