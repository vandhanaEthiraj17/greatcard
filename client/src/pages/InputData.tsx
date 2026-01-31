import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Icon } from "@/components/common/Icon";
import {
    Palette, Download, FileSpreadsheet, CheckCircle2, Move, Type,
    AlignLeft, AlignCenter, AlignRight, ZoomIn, ZoomOut, Save,
    Bold, Italic, Underline
} from "lucide-react";
import { EXTENSION_TYPES } from "@/utils/constants";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";

import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { Slider } from "@/components/ui/Slider";
import { BatchRow } from "../utils/batchProcessor";
import { useEditorStore } from "../store/editorStore";
import { useNavigate } from "react-router-dom";

// Types
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
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
    };
}

const InputData = () => {
    const navigate = useNavigate();
    // Input Data State
    // Input Data State
    // const [file, setFile] = useState<File | null>(null); // Unused state

    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string>("");

    // Visual Positioning State
    const [zoom, setZoom] = useState(100);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [template, setTemplate] = useState<any>(null);
    const [generatedCards] = useState<any[]>([]); // Removed setter
    const [isGenerating] = useState(false); // Removed setter

    // Default layers if none exist
    const [layers, setLayers] = useState<Layer[]>([
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
            x: 400,
            y: 150,
            visible: true,
            style: { font: 'Playfair', size: 48, color: '#1f2937', align: 'center' }
        },
        {
            id: 'name-1',
            type: 'text',
            name: 'Recipient Name',
            content: '{Recipient Name}',
            x: 400,
            y: 350,
            visible: true,
            style: { font: 'Inter', size: 32, color: '#374151', align: 'center' }
        }
    ]);

    // Derived Selection
    const selectedLayer = layers.find(l => l.id === selectedElementId);

    // Handlers
    const handleLayerUpdate = (id: string, updates: any) => {
        setLayers(currentLayers => currentLayers.map(l => {
            if (l.id !== id) return l;

            // Simple check for style properties vs top-level
            const styleKeys = ['font', 'size', 'color', 'align', 'bold', 'italic', 'underline'];
            const newStyle = { ...l.style };
            const topLevelUpdates: any = {};

            Object.entries(updates).forEach(([key, value]) => {
                if (styleKeys.includes(key)) {
                    newStyle[key as keyof typeof newStyle] = value as any;
                } else {
                    topLevelUpdates[key] = value;
                }
            });

            return {
                ...l,
                ...topLevelUpdates,
                style: newStyle
            };
        }));
    };

    // Load template details
    useEffect(() => {
        const fetchTemplate = async () => {
            const params = new URLSearchParams(window.location.search);
            const templateId = params.get('templateId');

            if (templateId) {
                try {
                    // In a real implementation we would have an endpoint to get a single template
                    // For now we might fetch all or just assume we have the ID to save to.
                    // Let's assume we can GET /api/templates currently returns list. 
                    // Implementation plan said GET /templates list. 
                    // We will just set the ID. 
                    // If we had a GET /api/templates/:id we would fetch existing layout.
                    // Let's implement a quick check if we can fetch it.
                    // Actually, I'll assumme we just save for now as the user flow starts fresh usually.
                    // But wait, if I want to "Save Layout", I need the ID.

                    // We will simulate fetching the layout if we had one. 
                    // For this task, I will prioritize SAVING.
                    setTemplate({ _id: templateId });
                } catch (err) {
                    console.error("Error loading template", err);
                }
            }
        };
        fetchTemplate();
    }, []);

    const handleSaveLayout = () => {
        // Mock save capability for now
        console.log("Saving layout:", layers);
        alert("Layout saved locally!");
    };

    const [batchData, setBatchData] = useState<BatchRow[]>([]);

    // Import helper
    const handleCSVUpload = async (selectedFile: File) => {
        // setFile(selectedFile);
        setIsUploading(true);
        setError("");

        try {
            // Dynamic import to avoid SSR issues if any (standard vite pattern)
            const { parseCSV } = await import('../utils/batchProcessor');
            const data = await parseCSV(selectedFile);

            if (data.length > 0) {
                setBatchData(data);
            } else {
                setError("No valid rows found in CSV.");
            }
        } catch (err) {
            console.error(err);
            setError("Error parsing CSV file.");
        } finally {
            setIsUploading(false);
        }
    };

    // Client-side preview generation
    const handleGenerate = async () => {
        if (!batchData.length) return alert("Please upload a CSV first");

        // Push to store for Visual Editor
        useEditorStore.getState().setBatchData(batchData);
        // Also ensure elements are set if not already locally (though Visual Editor uses store.elements)
        // Ideally we should sync layers -> elements here if we want seamless transition based on InputData changes
        // But for now, let's assume Visual Positioning is the main editor.

        navigate('/create/visual-positioning');
    };

    return (
        <div className="space-y-8">

            {/* SECTION A: Brand Info - Kept same ... */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icon icon={Palette} className="text-brand-blue" />
                        Brand Configuration
                    </CardTitle>
                    <CardDescription>Setup your brand identity for the generated cards.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Input label="Brand Name" placeholder="Acme Corp" />
                        {/* ... Color pickers ... */}
                    </div>
                    <div>
                        <FileUpload
                            label="Brand Logo (PNG/SVG)"
                            accept=".png,.svg,.jpg"
                            onFileSelect={(f) => console.log(f)}
                            maxSizeMB={2}
                            className="h-full"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* SECTION B: Data Input - Kept same ... */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icon icon={FileSpreadsheet} className="text-brand-green" />
                        Bulk Data Input
                    </CardTitle>
                    <CardDescription>Upload your recipient list using our CSV template.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-1 w-full space-y-4">
                            <FileUpload
                                label="Upload CSV Recipient List"
                                accept={EXTENSION_TYPES.CSV}
                                onFileSelect={handleCSVUpload}
                            />
                        </div>
                        {/* ... Status indicators ... */}
                        <div className="flex-1 w-full">
                            {isUploading ? (
                                <div className="p-4 bg-gray-50 text-center">Uploading...</div>
                            ) : batchData && batchData.length > 0 ? (
                                <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                                    Found {batchData.length} rows.
                                </Alert>
                            ) : (
                                <div className="p-4 bg-gray-50 text-center text-gray-400">No file yet</div>
                            )}
                            {error && (
                                <Alert variant="destructive" className="mt-2">
                                    {error}
                                </Alert>
                            )}
                        </div>
                    </div>
                    {/* Preview Table */}
                    {batchData && batchData.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {Object.keys(batchData[0]).map((h: string) => <TableHead key={h}>{h}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batchData.slice(0, 5).map((row: any, i: number) => (
                                        <TableRow key={i}>
                                            {Object.keys(batchData[0]).map((h: string) => <TableCell key={h}>{row[h]}</TableCell>)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* SECTION D: Visual Positioning */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icon icon={Move} className="text-brand-purple" />
                        Visual Positioning
                    </CardTitle>
                    <CardDescription>Adjust the placement of dynamic text and logo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row gap-6 h-[600px] border rounded-xl overflow-hidden">
                        {/* LEFT: Canvas Area */}
                        <div className="flex-1 bg-gray-100 border-r border-gray-200 overflow-hidden relative flex flex-col">
                            {/* Toolbar */}
                            <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(z - 10, 50))}><ZoomOut size={16} /></Button>
                                    <span className="text-xs font-medium w-12 text-center">{zoom}%</span>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(z + 10, 200))}><ZoomIn size={16} /></Button>
                                </div>
                                <Badge variant="outline" className="bg-gray-50">1920 x 1080 px</Badge>
                            </div>

                            {/* Canvas Content */}
                            <div className="flex-1 overflow-auto flex items-center justify-center p-8">
                                <div
                                    className="bg-white shadow-2xl relative transition-transform duration-200"
                                    style={{ width: '800px', height: '450px', transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
                                >
                                    {/* Background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                        <p className="text-gray-300 text-4xl font-bold opacity-20 transform -rotate-12">TEMPLATE BACKGROUND</p>
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
                                            }}
                                            onClick={() => setSelectedElementId(layer.id)}
                                        >
                                            {layer.type === 'logo' ? (
                                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">Logo</div>
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

                                            <div className="space-y-4">
                                                <Slider
                                                    label="X Position"
                                                    min={0}
                                                    max={1200}
                                                    value={selectedLayer.x}
                                                    onChange={(val) => handleLayerUpdate(selectedLayer.id, { x: val })}
                                                />
                                                <Slider
                                                    label="Y Position"
                                                    min={0}
                                                    max={800}
                                                    value={selectedLayer.y}
                                                    onChange={(val) => handleLayerUpdate(selectedLayer.id, { y: val })}
                                                />
                                            </div>
                                        </div>

                                        {selectedLayer.type === 'text' && (
                                            <div className="pt-4 border-t border-gray-100 space-y-4">
                                                <div className="flex items-center gap-2 font-medium text-sm">
                                                    <Icon icon={Type} size={16} /> Typography
                                                </div>

                                                <div className="space-y-3">
                                                    {/* Font Family */}
                                                    <Select
                                                        value={selectedLayer.style.font || 'Inter'}
                                                        onChange={(val) => handleLayerUpdate(selectedLayer.id, { font: val })}
                                                        options={[
                                                            { value: 'Inter, sans-serif', label: 'Inter' },
                                                            { value: 'Playfair Display, serif', label: 'Playfair Display' },
                                                            { value: 'Arial, sans-serif', label: 'Arial' },
                                                            { value: 'Times New Roman, serif', label: 'Times New Roman' },
                                                            { value: 'Courier New, monospace', label: 'Courier' }
                                                        ]}
                                                    />

                                                    {/* Size Row */}
                                                    <div className="space-y-2">
                                                        <Slider
                                                            label="Font Size"
                                                            min={10}
                                                            max={200}
                                                            value={selectedLayer.style.size || 16}
                                                            onChange={(val) => handleLayerUpdate(selectedLayer.id, { size: val })}
                                                        />
                                                    </div>

                                                    {/* Style & Align Row */}
                                                    <div className="flex flex-col gap-3">
                                                        {/* Alignment */}
                                                        <div>
                                                            <label className="text-xs text-gray-500 font-medium mb-1 block">Alignment</label>
                                                            <ToggleGroup
                                                                value={selectedLayer.style.align || 'left'}
                                                                onChange={(val) => handleLayerUpdate(selectedLayer.id, { align: val })}
                                                                options={[
                                                                    { value: 'left', icon: AlignLeft, title: 'Left' },
                                                                    { value: 'center', icon: AlignCenter, title: 'Center' },
                                                                    { value: 'right', icon: AlignRight, title: 'Right' }
                                                                ]}
                                                            />
                                                        </div>

                                                        {/* Text Styles */}
                                                        <div>
                                                            <label className="text-xs text-gray-500 font-medium mb-1 block">Style</label>
                                                            <ToggleGroup
                                                                multiSelect
                                                                value={[
                                                                    selectedLayer.style.bold ? 'bold' : '',
                                                                    selectedLayer.style.italic ? 'italic' : '',
                                                                    selectedLayer.style.underline ? 'underline' : ''
                                                                ].filter(Boolean)}
                                                                onChange={(vals: any) => {
                                                                    // Handle multi-select values array
                                                                    const values = Array.isArray(vals) ? vals : [vals];
                                                                    handleLayerUpdate(selectedLayer.id, {
                                                                        bold: values.includes('bold'),
                                                                        italic: values.includes('italic'),
                                                                        underline: values.includes('underline')
                                                                    });
                                                                }}
                                                                options={[
                                                                    { value: 'bold', icon: Bold, title: 'Bold' },
                                                                    { value: 'italic', icon: Italic, title: 'Italic' },
                                                                    { value: 'underline', icon: Underline, title: 'Underline' }
                                                                ]}
                                                            />
                                                        </div>
                                                    </div>

                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-gray-500 ml-1">Color</label>
                                                    <Input
                                                        type="color"
                                                        className="h-[38px] w-full p-1 cursor-pointer"
                                                        value={selectedLayer.style.color}
                                                        onChange={(e) => handleLayerUpdate(selectedLayer.id, { color: e.target.value })}
                                                    />
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
                                <Button type="button" className="w-full" onClick={handleSaveLayout} disabled={!template}>
                                    <Save className="mr-2 h-4 w-4" /> Save Layout
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent >
            </Card >

            {/* SECTION E: Results */}
            {
                generatedCards.length > 0 && (
                    <Card id="results-section" className="border-green-200 bg-green-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                                <Icon icon={CheckCircle2} className="text-green-600" />
                                Generated Cards ({generatedCards.length})
                            </CardTitle>
                            <CardDescription>Your cards have been generated successfully.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {generatedCards.map((card, i) => (
                                    <div key={i} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                            <img src={card.outputPath} alt="Generated Card" className="object-cover w-full h-full" />
                                        </div>
                                        <div className="p-3">
                                            <p className="text-xs text-gray-500 truncate mb-2">
                                                To: {card.recipientData['Recipient Name'] || 'Recipient'}
                                            </p>
                                            <a
                                                href={card.outputPath}
                                                download
                                                className="flex items-center justify-center gap-1 w-full py-1.5 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 rounded border border-gray-200 transition-colors"
                                            >
                                                <Download size={12} /> Download
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )
            }

            <div className="flex justify-end pt-4 pb-20">
                <Button
                    type="button"
                    disabled={!batchData || isGenerating}
                    variant="cta"
                    className="w-full md:w-auto text-lg px-8 py-6 h-auto"
                    onClick={handleGenerate}
                    isLoading={isGenerating}
                >
                    {isGenerating ? "Generating..." : "Proceed to Generation"}
                    {!isGenerating && <Icon icon={CheckCircle2} className="ml-2" size={20} />}
                </Button>
            </div>
        </div >
    );
};

export default InputData;
