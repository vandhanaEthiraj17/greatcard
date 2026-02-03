import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Wand2, Image as ImageIcon, Sparkles, RefreshCcw, LayoutTemplate, Check } from "lucide-react";
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

    const [aspectRatio, setAspectRatio] = useState("16:9");

    const [uploadedTemplateId, setUploadedTemplateId] = useState<string | null>(null);
    const [templateMode, setTemplateMode] = useState<"LOCKED" | "UNLOCKED">("LOCKED");

    // -- NEW: Select Template Logic --
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [availableTemplates, setAvailableTemplates] = useState<{ name: string; path: string }[]>([]);
    const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null);

    // Load templates dynamically on mount
    useEffect(() => {
        // Use import.meta.glob to strictly find images in public/templates at build time
        // The pattern must match the actual file system structure relative to the project root
        // Vite handles '/public' by serving contents at root, but for glob we need the source path.

        // Pattern: glob all images in client/public/templates recursively or flat. 
        // User request implied flat "client/public/templates/".
        // Use relative path from this file? Or absolute from root? 
        // Best practice in Vite: use absolute from project root (if configured) or relative.
        // Since we are in src/pages/, the relative path to public is ../../public/templates/
        // UPDATED: Added /**/* to support subdirectories (anniversary, birthday, etc.)

        const modules = import.meta.glob('../../public/templates/**/*.{png,jpg,jpeg,PNG,JPG}', { eager: true, as: 'url' });

        const loadedTemplates = Object.keys(modules).map((filePath) => {
            // filePath will be like "../../public/templates/birthday/card01.png"

            // Extract filename for display (maybe include subdir or just name?)
            // Let's just use the filename for now, or "Category - Name"
            const nameWithExt = filePath.split('/').pop() || "Template";
            const name = nameWithExt.split('.').slice(0, -1).join('.') || "Template";

            // Construct web-accessible path: 
            // In Vite, "../../public/templates/birthday/foo.png" becomes "/templates/birthday/foo.png"
            const webPath = filePath.replace('../../public', '');

            return {
                name: name,
                path: webPath
            };
        });

        console.log("Loaded Templates:", loadedTemplates);
        setAvailableTemplates(loadedTemplates);
    }, []);

    const handleSelectTemplate = async (template: { name: string; path: string }) => {
        try {
            setUploadStatus("Selecting template...");
            setIsTemplateModalOpen(false); // Close modal first

            // 1. Fetch the image to get a Blob/File
            const response = await fetch(template.path);
            if (!response.ok) throw new Error("Failed to load template file");
            const blob = await response.blob();

            // 2. Create a File object
            const file = new File([blob], template.name, { type: blob.type });

            // 3. Clear existing manual upload state
            setSelectedFile(null);

            // 4. Update UI to show selected template
            setSelectedTemplateName(template.name);

            // 5. Auto-upload to get ID (reusing existing logic essentially)
            const formData = new FormData();
            formData.append('image', file);
            formData.append('name', template.name);
            formData.append('type', 'UPLOAD'); // Keeping type UPLOAD as required by backend

            const res = await fetch('/api/templates', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                setUploadedTemplateId(data.data._id);
                setUploadStatus(`Selected: ${template.name}`);
            } else {
                setUploadStatus(data.message || "Failed to process selected template.");
                setSelectedTemplateName(null);
            }

        } catch (error: any) {
            console.error("Template selection error:", error);
            setUploadStatus("Error selecting template: " + error.message);
            setSelectedTemplateName(null);
        }
    };

    const handleGenerate = async () => {
        if (!prompt) return alert("Please enter a prompt");

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
                const msg = data.message || "Unable to generate designs. Please try again.";
                alert(msg);
            }
        } catch (err: any) {
            console.error("Frontend Error:", err);
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

        // Clear "Select Template" state if user manually uploads
        setSelectedTemplateName(null);

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

    // Clear selection helper
    const clearSelection = () => {
        setSelectedFile(null);
        setSelectedTemplateName(null);
        setUploadedTemplateId(null);
        setUploadStatus("");
    };

    const displayItems = previews.length > 0 ? previews : [1, 2, 3, 4];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Column: Controls */}
            <div className="lg:col-span-1 space-y-6">

                {/* Upload or Select Template Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icon icon={ImageIcon} className="text-brand-blue" />
                            Base Template
                        </CardTitle>
                        <CardDescription>Choose a base design for your card.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {/* 1. Select from Library */}
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-3"
                            onClick={() => setIsTemplateModalOpen(true)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                                    <Icon icon={LayoutTemplate} size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900">Select Template</div>
                                    <div className="text-xs text-gray-500">Choose from library</div>
                                </div>
                            </div>
                        </Button>

                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        {/* 2. Upload Manual */}
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                className="hidden"
                                id="template-upload"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setSelectedFile(file);
                                        // Auto-trigger upload logic call effectively or let user click button?
                                        // Original code required button click. Let's keep it but maybe show selected name.
                                        setSelectedTemplateName(null); // Clear library selection
                                    }
                                }}
                            />
                            <label htmlFor="template-upload" className="cursor-pointer space-y-2 w-full">
                                <div className="flex flex-col items-center">
                                    <Icon icon={ImageIcon} className="text-gray-400 mb-2" />
                                    <div className="text-sm font-medium text-gray-900">
                                        {selectedFile ? selectedFile.name : (selectedTemplateName ? "Change Upload?" : "Upload Custom File")}
                                    </div>
                                    <div className="text-xs text-gray-500">PNG, JPG up to 5MB</div>
                                </div>
                            </label>
                        </div>

                        {/* Upload Button (only if file selected manually) */}
                        {selectedFile && (
                            <Button
                                onClick={handleFileUpload}
                                className="w-full"
                            >
                                Confirm Upload
                            </Button>
                        )}

                        {/* Status Message */}
                        {uploadStatus && (
                            <div className={`text-xs text-center p-2 rounded ${uploadedTemplateId ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                {uploadStatus}
                            </div>
                        )}

                        {/* Clear Selection */}
                        {(uploadedTemplateId || selectedFile || selectedTemplateName) && (
                            <Button variant="ghost" size="sm" className="w-full text-xs text-red-500 hover:text-red-700 h-8" onClick={clearSelection}>
                                Clear Selection
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* AI Parameters */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icon icon={Wand2} className="text-brand-blue" />
                            AI Parameters
                        </CardTitle>
                        <CardDescription>
                            {uploadedTemplateId
                                ? <span className="text-green-600 font-medium flex items-center gap-1">
                                    🔒 Locked Mode: {selectedTemplateName ? `Existing: ${selectedTemplateName}` : 'Custom Upload'}
                                </span>
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
                                    ? (templateMode === "LOCKED" ? "Generate on Template" : "Generate Variations")
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayItems.map((item, i) => (
                                <div key={i} className="group relative aspect-video bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-brand-blue transition-colors cursor-pointer">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt="Generated" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                            <Icon icon={ImageIcon} className="text-gray-300 mb-2" size={32} />
                                        </div>
                                    )}

                                    {!item.imageUrl && <span className="relative z-10 text-xs text-gray-400 font-medium">Preview {i + 1}</span>}

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

            {/* Templates Modal */}
            <Modal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                title="Choose a Template"
                className="max-w-4xl"
            >
                <div>
                    <p className="text-sm text-gray-500 mb-4">Select a pre-existing template to use as a base for your design.</p>

                    {availableTemplates.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-100 rounded-lg">
                            No templates found in public/templates.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
                            {availableTemplates.map((tpl, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectTemplate(tpl)}
                                    className="cursor-pointer group relative border border-gray-200 rounded-lg overflow-hidden hover:ring-2 hover:ring-brand-blue hover:shadow-lg transition-all"
                                >
                                    <div className="aspect-[3/4] bg-gray-100 relative">
                                        <img
                                            src={tpl.path}
                                            alt={tpl.name}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="bg-white/90 p-2 rounded-full text-brand-blue shadow-sm0">
                                                <Check size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-white border-t border-gray-100">
                                        <div className="text-xs font-medium text-gray-900 truncate" title={tpl.name}>
                                            {tpl.name}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default GenerateTemplate;
