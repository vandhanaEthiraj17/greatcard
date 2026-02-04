import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Icon } from "@/components/common/Icon";
import { Download, Share2, AlertCircle, FileText, Image as ImageIcon } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { VisualCanvas } from "@/components/editor/VisualCanvas";
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

type ExportFormat = 'jpg' | 'png' | 'pdf';

const OutputDistribution = () => {
    const navigate = useNavigate();
    const { selectedTemplate, width, height, inputData, layoutLayers, setInputData } = useEditorStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [generatedFiles, setGeneratedFiles] = useState<{ id: number, blob: Blob, url: string, extension: string, filename?: string }[]>([]);
    const [format, setFormat] = useState<ExportFormat>('jpg');

    // Ref to the canvas container we will capture
    const captureRef = useRef<HTMLDivElement>(null);

    // Guard: Redirect if no template selected OR no layers (safety)
    if (!selectedTemplate) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
                <div className="bg-red-50 p-6 rounded-full mb-6">
                    <Icon icon={AlertCircle} className="text-red-500" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Template Selected</h2>
                <Button onClick={() => navigate('/select-template')}>
                    Select Template
                </Button>
            </div>
        );
    }

    const handleGenerate = async () => {
        if (!captureRef.current) return;

        setIsGenerating(true);
        setProgress(5);
        setIsComplete(false);
        setGeneratedFiles([]);

        // Save original preview state to restore later
        const originalPreview = inputData.batchData?.preview;

        try {
            // Determine rows to generate
            // If in CSV mode, use batchData rows.
            // If manual, just generate 1 (current).
            // Default to 1 if no batch data found in CSV mode to be safe (e.g. user just hit next without upload)

            let dataRows: any[] = [];
            if (inputData.mode === 'csv' && inputData.batchData?.rows && inputData.batchData.rows.length > 0) {
                dataRows = inputData.batchData.rows;
            } else {
                // Manual or fallback - just one pass
                dataRows = [{}]; // Dummy row, VisualCanvas will rely on fallback manualData or current state
            }

            const canvasElement = captureRef.current;
            const newFiles = [];
            const total = dataRows.length;

            console.log(`Starting generation for ${total} items...`);

            for (let i = 0; i < total; i++) {
                // Update Progress
                setProgress(Math.round(((i) / total) * 90));

                // 1. Update State (Pipeline Step)
                if (inputData.mode === 'csv' && inputData.batchData) {
                    // Update the "Preview" slot which VisualCanvas reads from
                    // We treat the current row as the 'preview' for generation purposes
                    const currentRow = dataRows[i];
                    setInputData({
                        batchData: {
                            ...inputData.batchData,
                            preview: [currentRow]
                        }
                    });

                    // Allow React to re-render the VisualCanvas with new data
                    await new Promise(r => setTimeout(r, 150)); // Short buffer for render
                }

                // 2. Capture
                const canvas = await html2canvas(canvasElement, {
                    scale: 2, // 2x resolution
                    useCORS: true,
                    logging: false,
                    backgroundColor: null,
                });

                let blob: Blob | null = null;
                let extension = format;

                if (format === 'pdf') {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({
                        orientation: width > height ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [width, height]
                    });
                    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
                    blob = await pdf.output('blob');
                } else if (format === 'png') {
                    blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                } else {
                    blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
                }

                // Determine filename (e.g. greeting_Alice.jpg)
                let filename = `greeting_${i + 1}`;
                const nameVal = currentRow['Name'] || currentRow['name']; // Common casing
                if (nameVal) {
                    // Sanitize filename
                    filename = `greeting_${nameVal.replace(/[^a-z0-9]/gi, '_')}`;
                }

                if (blob) {
                    newFiles.push({
                        id: i + 1,
                        blob,
                        url: URL.createObjectURL(blob),
                        extension,
                        filename // Store for zip usage
                    });
                }
            }

            setGeneratedFiles(newFiles);
            setProgress(100);
            setIsComplete(true);

        } catch (error) {
            console.error("Generation failed:", error);
            alert("Failed to generate output. See console for details.");
        } finally {
            // Restore original state if needed, or leave at last
            setIsGenerating(false);
        }
    };

    const handleDownloadZip = async () => {
        if (generatedFiles.length === 0) return;
        const zip = new JSZip();
        generatedFiles.forEach((file) => {
            // @ts-ignore
            const name = file.filename || `card-${file.id}`;
            zip.file(`${name}.${file.extension}`, file.blob);
        });
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "greetcard-export.zip");
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Panel */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Export Settings</CardTitle>
                        <CardDescription>
                            Configure your final output format.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">Format</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setFormat('jpg')}
                                    className={`p-3 border rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-2 ${format === 'jpg' ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <ImageIcon size={20} />
                                    JPG <span className="text-[10px] font-normal opacity-70">Small File</span>
                                </button>
                                <button
                                    onClick={() => setFormat('png')}
                                    className={`p-3 border rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-2 ${format === 'png' ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <ImageIcon size={20} />
                                    PNG <span className="text-[10px] font-normal opacity-70">Lossless</span>
                                </button>
                                <button
                                    onClick={() => setFormat('pdf')}
                                    className={`p-3 border rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-2 ${format === 'pdf' ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <FileText size={20} />
                                    PDF <span className="text-[10px] font-normal opacity-70">Document</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg text-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-500">Mode</span>
                                <span className="font-medium text-gray-900 capitalize">{inputData.mode === 'csv' ? 'Bulk Generation' : 'Single Card'}</span>
                            </div>
                            {inputData.mode === 'csv' && inputData.batchData && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Records</span>
                                    <span className="font-medium text-gray-900">{inputData.batchData.rows?.length || 0} items</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                variant="cta"
                                className="w-full h-12 text-lg"
                            >
                                {isGenerating ? `Generating ${Math.round(progress)}%` : 'Generate Files'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview/Capture Area */}
                <Card className="overflow-hidden bg-gray-50 border-dashed border-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs text-center text-gray-400 uppercase tracking-widest font-mono">Render Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-6 bg-gray-100/50 min-h-[400px]">
                        {/* Scale down for UI, but capture at full res */}
                        <div className="relative shadow-2xl origin-top transition-transform" style={{ transform: 'scale(0.6)' }}>
                            <div ref={captureRef} className="inline-block">
                                <VisualCanvas
                                    width={width}
                                    height={height}
                                    zoom={100}
                                    backgroundUrl={selectedTemplate.previewImage || selectedTemplate.templatePath}
                                    readOnly={true}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Results */}
            {(isComplete && generatedFiles.length > 0) && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Icon icon={Download} className="text-brand-blue" /> Generated Files
                        </h3>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => saveAs(generatedFiles[0].blob, `card-preview.${generatedFiles[0].extension}`)}>
                                Download Preview
                            </Button>
                            <Button size="sm" onClick={handleDownloadZip}>Download All (ZIP)</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {generatedFiles.map((file) => (
                            <div key={file.id} className="group relative border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                                <div className="aspect-[3/4] p-2 bg-gray-100 flex items-center justify-center">
                                    {file.extension === 'pdf' ? (
                                        <FileText size={48} className="text-gray-400" />
                                    ) : (
                                        <img src={file.url} className="max-w-full max-h-full object-contain shadow-sm" />
                                    )}
                                </div>
                                <div className="p-2 bg-white border-t flex items-center justify-between">
                                    <span className="text-xs font-mono text-gray-500 uppercase">{file.extension} - {file.id}</span>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => saveAs(file.blob, `${file.filename || `card-${file.id}`}.${file.extension}`)}>
                                        <Download size={12} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OutputDistribution;
