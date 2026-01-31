import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/common/Icon";
import { Eye, Check, Search, Image as ImageIcon, Monitor, Smartphone, Grid } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { FileUpload } from "@/components/ui/FileUpload";

interface Template {
    _id: string;
    name: string;
    type: string;
    previewPath: string;
    tags?: string[];
}

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
    const [selectedTab, setSelectedTab] = useState<'remote' | 'local'>('remote');
    const [selectedId, setSelectedId] = useState<string | null>(initialData?.template?._id || null);

    // Local Upload State
    const [uploadedFile, setUploadedFile] = useState<File | null>(initialData?.localFile || null);
    const [aspectRatio, setAspectRatio] = useState<string>(initialData?.aspectRatio || '9:16');
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

    const [previewId, setPreviewId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/templates')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTemplates(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        // Check for AI generated image passed via URL/Storage
        const params = new URLSearchParams(window.location.search);
        if (params.get('source') === 'ai') {
            const aiImage = localStorage.getItem('temp_ai_image');
            if (aiImage) {
                // Determine aspect ratio from storage or default? For now default
                setSelectedTab('local');
                setLocalPreviewUrl(aiImage);
                // Convert to file object if needed for upload or just use URL
                // For this mock, we'll pretend it's a file by fetching it
                fetch(aiImage)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], "ai-generated.png", { type: "image/png" });
                        setUploadedFile(file);
                        // Clean up storage
                        localStorage.removeItem('temp_ai_image');
                    })
                    .catch(err => {
                        console.error("Failed to load AI image", err);
                        // Fallback: just use the URL directly if blob fails (e.g. if it was a data URL or external)
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

    const filteredTemplates = templates.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleContinue = () => {
        if (selectedTab === 'remote') {
            const template = templates.find(t => t._id === selectedId);
            if (template) {
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
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-full md:w-96">
                            <div className="relative">
                                <Icon icon={Search} className="absolute left-3 top-3 text-gray-400" size={16} />
                                <Input
                                    placeholder="Search templates..."
                                    className="pl-9 bg-gray-50 border-gray-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost">All Types</Button>
                            <Button variant="ghost">Portrait</Button>
                            <Button variant="ghost">Landscape</Button>
                        </div>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Loading templates...</div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">No templates found.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredTemplates.map((template) => (
                                <Card key={template._id} className={`group cursor-pointer transition-all border-2 ${selectedId === template._id ? 'border-brand-blue ring-2 ring-blue-100' : 'border-transparent hover:border-gray-200 hover:shadow-md'}`} onClick={() => setSelectedId(template._id)}>
                                    <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden rounded-t-xl">
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                            {template.previewPath ? (
                                                <img src={template.previewPath} alt={template.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Icon icon={ImageIcon} size={48} />
                                            )}
                                        </div>
                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="rounded-full"
                                                onClick={(e) => { e.stopPropagation(); setPreviewId(template._id); }}
                                            >
                                                <Eye size={18} />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="default" // Primary Blue
                                                className="rounded-full"
                                                onClick={(e) => { e.stopPropagation(); setSelectedId(template._id); }}
                                            >
                                                <Check size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <Badge variant="secondary" className="text-[10px]">{template.type}</Badge>
                                            {selectedId === template._id && (
                                                <Badge variant="default" className="bg-brand-blue">Selected</Badge>
                                            )}
                                        </div>
                                    </CardContent>
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
                                    maxSizeMB={5}
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
                        {previewId && templates.find(t => t._id === previewId)?.previewPath ? (
                            <img src={templates.find(t => t._id === previewId)?.previewPath} className="w-full h-full object-contain" />
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
