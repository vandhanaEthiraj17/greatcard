import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Icon } from "@/components/common/Icon";
import { Move, Type, ZoomIn, ZoomOut, Save } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

interface Layer {
    id: string;
    type: 'text' | 'image' | 'logo';
    name: string;
    content: string;
    x: number;
    y: number;
    visible: boolean;
    style: {
        font?: string;
        size?: number;
        color?: string;
        align?: 'left' | 'center' | 'right';
    };
}

interface StepVisualPositioningProps {
    onNext: (data: { layers: Layer[] }) => void;
    onBack: () => void;
    initialData?: { layers: Layer[], template?: any, localFile?: File, aspectRatio?: string } | null;
}

const StepVisualPositioning = ({ onNext, onBack, initialData }: StepVisualPositioningProps) => {
    const [zoom, setZoom] = useState(100);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

    // Determine canvas dimensions based on aspect ratio
    const getCanvasDimensions = () => {
        const ratio = initialData?.aspectRatio || '9:16';
        switch (ratio) {
            case '16:9': return { width: 800, height: 450, label: '16:9 (1920x1080)' };
            case '1:1': return { width: 600, height: 600, label: '1:1 (1080x1080)' };
            case '9:16':
            default:
                return { width: 450, height: 800, label: '9:16 (1080x1920)' };
        }
    };

    const canvasDims = getCanvasDimensions();

    useEffect(() => {
        if (initialData?.localFile) {
            const url = URL.createObjectURL(initialData.localFile);
            setBackgroundUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (initialData?.template?.previewPath) {
            setBackgroundUrl(initialData.template.previewPath);
        }
    }, [initialData]);

    const [layers, setLayers] = useState<Layer[]>(initialData?.layers || [
        {
            id: 'logo-1',
            type: 'logo',
            name: 'Logo',
            content: 'LOGO',
            x: 80,
            y: 80,
            visible: true,
            style: { size: 64, color: '#e5e7eb' }
        },
        {
            id: 'greeting-1',
            type: 'text',
            name: 'Greeting',
            content: 'Happy Holidays!',
            x: canvasDims.width / 2,
            y: 150,
            visible: true,
            style: { font: 'Playfair', size: 48, color: '#1f2937', align: 'center' }
        },
        {
            id: 'name-1',
            type: 'text',
            name: 'Recipient Name',
            content: '{Recipient Name}',
            x: canvasDims.width / 2,
            y: canvasDims.height - 150,
            visible: true,
            style: { font: 'Inter', size: 32, color: '#374151', align: 'center' }
        }
    ]);

    const handleLayerUpdate = (id: string, updates: Partial<Layer> | Partial<Layer['style']>) => {
        setLayers(prev => prev.map(layer => {
            if (layer.id !== id) return layer;

            if ('font' in updates || 'size' in updates || 'color' in updates || 'align' in updates) {
                return { ...layer, style: { ...layer.style, ...updates } };
            }
            return { ...layer, ...updates };
        }));
    };

    const selectedLayer = layers.find(l => l.id === selectedElementId);

    const handleSaveLayout = async () => {
        if (!initialData?.template?._id) {
            // For local files, we might just save locally or skip server save for now
            alert("Local layout saved in session.");
            return;
        }

        try {
            const res = await fetch(`/api/templates/${initialData.template._id}/layout`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ layout: layers })
            });
            const data = await res.json();
            if (data.success) {
                alert("Layout saved successfully!");
            } else {
                alert("Failed to save layout: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error saving layout");
        }
    };

    const handleContinue = () => {
        onNext({ layers });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Visual Positioning</h2>
                <p className="text-gray-500">Adjust the placement of dynamic elements</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icon icon={Move} className="text-brand-purple" />
                        Visual Editor
                    </CardTitle>
                    <CardDescription>Drag and drop elements to position them on the card.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row gap-6 h-[700px] border rounded-xl overflow-hidden">
                        {/* LEFT: Canvas Area */}
                        <div className="flex-1 bg-gray-100 border-r border-gray-200 overflow-hidden relative flex flex-col">
                            {/* Toolbar */}
                            <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(z - 10, 50))}><ZoomOut size={16} /></Button>
                                    <span className="text-xs font-medium w-12 text-center">{zoom}%</span>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(z + 10, 200))}><ZoomIn size={16} /></Button>
                                </div>
                                <Badge variant="outline" className="bg-gray-50">{canvasDims.label}</Badge>
                            </div>

                            {/* Canvas Content */}
                            <div className="flex-1 overflow-auto flex items-center justify-center p-8">
                                <div
                                    className="bg-white shadow-2xl relative transition-transform duration-200"
                                    style={{
                                        width: canvasDims.width,
                                        height: canvasDims.height,
                                        transform: `scale(${zoom / 100})`,
                                        transformOrigin: 'center center',
                                        flexShrink: 0
                                    }}
                                >
                                    {/* Background */}
                                    <div className="absolute inset-0 bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                        {backgroundUrl ? (
                                            <img src={backgroundUrl} className="w-full h-full object-cover" alt="Template Background" />
                                        ) : (
                                            <p className="text-gray-300 text-lg font-bold opacity-20 transform -rotate-12">TEMPLATE BACKGROUND</p>
                                        )}
                                    </div>

                                    {/* Render Layers */}
                                    {layers.map(layer => (
                                        <div
                                            key={layer.id}
                                            className={`absolute cursor-move border-2 border-dashed p-2 transition-colors ${selectedElementId === layer.id ? 'border-brand-blue bg-blue-50/20' : 'border-transparent hover:border-gray-300'}`}
                                            style={{
                                                left: layer.x,
                                                top: layer.y,
                                                // basic style mapping
                                                transform: 'translate(-50%, -50%)', // Centering based on coords
                                                whiteSpace: 'nowrap'
                                            }}
                                            onClick={(e) => { e.stopPropagation(); setSelectedElementId(layer.id); }}
                                        >
                                            {layer.type === 'logo' ? (
                                                <div className="w-16 h-16 bg-gray-200/50 rounded-full flex items-center justify-center text-xs text-gray-500 border border-gray-300">Logo</div>
                                            ) : (
                                                <div style={{
                                                    fontFamily: layer.style?.font,
                                                    fontSize: layer.style?.size,
                                                    color: layer.style?.color,
                                                    textAlign: layer.style?.align
                                                }}>
                                                    {layer.content}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Property Panel */}
                        <div className="w-full lg:w-80 bg-white flex flex-col">
                            <div className="p-4 border-b border-gray-100 font-semibold flex items-center gap-2">
                                <Icon icon={Move} size={18} />
                                Layer Properties
                            </div>

                            <div className="flex-1 p-4 overflow-y-auto space-y-6">
                                {selectedLayer ? (
                                    <>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium text-brand-blue">{selectedLayer.name}</h4>
                                                <Toggle checked={selectedLayer.visible} onChange={(e) => handleLayerUpdate(selectedLayer.id, { visible: e.target.checked })} label="Visible" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 mb-1 block">X Position</label>
                                                    <Input type="number" value={selectedLayer.x} onChange={(e) => handleLayerUpdate(selectedLayer.id, { x: parseInt(e.target.value) })} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Y Position</label>
                                                    <Input type="number" value={selectedLayer.y} onChange={(e) => handleLayerUpdate(selectedLayer.id, { y: parseInt(e.target.value) })} />
                                                </div>
                                            </div>
                                        </div>

                                        {selectedLayer.type === 'text' && (
                                            <div className="pt-4 border-t border-gray-100 space-y-4">
                                                <div className="flex items-center gap-2 font-medium text-sm">
                                                    <Icon icon={Type} size={16} /> Typography
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input type="number" value={selectedLayer.style.size} onChange={(e) => handleLayerUpdate(selectedLayer.id, { size: parseInt(e.target.value) })} label="Size (px)" />
                                                    <Input type="color" className="h-[38px] p-1 cursor-pointer" value={selectedLayer.style.color} onChange={(e) => handleLayerUpdate(selectedLayer.id, { color: e.target.value })} label="Color" />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center text-gray-400 py-10">
                                        <p>Select an element on canvas to edit properties</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50">
                                <Button type="button" className="w-full mb-2" variant="outline" onClick={handleSaveLayout} disabled={!initialData?.template}>
                                    <Save className="mr-2 h-4 w-4" /> Save Layout
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between pt-4 pb-20">
                <Button type="button" variant="secondary" onClick={onBack}>
                    Back
                </Button>
                <Button type="button" variant="cta" onClick={handleContinue}>
                    Next Step: Output & Distribution
                </Button>
            </div>
        </div>
    );
};

export default StepVisualPositioning;
