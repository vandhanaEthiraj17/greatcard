import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { Alert } from "@/components/ui/Alert";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Icon } from "@/components/common/Icon";
import { Download, Mail, Share2, Instagram, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { VisualCanvas } from "@/components/editor/VisualCanvas";
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface StepGenerationProps {
    onBack: () => void;
    data: any;
}

const StepGeneration = ({ onBack, data }: StepGenerationProps) => {
    // We trust the global store for the Single Render Pipeline source of truth
    const { selectedTemplate, width, height, layoutLayers } = useEditorStore();

    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [generatedFiles, setGeneratedFiles] = useState<{ id: string, blob: Blob, url: string }[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Distribution State
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [emailSubject, setEmailSubject] = useState("Your Personalized Card");
    const [emailBody, setEmailBody] = useState("Here is a special card just for you!");
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [instagramEnabled, setInstagramEnabled] = useState(false);
    const [instagramCaption, setInstagramCaption] = useState("Check out this card! #GreetCard");

    // Hidden container for capture
    const captureRef = useRef<HTMLDivElement>(null);

    // Guard: Redirect if no template selected (though workflow should prevent this)
    if (!selectedTemplate) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <Alert variant="destructive" className="max-w-md">
                    <Icon icon={AlertCircle} className="h-4 w-4" />
                    <span className="ml-2 font-bold">State Error</span>
                    <div className="mt-2 text-xs">Template state missing. Please go back to Step 1.</div>
                </Alert>
                <Button onClick={onBack} variant="secondary" className="mt-4">Back</Button>
            </div>
        );
    }

    const handleGenerate = async () => {
        if (!captureRef.current) return;

        setIsGenerating(true);
        setProgress(10);
        setError(null);
        setGeneratedFiles([]);

        try {
            console.log("Starting Generation Pipeline...");
            console.log("Template:", selectedTemplate.name);
            console.log("Layers:", layoutLayers.length);

            // Wait for images to load explicitly? 
            // html2canvas usually handles it, but a small delay helps ensuring React paint is done
            await new Promise(r => setTimeout(r, 800));
            setProgress(30);

            const canvasElement = captureRef.current;
            const newFiles = [];

            // Determine Batch Size
            // If data.batchData exists, we might want to loop. 
            // For this fix, we are prioritizing "Visual Match", so we render the current view.
            // If the user wants Batch Generation (replacing variables), that would require 
            // iterating inputData.manualData or batchData rows and updating the store/canvas per iteration.

            // For now, to satisfy "Generate and Download steps look like Editor", we generate the SINGLE card.
            // (Expanding to batch loop would follow same pattern: update data -> render -> capture)
            const count = 1;

            for (let i = 0; i < count; i++) {
                // If implementing batch:
                // updateInputData(row[i]); 
                // await new Promise(r => setTimeout(r, 100)); // wait for re-render

                const canvas = await html2canvas(canvasElement, {
                    scale: 2, // 2x Retina quality
                    useCORS: true,
                    logging: false,
                    backgroundColor: null,
                    imageTimeout: 15000,
                });

                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));

                if (blob) {
                    newFiles.push({
                        id: `gen-${i}`,
                        blob,
                        url: URL.createObjectURL(blob)
                    });
                }
            }

            setProgress(100);
            setGeneratedFiles(newFiles);
            setIsComplete(true);

        } catch (err: any) {
            console.error("Generation Error:", err);
            setError("Failed to generate image: " + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadZip = async () => {
        if (generatedFiles.length === 0) return;
        const zip = new JSZip();
        generatedFiles.forEach((file, index) => {
            zip.file(`card-${index + 1}.jpg`, file.blob);
        });
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "greetcard-export.zip");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Output & Distribution</h2>
                <p className="text-gray-500">Generate your cards and select distribution channels</p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="ml-2">{error}</span>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CONFIGURATION */}
                <Card>
                    <CardHeader>
                        <CardTitle>Output Configurations</CardTitle>
                        <CardDescription>
                            Using high-fidelity rendering pipeline.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Select
                                label="File Format"
                                options={[{ label: 'JPG', value: 'jpg' }, { label: 'PNG', value: 'png' }]}
                                defaultValue="jpg"
                            />
                            <Select
                                label="Quality"
                                options={[{ label: 'Best (2x)', value: '2x' }, { label: 'Standard (1x)', value: '1x' }]}
                                defaultValue="2x"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                variant="cta"
                                className="w-full h-12 text-lg"
                            >
                                {isGenerating ? 'Rendering...' : isComplete ? 'Generatation Complete' : 'Start Generation'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* DISTRIBUTION CHANNELS (Using mock placeholders for UI consistency) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribution Channels</CardTitle>
                        <CardDescription>Automatically send generated cards.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 max-h-[400px] overflow-y-auto">
                        <div className={`p-4 rounded-lg border transition-all ${emailEnabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Icon icon={Mail} /></div>
                                    <div className="font-medium">Email Campaign</div>
                                </div>
                                <Toggle checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} />
                            </div>
                        </div>
                        <div className={`p-4 rounded-lg border transition-all ${whatsappEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Icon icon={Smartphone} /></div>
                                    <div className="font-medium">WhatsApp</div>
                                </div>
                                <Toggle checked={whatsappEnabled} onChange={(e) => setWhatsappEnabled(e.target.checked)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* RESULTS */}
            {(isGenerating || isComplete) && (
                <Card className="animate-in fade-in slide-in-from-bottom-8">
                    <CardHeader>
                        <CardTitle>Job Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Generating Assets...</span>
                                <span>{progress}%</span>
                            </div>
                            <ProgressBar value={progress} />
                        </div>

                        {isComplete && (
                            <div className="space-y-4 pt-4">
                                <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={18} />
                                        <span>Generation Successful.</span>
                                    </div>
                                </Alert>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {generatedFiles.map((file, i) => (
                                        <div key={i} className="aspect-[9/16] bg-gray-100 rounded border border-gray-200 relative group overflow-hidden">
                                            <img src={file.url} alt="Gen" className="w-full h-full object-contain bg-white" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                                                <Button variant="secondary" size="icon" onClick={() => saveAs(file.blob, 'card.jpg')}><Download size={16} /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button variant="default" onClick={handleDownloadZip}>
                                        <Download className="mr-2 h-4 w-4" /> Download All (.ZIP)
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-start pt-4">
                <Button variant="secondary" onClick={onBack} disabled={isGenerating}>Back</Button>
            </div>

            {/* HIDDEN CAPTURE CONTAINER */}
            <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden">
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
        </div>
    );
};

export default StepGeneration;
