import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/common/Icon";
import { Check, Search, Image as ImageIcon, Layout, Loader2, Filter } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useEditorStore, Template } from "@/store/editorStore";

// Type for the raw JSON structure
type TemplatesJson = Record<string, {
    id: string;
    name: string;
    category: string;
    path: string;
}[]>;

const SelectTemplate = () => {
    // Global State
    const { selectedTemplate, setSelectedTemplate } = useEditorStore();

    // Local State
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [orientationFilter, setOrientationFilter] = useState<"All" | "Portrait" | "Landscape">("All");

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                const response = await fetch('/templates/templates.json');
                if (!response.ok) {
                    throw new Error(`Failed to load templates: ${response.statusText}`);
                }
                const data: TemplatesJson = await response.json();

                // Flatten and Map
                const allTemplates: Template[] = Object.values(data).flat().map(t => ({
                    id: t.id,
                    name: t.name,
                    category: t.category,
                    // Defaulting to Portrait as it is missing in the JSON, 
                    // in a real scenario we would read this from the JSON
                    orientation: 'Portrait',
                    previewImage: t.path,
                    templatePath: t.path // Using image path as base for template path
                }));

                setTemplates(allTemplates);
            } catch (err) {
                console.error("Error loading templates:", err);
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    // Extract unique categories
    const categories = ["All", ...Array.from(new Set(templates.map(t => t.category)))];

    // Filter Logic
    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
        const matchesOrientation = orientationFilter === "All" || t.orientation === orientationFilter;
        return matchesSearch && matchesCategory && matchesOrientation;
    });

    const handleSelect = (template: Template) => {
        setSelectedTemplate(template);
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <Icon icon={Filter} className="text-red-500" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Failed to Load Templates</h3>
                <p className="text-gray-500 max-w-md mt-2 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Filter Section */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">

                {/* Search */}
                <div className="relative w-full lg:w-96">
                    <Icon icon={Search} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search templates..."
                        className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
                    {/* Category Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${categoryFilter === cat
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Orientation Filter */}
                    <div className="flex bg-gray-100 p-1 rounded-lg ml-auto lg:ml-2">
                        {(['All', 'Portrait', 'Landscape'] as const).map(orient => (
                            <button
                                key={orient}
                                onClick={() => setOrientationFilter(orient)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${orientationFilter === orient
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {orient}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Icon icon={Loader2} className="animate-spin mb-3" size={32} />
                    <p>Loading templates...</p>
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Icon icon={Layout} className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900">No templates found</h3>
                    <p className="text-gray-500 max-w-md mx-auto mt-2">
                        We couldn't find any templates matching your filters. Try adjusting your search or category.
                    </p>
                    <Button
                        variant="link"
                        onClick={() => { setSearch(""); setCategoryFilter("All"); setOrientationFilter("All"); }}
                        className="mt-4 text-brand-blue"
                    >
                        Clear all filters
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-1">
                    {filteredTemplates.map((template) => {
                        const isSelected = selectedTemplate?.id === template.id;

                        return (
                            <Card
                                key={template.id}
                                className={`
                                    group relative overflow-hidden cursor-pointer transition-all duration-300
                                    hover:shadow-lg hover:-translate-y-1 
                                    ${isSelected ? 'ring-2 ring-brand-blue ring-offset-2 border-brand-blue' : 'border-gray-200 hover:border-blue-200'}
                                `}
                                onClick={() => handleSelect(template)}
                            >
                                {/* Orientation Label (Visual indicator) */}
                                <div className="absolute top-3 left-3 z-10">
                                    <Badge variant={isSelected ? "default" : "secondary"} className="opacity-90 backdrop-blur-sm shadow-sm">
                                        {template.category}
                                    </Badge>
                                </div>

                                {/* Preview Image Container */}
                                <div className={`
                                    bg-gray-100 relative overflow-hidden w-full
                                    ${template.orientation === 'Landscape' ? 'aspect-[4/3]' : 'aspect-[3/4]'}
                                `}>
                                    {template.previewImage ? (
                                        <img
                                            src={template.previewImage}
                                            alt={template.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                            <Icon icon={ImageIcon} size={48} />
                                        </div>
                                    )}

                                    {/* Selection Overlay */}
                                    <div className={`
                                        absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-200
                                        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                                    `}>
                                        <div className="transform scale-90 group-hover:scale-100 transition-transform">
                                            {isSelected ? (
                                                <div className="bg-brand-blue text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                                                    <Icon icon={Check} size={24} className="stroke-[3]" />
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="secondary" className="shadow-lg font-medium">
                                                    Select Template
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <CardContent className="p-3 bg-white">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className={`font-medium text-sm truncate w-full ${isSelected ? 'text-brand-blue' : 'text-gray-700'}`}>
                                            {template.name}
                                        </h3>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Floating Footer for Selection Confirmation (Optional UX enhancement) */}
            {selectedTemplate && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-6 fade-in duration-300">
                    <div className="bg-gray-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-800 shrink-0 overflow-hidden">
                                {selectedTemplate.previewImage && <img src={selectedTemplate.previewImage} className="w-full h-full object-cover" />}
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold">{selectedTemplate.name}</p>
                                <p className="text-xs text-gray-400">Ready to customize</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <Button
                            className="rounded-full bg-white text-gray-900 hover:bg-gray-100 px-6 font-semibold"
                            onClick={() => {
                                // Logic to proceed to next step
                                // For now, we just stay here or maybe show a toast
                                // But the user req said: "Highlight selected template", "Save selected template in store"
                                // The requirement didn't specify a "Next" button behavior here, but usually it exists.
                                // I will log to console for now or user can implement navigation.
                                console.log("Proceeding with", selectedTemplate);
                            }}
                        >
                            Confirm Selection
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectTemplate;
