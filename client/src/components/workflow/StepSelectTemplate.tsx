import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/common/Icon";
import { Eye, Check, Search, Image as ImageIcon, Monitor, Smartphone, Grid } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { FileUpload } from "@/components/ui/FileUpload";
import { useEditorStore, Template } from "@/store/editorStore";

interface StepSelectTemplateProps {
    onNext: (data: { template?: Template, localFile?: File, aspectRatio?: string }) => void;
    initialData?: { template?: Template, localFile?: File, aspectRatio?: string } | null;
}

const ASPECT_RATIOS = [
    { id: '9:16', label: '9:16', icon: Smartphone, description: 'Story / TikTok' },
    { id: '16:9', label: '16:9', icon: Monitor, description: 'Post / Video' },
    { id: '1:1', label: '1:1', icon: Grid, description: 'Square / IG' },
];

const StepSelectTemplate = ({ onNext, initialData }: StepSelectTemplateProps) => {
    const { setSelectedTemplate } = useEditorStore();
    const [selectedTab, setSelectedTab] = useState<'remote' | 'local'>('remote');
    const [selectedId, setSelectedId] = useState<string | null>(initialData?.template?.id || null);

    // Local Upload State
    const [uploadedFile, setUploadedFile] = useState<File | null>(initialData?.localFile || null);
    const [aspectRatio, setAspectRatio] = useState<string>(initialData?.aspectRatio || '9:16');
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

    const [previewId, setPreviewId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // New Template State
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState("All");

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                const response = await fetch('/templates/templates.json');
                if (!response.ok) throw new Error("Failed");
                const data = await response.json();

                const allTemplates: Template[] = Object.values(data).flat().map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    category: t.category,
                    orientation: 'Portrait',
                    previewImage: t.path,
                    templatePath: t.path,
                    dimensions: { width: 1080, height: 1920 } // Default to 1080p Portrait
                }));
                setTemplates(allTemplates);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    useEffect(() => {
        // Check for AI generated image passed via URL/Storage
        const params = new URLSearchParams(window.location.search);
        if (params.get('source') === 'ai') {
            const aiImage = localStorage.getItem('temp_ai_image');
            if (aiImage) {
                setSelectedTab('local');
                setLocalPreviewUrl(aiImage);
                fetch(aiImage)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], "ai-generated.png", { type: "image/png" });
                        setUploadedFile(file);
                        localStorage.removeItem('temp_ai_image');
                    })
                    .catch(err => {
                        console.error("Failed to load AI image", err);
                        setLocalPreviewUrl(aiImage);
                    });
            }
        }
    }, []);

    useEffect(() => {
        if (uploadedFile) {
            const url = URL.createObjectURL(uploadedFile);
            setLocalPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [uploadedFile]);

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleContinue = () => {
        if (selectedTab === 'remote') {
            const template = templates.find(t => t.id === selectedId);
            if (template) {
                setSelectedTemplate(template); // Update Global Store
                onNext({ template });
            }
        } else {
            if (uploadedFile) {
                onNext({ localFile: uploadedFile, aspectRatio });
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Select a Template</h2>
                <p className="text-gray-500">Choose a design or upload your own to start</p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                    <button
                        onClick={() => setSelectedTab('remote')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${selectedTab === 'remote' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Browse Templates
                    </button>
                    <button
                        onClick={() => setSelectedTab('local')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${selectedTab === 'local' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Upload Local
                    </button>
                </div>
            </div>

            {selectedTab === 'remote' ? (
                <>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-full md:w-80">
                            <div className="relative">
                                <Icon icon={Search} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    placeholder="Search templates..."
                                    className="pl-9 bg-gray-50 border-gray-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-1 overflow-x-auto max-w-full pb-2 md:pb-0">
                            {["All", ...Array.from(new Set(templates.map(t => t.category)))].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${categoryFilter === cat
                                        ? 'bg-brand-blue text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mb-2"></div>
                            Loading templates...
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No templates found. Add templates to /public/templates
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                            No templates found matching your criteria.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
                            {filteredTemplates.map((template) => (
                                <Card
                                    key={template.id}
                                    className={`
                                        group cursor-pointer transition-all duration-300 border-2 overflow-hidden
                                        ${selectedId === template.id
                                            ? 'border-brand-blue ring-4 ring-blue-50 scale-[1.02] shadow-xl'
                                            : 'border-transparent hover:border-gray-200 hover:shadow-lg hover:-translate-y-1'
                                        }
                                    `}
                                    onClick={() => setSelectedId(template.id)}
                                >
                                    <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                            {template.previewImage ? (
                                                <img
                                                    src={template.previewImage}
                                                    alt={template.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <Icon icon={ImageIcon} size={48} />
                                            )}
                                        </div>

                                        {/* Category Badge */}
                                        <div className="absolute top-2 left-2 z-10">
                                            <Badge variant="secondary" className="backdrop-blur-md bg-white/80 shadow-sm text-[10px] px-2 py-0.5 border-0">
                                                {template.category}
                                            </Badge>
                                        </div>

                                        {/* Overlay Actions */}
                                        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-all flex items-center justify-center gap-3 ${selectedId === template.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="rounded-full shadow-lg hover:scale-110 transition-transform"
                                                onClick={(e) => { e.stopPropagation(); setPreviewId(template.id); }}
                                            >
                                                <Eye size={18} />
                                            </Button>
                                            <Button
                                                size="icon"
                                                className={`rounded-full shadow-lg hover:scale-110 transition-transform ${selectedId === template.id ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-brand-blue hover:bg-blue-600 text-white'}`}
                                                onClick={(e) => { e.stopPropagation(); setSelectedId(template.id); }}
                                            >
                                                <Check size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white">
                                        <h3 className={`font-medium text-sm truncate ${selectedId === template.id ? 'text-brand-blue' : 'text-gray-900'}`}>
                                            {template.name}
                                        </h3>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="max-w-2xl mx-auto space-y-6">
                    <Card>
                        <CardContent className="p-8 space-y-8">
                            {/* File Upload */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">1. Upload Image</h3>
                                <FileUpload
                                    label="Upload Background Image"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onFileSelect={setUploadedFile}
                                    className="h-64"
                                />
                                {localPreviewUrl && (
                                    <div className="mt-4 p-2 border rounded-lg bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                                                <img src={localPreviewUrl} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{uploadedFile?.name}</p>
                                                <p className="text-xs text-gray-500">{(uploadedFile?.size || 0) / 1024 / 1024 > 1 ? `${((uploadedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB` : `${((uploadedFile?.size || 0) / 1024).toFixed(0)} KB`}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="ml-auto text-red-500 hover:text-red-600" onClick={() => setUploadedFile(null)}>Remove</Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Aspect Ratio Selection */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">2. Select Display Size</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {ASPECT_RATIOS.map((ratio) => (
                                        <div
                                            key={ratio.id}
                                            onClick={() => setAspectRatio(ratio.id)}
                                            className={`
                                                cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-3 transition-all
                                                ${aspectRatio === ratio.id
                                                    ? 'border-brand-blue bg-blue-50 ring-1 ring-blue-100'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <div className={`p-3 rounded-full ${aspectRatio === ratio.id ? 'bg-white text-brand-blue shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                                                <Icon icon={ratio.icon} size={24} />
                                            </div>
                                            <div className="text-center">
                                                <div className={`font-semibold ${aspectRatio === ratio.id ? 'text-brand-blue' : 'text-gray-700'}`}>{ratio.label}</div>
                                                <div className="text-xs text-gray-400">{ratio.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Preview Modal for Remote Templates */}
            <Modal
                isOpen={!!previewId}
                onClose={() => setPreviewId(null)}
                title="Template Preview"
                className="max-w-2xl"
                footer={
                    <div className="flex justify-between w-full">
                        <Button variant="secondary" onClick={() => setPreviewId(null)}>Close</Button>
                        <Button onClick={() => { setSelectedId(previewId); setPreviewId(null); }}>Select This Template</Button>
                    </div>
                }
            >
                <div className="flex justify-center bg-gray-50 py-10 rounded-lg border border-gray-100">
                    <div className="w-80 h-96 bg-white shadow-xl rounded flex items-center justify-center overflow-hidden">
                        {previewId && templates.find(t => t.id === previewId)?.previewImage ? (
                            <img src={templates.find(t => t.id === previewId)?.previewImage} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-gray-400">Preview Image</span>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Floating Action Bar */}
            {(selectedId || uploadedFile) && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in">
                    <span className="font-medium">
                        {selectedTab === 'remote' ? '1 Template Selected' : 'Local File Ready'}
                    </span>
                    <div className="h-4 w-[1px] bg-gray-700"></div>
                    <Button variant="cta" className="rounded-full h-8" onClick={handleContinue}>
                        Next Step: Input Data
                    </Button>
                </div>
            )}
        </div>
    );
};

export default StepSelectTemplate;
