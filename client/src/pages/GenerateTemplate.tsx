import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Wand2, Image as ImageIcon, Sparkles, RefreshCcw } from "lucide-react";
import { Icon } from "@/components/common/Icon";

const aspectRatios = [
    { label: "Square (1:1)", value: "1:1" },
    { label: "Portrait (9:16)", value: "9:16" },
    { label: "Landscape (16:9)", value: "16:9" },
];

const GenerateTemplate = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>("");

    // Add previews state
    const [previews, setPreviews] = useState<any[]>([]);

    // Derived Aspect Ratio
    // The Select component in previous files was weird, let's assume it returns value directly or via event.
    // Looking at line 122: defaultValue="16:9". 
    // Select component (Step 79) supports onChange(value).
    const [aspectRatio, setAspectRatio] = useState("16:9");

    const [uploadedTemplateId, setUploadedTemplateId] = useState<string | null>(null);
    const [templateMode, setTemplateMode] = useState<"LOCKED" | "UNLOCKED">("LOCKED");

    const handleGenerate = async () => {
        if (!prompt) return alert("Please enter a prompt");
        // in Dual-Mode, templateId is optional. 

        setIsGenerating(true);
        setPreviews([]); // Clear previous

        try {
            const res = await fetch('/api/ai/generate-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    count: 4,
                    templateId: uploadedTemplateId,
                    templateMode
                })
            });

            const data = await res.json();

            if (data.success) {
                setPreviews(data.templates);
            } else {
                // Task 6: Improved error handling
                const msg = data.message || "Unable to generate designs. Please try again.";
                alert(msg);
            }
        } catch (err: any) {
            console.error("Frontend Error:", err);
            // Task 6: Actionable messages
            if (err.message === 'Failed to fetch') {
                alert("Cannot reach server. Please check your internet connection.");
            } else {
                alert("Design generation failed. " + (err.message || "Please try again."));
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('name', selectedFile.name);
        formData.append('type', 'UPLOAD');

        try {
            setUploadStatus("Uploading...");
            const res = await fetch('/api/templates', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setUploadStatus("Upload successful! You can now generate variations.");
                // Store the ID for the AI generation step
                setUploadedTemplateId(data.data._id);
            } else {
                setUploadStatus(data.message || data.error || "Upload failed. Please check file type/size.");
            }
        } catch (err: any) {
            console.error(err);
            setUploadStatus("Error uploading: " + (err.message || "Server Error"));
        }
    };

    const handleUseImage = (imageUrl: string) => {
        localStorage.setItem('temp_ai_image', imageUrl);
        window.location.href = '/create?source=ai';
    };

    // Calculate slots to render (fill with placeholders if < 4)
    // Actually user wants 1,2,3,4. If we have 4 previews, we show them.
    // If loading, maybe show skeleton? For now, button loading state handles it.

    const displayItems = previews.length > 0 ? previews : [1, 2, 3, 4];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Column: Controls */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icon icon={ImageIcon} className="text-brand-blue" />
                            Upload Template
                        </CardTitle>
                        <CardDescription>Upload an existing design to use as a base.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                className="hidden"
                                id="template-upload"
                                accept="image/*"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                            <label htmlFor="template-upload" className="cursor-pointer space-y-2">
                                <div className="bg-blue-100 p-3 rounded-full inline-block text-brand-blue">
                                    <Icon icon={ImageIcon} />
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                    {selectedFile ? selectedFile.name : "Click to Upload"}
                                </div>
                                <div className="text-xs text-gray-500">PNG, JPG up to 5MB</div>
                            </label>
                        </div>
                        <Button
                            onClick={handleFileUpload}
                            disabled={!selectedFile}
                            className="w-full"
                        >
                            Upload Template
                        </Button>
                        {uploadStatus && <p className="text-xs text-center text-gray-500">{uploadStatus}</p>}
                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icon icon={Wand2} className="text-brand-blue" />
                            AI Parameters
                        </CardTitle>
                        <CardDescription>
                            {uploadedTemplateId
                                ? <span className="text-green-600 font-medium flex items-center gap-1">🔒 Locked Mode: Using your template</span>
                                : <span className="text-blue-600 font-medium flex items-center gap-1">✨ Creative Mode: Generating new designs</span>}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            label="Description Prompt"
                            placeholder="E.g., A professional corporate holiday card with gold accents and a dark blue background..."
                            className="h-32"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />

                        <Select
                            label="Aspect Ratio"
                            options={aspectRatios}
                            defaultValue="16:9"
                            value={aspectRatio}
                            onChange={(val) => setAspectRatio(val)}
                        />

                        <div className="pt-4">
                            <Button
                                onClick={handleGenerate}
                                isLoading={isGenerating}
                                variant="cta"
                                className="w-full"
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                {uploadedTemplateId
                                    ? (templateMode === "LOCKED" ? "Generate on Template (Locked Mode)" : "Generate Creative Variations")
                                    : "Generate Creative Designs"}
                            </Button>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-6">
                            <h4 className="text-sm font-semibold text-brand-blue mb-1">Pro Tip</h4>
                            <p className="text-xs text-gray-600">
                                Include colors and style keywords like "Minimalist", "Festive", or "Geometric" for better results.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-2">
                <Card className="min-h-[500px]">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Generated Previews</CardTitle>
                            <CardDescription>Select a design to start a new project.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                            <RefreshCcw className="mr-2 h-3 w-3" />
                            Regenerate
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Empty State / Initial State */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayItems.map((item, i) => (
                                <div key={i} className="group relative aspect-video bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-brand-blue transition-colors cursor-pointer">
                                    {/* Placeholder visual - In real app, this would be the generated image */}
                                    {/* If item has imageUrl, show it */}
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt="Generated" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                            <Icon icon={ImageIcon} className="text-gray-300 mb-2" size={32} />
                                        </div>
                                    )}

                                    {!item.imageUrl && <span className="relative z-10 text-xs text-gray-400 font-medium">Preview {i + 1}</span>}

                                    {/* Overlay on Hover */}
                                    {item.imageUrl && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                            <Button size="sm" variant="secondary" onClick={() => handleUseImage(item.imageUrl)}>
                                                Use in Project
                                            </Button>
                                        </div>
                                    )}

                                    <div className="absolute top-2 right-2 z-10">
                                        <Badge variant="secondary" className="opacity-70">AI</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default GenerateTemplate;
