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
    opacity?: number; // Added
    // Text specific
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string; // Added (italic, normal)
    textDecoration?: string; // Added (underline, none)
    fill?: string;
    align?: 'left' | 'center' | 'right';
    letterSpacing?: number;
    lineHeight?: number;
    shadowEnabled?: boolean;
    placeholderKey?: string; // e.g., 'RecipientName'
    // Image specific
    src?: string;
}


interface EditorState {
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
}

const HISTORY_LIMIT = 50;

export const useEditorStore = create<EditorState>((set, get) => ({
    width: ASPECT_RATIOS[DEFAULT_ASPECT_RATIO].width,
    height: ASPECT_RATIOS[DEFAULT_ASPECT_RATIO].height,
    scale: 0.5,
    elements: [],
    selectedId: null,
    history: [[]],
    historyIndex: 0,
    isPreviewMode: false,

    // Batch Init
    batchData: [],
    previewIndex: 0,

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
