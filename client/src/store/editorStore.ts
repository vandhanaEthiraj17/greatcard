import { create } from 'zustand';
import { ASPECT_RATIOS, DEFAULT_ASPECT_RATIO } from '../utils/aspectRatios';
import { BatchRow } from '../utils/batchProcessor';

export interface EditorElement {
    id: string;
    type: 'text' | 'image';
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
    isVisible: boolean;
    isLocked: boolean;
    opacity?: number;
    // Text specific
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    fill?: string;
    align?: 'left' | 'center' | 'right';
    letterSpacing?: number;
    lineHeight?: number;
    shadowEnabled?: boolean;
    placeholderKey?: string;
    // Image specific
    src?: string;
}


export interface BatchData {
    id?: string;
    filename?: string;
    rowCount: number;
    headers: string[];
    preview: BatchRow[];
    rows?: BatchRow[];
}

export interface EditorState {
    width: number;
    height: number;
    scale: number;
    elements: EditorElement[];
    selectedId: string | null;
    history: EditorElement[][];
    historyIndex: number;
    isPreviewMode: boolean;

    // Actions
    setDimension: (ratioName: string) => void;
    setScale: (scale: number) => void;
    addElement: (element: EditorElement) => void;
    updateElement: (id: string, attrs: Partial<EditorElement>) => void;
    selectElement: (id: string | null) => void;
    reorderElement: (id: string, direction: 'up' | 'down' | 'front' | 'back') => void;
    deleteElement: (id: string) => void;
    togglePreviewMode: () => void;
    undo: () => void;
    redo: () => void;

    // Batch & Preview Features
    batchData: BatchRow[];
    previewIndex: number;
    setBatchData: (data: BatchRow[]) => void;
    nextPreview: () => void;
    prevPreview: () => void;
    setPreviewIndex: (index: number) => void;

    // Smart Features
    isAnalyzing?: boolean;
    autoArrangeElements: (imageUrl: string) => Promise<void>;

    // Template Selection
    selectedTemplate: Template | null;
    setSelectedTemplate: (template: Template | null) => void;

    // Project Data (Input Step)
    inputData: {
        brand: { name: string; logo?: File | null };
        mode: 'csv' | 'manual';
        batchData: BatchData | null;
        manualData: { name: string; position: string; occasion: string; phone?: string; email?: string };
    };
    setInputData: (data: Partial<EditorState['inputData']>) => void;

    // Layout Layers (Positioning Step & Template Builder)
    isTemplateBuilder: boolean; // Flag for Builder Mode
    setTemplateBuilderMode: (isBuilder: boolean) => void;

    layoutLayers: Layer[];
    setLayoutLayers: (layers: Layer[]) => void;
    updateLayoutLayer: (id: string, updates: Partial<Layer> | Partial<Layer['style']> | { constraints: Partial<LayerConstraints> }) => void;
    addLayoutLayer: (layer: Layer) => void; // Added for builder
}

export interface Template {
    id: string;
    name: string;
    category: string;
    orientation: 'Portrait' | 'Landscape';
    previewImage: string;
    templatePath: string;
    dimensions?: { width: number; height: number };
}

// Enhanced Layer Interface for Template Builder
export interface LayerConstraints {
    lockPosition?: boolean;
    lockStyle?: boolean;
    lockContent?: boolean;
    maxChars?: number;
    allowedColors?: string[];
}

export interface Layer {
    id: string;
    type: 'text' | 'image' | 'logo' | 'background';
    name: string;
    content: string;

    // Dynamic / Builder Props
    placeholderKey?: string; // Legacy support (remove later if replacing with isDynamic)
    isDynamic?: boolean;     // New: Marked as dynamic variable
    variableName?: string;   // New: e.g. "recipient_name"
    constraints?: LayerConstraints; // New: Restrictions

    x: number;
    y: number;
    width?: number; // Added for images/backgrounds
    height?: number; // Added for images/backgrounds
    rotation?: number;
    visible: boolean;
    locked?: boolean; // User-level lock (temporary) vs Constraint lock (admin)
    flip?: { x: boolean; y: boolean };
    style: {
        font?: string;
        size?: number;
        weight?: string | number;
        fontStyle?: string; // italic
        textDecoration?: string; // underline
        color?: string;
        backgroundColor?: string;
        align?: 'left' | 'center' | 'right';
        lineHeight?: number;
        letterSpacing?: number;
        opacity?: number;
        borderRadius?: number;
        scale?: number;
        blur?: number;
        shadow?: string;
        gradient?: string;
    };
}

const HISTORY_LIMIT = 50; // Defined locally

export const useEditorStore = create<EditorState>((set, get) => ({
    // ... (Keep existing simple editor state init if needed, but we focus on LayoutLayers part)
    width: ASPECT_RATIOS[DEFAULT_ASPECT_RATIO].width,
    height: ASPECT_RATIOS[DEFAULT_ASPECT_RATIO].height,
    scale: 0.5,
    elements: [],
    selectedId: null,
    history: [[]],
    historyIndex: 0,
    isPreviewMode: false,

    // ... (Batch/Template/Input init) ...
    batchData: [],
    previewIndex: 0,
    selectedTemplate: null,
    setSelectedTemplate: (template) => set({ selectedTemplate: template }),
    inputData: {
        brand: { name: '' },
        mode: 'csv',
        batchData: null,
        manualData: { name: '', position: '', occasion: '', phone: '', email: '' }
    },
    setInputData: (data) => set((state) => ({ inputData: { ...state.inputData, ...data } })),

    // Layout Layers & Advanced Edit Mode
    isTemplateBuilder: false,
    setTemplateBuilderMode: (isBuilder) => set({ isTemplateBuilder: isBuilder }),

    layoutLayers: [],
    setLayoutLayers: (layers) => {
        // Init history on set
        set({
            layoutLayers: layers,
            history: [layers as any],
            historyIndex: 0
        });
    },

    addLayoutLayer: (layer) => set((state) => {
        const newLayers = [...state.layoutLayers, layer];
        // TODO: History logic for this
        return { layoutLayers: newLayers };
    }),

    updateLayoutLayer: (id, updates) => set((state) => {
        const newLayers = state.layoutLayers.map(l => {
            if (l.id !== id) return l;

            // Strict lock check (if constraints are active)
            // But we allow ANY edit if we are in TemplateBuilder mode (Admin overrides)
            const isBuilder = state.isTemplateBuilder;
            if (!isBuilder && l.locked && !('locked' in updates)) return l;

            // Handle merging nested objects
            let updatedLayer = { ...l };

            // Check if updates has 'style' or flat props
            if ('style' in updates) {
                // @ts-ignore
                updatedLayer.style = { ...l.style, ...updates.style };
            } else if ('constraints' in updates) {
                // @ts-ignore
                updatedLayer.constraints = { ...l.constraints, ...updates.constraints };
            }
            // Check for flat style props (legacy support)
            else if ('font' in updates || 'size' in updates || 'color' in updates || 'align' in updates || 'shadow' in updates || 'blur' in updates) {
                // @ts-ignore
                updatedLayer.style = { ...l.style, ...updates };
                // And also merge others just in case? No, separate logic.
            } else {
                // Top level props
                updatedLayer = { ...updatedLayer, ...updates };
            }

            return updatedLayer;
        });

        // History Push logic (Should be debounced in production, simple here)
        const newHistory = [...state.history.slice(0, state.historyIndex + 1), newLayers as any].slice(-HISTORY_LIMIT);

        return {
            layoutLayers: newLayers,
            history: newHistory,
            historyIndex: newHistory.length - 1
        };
    }),


    setDimension: (ratioName) => set(() => {
        const config = ASPECT_RATIOS[ratioName] || ASPECT_RATIOS[DEFAULT_ASPECT_RATIO];
        return { width: config.width, height: config.height };
    }),

    setScale: (scale) => set({ scale }),

    addElement: (element) => set((state) => {
        const newElements = [...state.elements, element];
        const newHistory = [...state.history.slice(0, state.historyIndex + 1), newElements].slice(-HISTORY_LIMIT);
        return {
            elements: newElements,
            selectedId: element.id,
            history: newHistory,
            historyIndex: newHistory.length - 1
        };
    }),

    updateElement: (id, attrs) => set((state) => {
        const newElements = state.elements.map(el => el.id === id ? { ...el, ...attrs } : el);
        // Don't push to history for every micro-change (optimization needed later? For now, we will debouce or just save)
        // Actually for simplicity, let's push to history
        const newHistory = [...state.history.slice(0, state.historyIndex + 1), newElements].slice(-HISTORY_LIMIT);
        return {
            elements: newElements,
            history: newHistory,
            historyIndex: newHistory.length - 1
        };
    }),

    selectElement: (id) => set({ selectedId: id }),

    reorderElement: (id, direction) => set((state) => {
        const idx = state.elements.findIndex(el => el.id === id);
        if (idx === -1) return {};

        const newElements = [...state.elements];
        const item = newElements[idx];

        if (direction === 'up' && idx < newElements.length - 1) {
            newElements.splice(idx, 1);
            newElements.splice(idx + 1, 0, item);
        } else if (direction === 'down' && idx > 0) {
            newElements.splice(idx, 1);
            newElements.splice(idx - 1, 0, item);
        } else if (direction === 'front') {
            newElements.splice(idx, 1);
            newElements.push(item);
        } else if (direction === 'back') {
            newElements.splice(idx, 1);
            newElements.unshift(item);
        }

        return { elements: newElements };
    }),

    deleteElement: (id) => set((state) => {
        const newElements = state.elements.filter(el => el.id !== id);
        const newHistory = [...state.history.slice(0, state.historyIndex + 1), newElements].slice(-HISTORY_LIMIT);
        return {
            elements: newElements,
            selectedId: null,
            history: newHistory,
            historyIndex: newHistory.length - 1
        }
    }),

    togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),

    undo: () => set((state) => {
        if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1;
            return {
                elements: state.history[newIndex],
                historyIndex: newIndex,
                selectedId: null
            };
        }
        return {};
    }),

    redo: () => set((state) => {
        if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1;
            return {
                elements: state.history[newIndex],
                historyIndex: newIndex,
                selectedId: null
            };
        }
        return {};
    }),

    // Batch Actions
    setBatchData: (data) => set({ batchData: data, previewIndex: 0 }),

    nextPreview: () => set((state) => {
        if (state.batchData.length === 0) return {};
        const next = state.previewIndex + 1;
        return { previewIndex: next >= state.batchData.length ? 0 : next }; // Loop? Or stop? Let's loop.
    }),

    prevPreview: () => set((state) => {
        if (state.batchData.length === 0) return {};
        const prev = state.previewIndex - 1;
        return { previewIndex: prev < 0 ? state.batchData.length - 1 : prev };
    }),

    setPreviewIndex: (index) => set({ previewIndex: index }),

    // Auto-Arrange Action
    autoArrangeElements: async (imageUrl: string) => {
        set({ isAnalyzing: true });
        // Dynamic import to avoid circular dep issues in some bundlers?
        const { analyzeImage, calculatePositions } = await import('../utils/smartPlacement');

        try {
            const zones = await analyzeImage(imageUrl);
            const currentElements = get().elements;
            const updates = calculatePositions(zones, currentElements);

            if (updates.length > 0) {
                const newElements = currentElements.map(el => {
                    const update = updates.find(u => u.id === el.id);
                    return update ? { ...el, ...update } : el;
                });

                // Push to history
                const newHistory = [...get().history.slice(0, get().historyIndex + 1), newElements].slice(-HISTORY_LIMIT);
                set({
                    elements: newElements,
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                    isAnalyzing: false
                });
            } else {
                console.log("No smart updates found.");
                set({ isAnalyzing: false });
            }
        } catch (e) {
            console.error(e);
            set({ isAnalyzing: false });
        }
    }
}));
