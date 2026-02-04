import { useEditorStore, Layer } from "@/store/editorStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";
import { Icon } from "@/components/common/Icon";
import {
    AlignLeft, AlignCenter, AlignRight,
    Bold, Italic, Layers, Trash2, Lock, Unlock, Copy
} from "lucide-react";

export const PropertiesPanel = () => {
    const {
        layoutLayers, selectedId,
        updateLayoutLayer, deleteElement
    } = useEditorStore();

    const selectedLayer = layoutLayers.find(l => l.id === selectedId);

    // 1. Context Awareness: No Selection
    if (!selectedLayer) {
        return (
            <div className="w-80 h-full bg-white border-l border-gray-200 p-6 flex flex-col items-center justify-center text-gray-400 font-medium">
                <Icon icon={Layers} size={48} className="mb-4 opacity-20" />
                <p>Select an element to edit</p>
            </div>
        );
    }

    const handleChange = (updates: Partial<Layer>) => {
        if (selectedLayer.locked && !('locked' in updates)) return;
        updateLayoutLayer(selectedLayer.id, updates);
    };

    // Helper: Consolidated style updater
    const handleStyleChange = (styleUpdates: Partial<Layer['style']>) => {
        if (selectedLayer.locked) return;
        // Strictly send as { style: ... } to match store expectations and VisualCanvas requirements
        // @ts-ignore
        updateLayoutLayer(selectedLayer.id, { style: styleUpdates });
    };

    const isText = selectedLayer.type === 'text';

    return (
        <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col shadow-xl z-20 animate-in slide-in-from-right duration-200">

            {/* Header: Layer Name & Actions */}
            <div className="flex-none p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="font-semibold text-gray-800 truncate pr-2 max-w-[150px]">
                    {selectedLayer.name}
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" onClick={() => handleChange({ locked: !selectedLayer.locked })}>
                        <Icon icon={selectedLayer.locked ? Lock : Unlock} size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" onClick={() => alert("Duplicate coming soon")}>
                        <Icon icon={Copy} size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => deleteElement(selectedLayer.id)}>
                        <Icon icon={Trash2} size={14} />
                    </Button>
                </div>
            </div>

            {/* Main Toolbar */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {/* TEXT EDITOR CONTROLS */}
                {isText && (
                    <>
                        {/* 1. Font Family */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Font</label>
                            <Select
                                value={selectedLayer.style.font || 'Inter'}
                                onChange={(val) => handleStyleChange({ font: val })}
                                options={[
                                    { label: 'Inter', value: 'Inter' },
                                    { label: 'Roboto', value: 'Roboto' },
                                    { label: 'Playfair Display', value: 'Playfair Display' },
                                    { label: 'Poppins', value: 'Poppins' },
                                    { label: 'Lora', value: 'Lora' },
                                ]}
                            />
                        </div>

                        {/* 2. Size & Color */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Size</label>
                                <Input
                                    type="number"
                                    value={selectedLayer.style.size || 24}
                                    onChange={(e) => handleStyleChange({ size: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Color</label>
                                <div className="flex items-center h-[38px] w-full border rounded-md px-2 bg-white">
                                    <input
                                        type="color"
                                        className="w-full h-6 cursor-pointer bg-transparent border-none p-0"
                                        value={selectedLayer.style.color || '#000000'}
                                        onChange={(e) => handleStyleChange({ color: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Style (Bold/Italic/Align) */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Style</label>
                            <div className="flex bg-gray-100 p-1 rounded-md">
                                {/* Bold */}
                                <button
                                    className={`flex-1 flex justify-center py-1.5 rounded items-center transition-colors ${selectedLayer.style.weight === 'bold' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => handleStyleChange({ weight: selectedLayer.style.weight === 'bold' ? 'normal' : 'bold' })}
                                    title="Bold"
                                >
                                    <Icon icon={Bold} size={16} />
                                </button>
                                {/* Italic */}
                                <button
                                    className={`flex-1 flex justify-center py-1.5 rounded items-center transition-colors ${selectedLayer.style.fontStyle === 'italic' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => handleStyleChange({ fontStyle: selectedLayer.style.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                    title="Italic"
                                >
                                    <Icon icon={Italic} size={16} />
                                </button>
                                <div className="w-px bg-gray-300 mx-1 my-1"></div>
                                {/* Alignment */}
                                {['left', 'center', 'right'].map((align) => (
                                    <button
                                        key={align}
                                        className={`flex-1 flex justify-center py-1.5 rounded items-center transition-colors ${selectedLayer.style.align === align ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => handleStyleChange({ align: align as any })}
                                        title={`Align ${align}`}
                                    >
                                        {align === 'left' && <Icon icon={AlignLeft} size={16} />}
                                        {align === 'center' && <Icon icon={AlignCenter} size={16} />}
                                        {align === 'right' && <Icon icon={AlignRight} size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Spacing */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Spacing</label>

                            {/* Letter Spacing Only - Removed Line Height */}
                            <div className="space-y-2">

                                {/* Letter Spacing */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Letter Spacing</span>
                                        <span>{selectedLayer.style.letterSpacing || 0}px</span>
                                    </div>
                                    <Slider
                                        value={[selectedLayer.style.letterSpacing || 0]}
                                        min={-2}
                                        max={10}
                                        step={0.5}
                                        onValueChange={(val) => handleStyleChange({ letterSpacing: val[0] })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Input Content (Always Visible for Text) */}
                        <div className="space-y-2 pt-4 border-t border-gray-100">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Content</label>
                            <textarea
                                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-2 ring-brand-blue outline-none min-h-[80px]"
                                value={selectedLayer.content}
                                onChange={(e) => handleChange({ content: e.target.value })}
                                placeholder="Enter text here..."
                            />
                        </div>
                    </>
                )}

                {/* NON-TEXT LAYERS (Simple Fallback) */}
                {!isText && (
                    <div className="text-center py-10 space-y-4">
                        <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-200">
                            <p className="text-sm text-gray-500">Image selected.</p>
                            <p className="text-xs text-gray-400 mt-1">Resize directly on canvas.</p>
                        </div>
                        {selectedLayer.type === 'logo' && (
                            <p className="text-xs text-blue-500">This is your brand logo placeholder.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
