import { useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Text } from 'react-konva';
import useImage from 'use-image';
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

interface StepGenerationProps {
    onBack: () => void;
    data: any;
}

const StepGeneration = ({ onBack, data }: StepGenerationProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [generatedCards, setGeneratedCards] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Distribution State
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [emailSubject, setEmailSubject] = useState("Your Personalized Card");
    const [emailBody, setEmailBody] = useState("Here is a special card just for you!");

    const [whatsappEnabled, setWhatsappEnabled] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState(""); // For manual single entry

    const [instagramEnabled, setInstagramEnabled] = useState(false);
    const [instagramCaption, setInstagramCaption] = useState("Check out this card! #GreatCard");

    // Local Generation (Client Side)
    const stageRef = useRef<any>(null);
    const [localTemplateImage] = useImage(data.localFile ? URL.createObjectURL(data.localFile) : (data.template?.previewPath || ''), 'anonymous');

    // Determine dimensions
    const getRatioDims = () => {
        const ratio = data.aspectRatio || '9:16';
        if (ratio === '16:9') return { width: 1920, height: 1080 };
        if (ratio === '1:1') return { width: 1080, height: 1080 };
        return { width: 1080, height: 1920 };
    };
    const dims = getRatioDims();

    const handleGenerate = async () => {
        setIsGenerating(true);
        setProgress(10);
        setError(null);

        // Check if we should do client-side generation (all local files, or single manual entry)
        const isClientSide = !!data.localFile || (data.batchData?.id?.startsWith('manual-') && !data.template?._id) || !data.template?._id;

        if (isClientSide) {
            console.log("Starting Client-Side Generation...");
            try {
                // Determine recipients (manual single or small batch)
                const rows = data.batchData?.rows || data.batchData?.preview || [];
                if (rows.length === 0 && data.batchData?.id?.startsWith('manual-')) {
                    // Fallback if rows empty but manual data exists elsewhere? usually in preview
                }

                const generated: any[] = [];
                const total = rows.length || 1;

                // For client side, we currently only support the single manual entry accurately because we only have one stageRef
                // But we can update the stage and await.
                // However, for Manual Entry there is usually only 1 row.

                for (let i = 0; i < total; i++) {
                    const row = rows[i] || {};
                    // Wait for stage to simple re-render if we were loopin (not needed for single)
                    // Capture
                    if (stageRef.current) {
                        const dataUrl = stageRef.current.toDataURL({ pixelRatio: 1 }); // 1080p is already big
                        generated.push({
                            outputPath: dataUrl,
                            recipientData: row,
                            id: `gen-${Date.now()}-${i}`
                        });
                    }
                    setProgress(prev => Math.min(prev + (90 / total), 90));
                    await new Promise(r => setTimeout(r, 100)); // yielding
                }

                setProgress(100);
                setTimeout(() => {
                    setIsGenerating(false);
                    setIsComplete(true);
                    setGeneratedCards(generated);
                }, 500);
                return;

            } catch (err: any) {
                console.error("Client Generation Error:", err);
                setIsGenerating(false);
                setError("Failed to generate image client-side.");
                return;
            }
        }

        try {
            // Backend Generation Logic (Existing)
            // Transform data for backend if needed
            const layerConfig = data.layers?.map((l: any) => ({
                type: l.type === 'logo' ? 'image' : 'text',
                content: l.content,
                x: l.x,
                y: l.y,
                style: l.style
            })) || [];

            const isManual = data.batchData?.id?.startsWith('manual-');

            const payload: any = {
                templateId: data.template?._id,
                layerConfig
            };

            if (isManual) {
                // If manual, backend expects raw recipient data array
                payload.recipientData = data.batchData.rows || data.batchData.preview;
                // Add distribution data if needed for single send (not implemented in backend heavily yet but passing it)
                if (whatsappEnabled) payload.whatsapp = whatsappNumber;
                if (emailEnabled) payload.email = { subject: emailSubject, body: emailBody };
            } else {
                payload.batchId = data.batchData?.batchId || data.batchData?._id; // Handle different property names
            }

            // Mocking progress for UX, then calling API
            const interval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            console.log("Sending Generation Payload:", JSON.stringify(payload, null, 2));

            const res = await fetch('/api/generate/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();

            clearInterval(interval);

            if (result.success) {
                setProgress(100);
                setTimeout(() => {
                    setIsGenerating(false);
                    setIsComplete(true);
                    setGeneratedCards(result.data || []);
                }, 500);
            } else {
                console.error("Generation Failed Response:", result);
                setIsGenerating(false);
                setError(result.message || "Generation Failed");
            }
        } catch (err: any) {
            console.error("Generation Validated Error:", err);
            setIsGenerating(false);
            setError(err.message || "Error triggering generation");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                <Card>
                    <CardHeader>
                        <CardTitle>Output Configurations</CardTitle>
                        <CardDescription>Define how the final assets should be generated.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Select
                                label="File Format"
                                options={[{ label: 'JPG (Web Optimized)', value: 'jpg' }, { label: 'PNG (High Quality)', value: 'png' }, { label: 'PDF (Print)', value: 'pdf' }]}
                                defaultValue="jpg"
                            />
                            <Select
                                label="Resolution"
                                options={[{ label: 'Screen (72 DPI)', value: '72' }, { label: 'Print (300 DPI)', value: '300' }]}
                                defaultValue="72"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || isComplete}
                                variant="cta"
                                className="w-full h-12 text-lg"
                            >
                                {isGenerating ? 'Processing...' : isComplete ? 'Generation Complete' : 'Start Generation'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Distribution Channels</CardTitle>
                        <CardDescription>Automatically send or publish generated cards.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 h-[400px] overflow-y-auto pr-2">
                        {/* Email Channel */}
                        <div className={`p-4 rounded-lg border transition-all ${emailEnabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${emailEnabled ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}><Icon icon={Mail} /></div>
                                    <div>
                                        <h5 className="font-medium text-gray-900">Email Campaign</h5>
                                        <p className="text-xs text-gray-500">Send via SMTP</p>
                                    </div>
                                </div>
                                <Toggle checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} />
                            </div>

                            {emailEnabled && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <Input
                                        label="Subject Line"
                                        placeholder="Special Card for You"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        className="bg-white"
                                    />
                                    <Textarea
                                        label="Email Body"
                                        placeholder="Hi there..."
                                        value={emailBody}
                                        onChange={(e) => setEmailBody(e.target.value)}
                                        className="bg-white h-24"
                                    />
                                </div>
                            )}
                        </div>

                        {/* WhatsApp Channel */}
                        <div className={`p-4 rounded-lg border transition-all ${whatsappEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${whatsappEnabled ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-500'}`}><Icon icon={Smartphone} /></div>
                                    <div>
                                        <h5 className="font-medium text-gray-900">WhatsApp</h5>
                                        <p className="text-xs text-gray-500">Direct Message</p>
                                    </div>
                                </div>
                                <Toggle checked={whatsappEnabled} onChange={(e) => setWhatsappEnabled(e.target.checked)} />
                            </div>

                            {whatsappEnabled && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    {data.batchData?.id?.startsWith('manual-') ? (
                                        <Input
                                            label="Recipient Phone Number"
                                            placeholder="+1 234 567 8900"
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                            className="bg-white"
                                        />
                                    ) : (
                                        <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                                            Bulk sending relies on "Phone" column in CSV.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Instagram Channel (Mock) */}
                        <div className={`p-4 rounded-lg border transition-all ${instagramEnabled ? 'border-pink-200 bg-pink-50' : 'border-gray-200 bg-white'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${instagramEnabled ? 'bg-pink-200 text-pink-700' : 'bg-gray-100 text-gray-500'}`}><Icon icon={Instagram} /></div>
                                    <div>
                                        <h5 className="font-medium text-gray-900">Instagram</h5>
                                        <p className="text-xs text-gray-500">Post to Feed/Story</p>
                                    </div>
                                </div>
                                <Toggle checked={instagramEnabled} onChange={(e) => setInstagramEnabled(e.target.checked)} />
                            </div>

                            {instagramEnabled && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <Input
                                        label="Caption"
                                        placeholder="#GreatCard #Celebration"
                                        value={instagramCaption}
                                        onChange={(e) => setInstagramCaption(e.target.value)}
                                        className="bg-white"
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress & Results */}
            {(isGenerating || isComplete) && (
                <Card className="animate-in fade-in slide-in-from-bottom-8">
                    <CardHeader>
                        <CardTitle>Job Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Processing Batch</span>
                                <span>{progress}%</span>
                            </div>
                            <ProgressBar value={progress} />
                        </div>

                        {isComplete && (
                            <div className="space-y-4 pt-4">
                                <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={18} />
                                        <span>Job Completed Successfully. All cards have been generated.</span>
                                    </div>
                                </Alert>

                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {generatedCards.length > 0 ? generatedCards.map((card, i) => (
                                        <div key={i} className="aspect-[9/16] bg-gray-100 rounded border border-gray-200 relative group overflow-hidden">
                                            <img src={card.outputPath} alt="Card" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                                                <a href={card.outputPath} download className="p-2 bg-white rounded-full">
                                                    <Download size={16} className="text-gray-900" />
                                                </a>
                                            </div>
                                        </div>
                                    )) : (
                                        [1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="aspect-[9/16] bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                                                Mock Card
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button variant="outline">
                                        <Share2 className="mr-2 h-4 w-4" /> Share Report
                                    </Button>
                                    <Button variant="default">
                                        <Download className="mr-2 h-4 w-4" /> Download All (.ZIP)
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
            <div className="flex justify-start pt-4 pb-20">
                <Button variant="secondary" onClick={onBack} disabled={isGenerating}>
                    Back
                </Button>
            </div>
            {/* Hidden Stage for Client Side Generation */}
            <div style={{ position: 'absolute', top: -10000, left: -10000, visibility: 'hidden' }}>
                <Stage
                    width={dims.width}
                    height={dims.height}
                    ref={stageRef}
                >
                    <Layer>
                        {/* Background */}
                        {localTemplateImage && (
                            <KonvaImage
                                image={localTemplateImage}
                                width={dims.width}
                                height={dims.height}
                            />
                        )}

                        {/* Layers */}
                        {data.layers?.map((layer: any) => {
                            // Simple text replacement for Single Entry (index 0)
                            let content = layer.content;
                            const row = (data.batchData?.rows || data.batchData?.preview || [])[0] || {};

                            if (layer.type === 'text') {
                                Object.keys(row).forEach(key => {
                                    const regex = new RegExp(`{{?${key}}}?`, 'gi');
                                    content = content.replace(regex, row[key]);
                                });

                                return (
                                    <Text
                                        key={layer.id}
                                        x={layer.x} // Note: Coordinates might need scaling if Visual Editor was scaled? 
                                        // Visual Editor saves "screen coordinates" or "original coordinates"?
                                        // Usually VisualEditor implementation maps back to original 1080p if designed well.
                                        // But here we might differ. We will assume 1:1 mapping from stored layer.x/y
                                        y={layer.y}
                                        text={content}
                                        fontFamily={layer.style?.font}
                                        fontSize={layer.style?.size}
                                        fill={layer.style?.color}
                                        align={layer.style?.align}
                                    // Centering?
                                    />
                                );
                            }
                            return null;
                        })}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
};

export default StepGeneration;
