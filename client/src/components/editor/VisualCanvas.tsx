// import { useRef, useEffect } from 'react'; // Unused
import { useEditorStore, Layer } from "@/store/editorStore";

interface VisualCanvasProps {
    width: number;
    height: number;
    zoom: number;
    backgroundUrl: string | null;
    readOnly?: boolean;
}

export const VisualCanvas = ({ width, height, zoom, backgroundUrl, readOnly = false }: VisualCanvasProps) => {
    const {
        layoutLayers, selectedId, selectElement,
        updateLayoutLayer, inputData
    } = useEditorStore();

    // Helper to resolve dynamic content (e.g. "Hello {Name}")
    const resolveContent = (layer: Layer) => {
        if (layer.type === 'image' && layer.content) return layer.content; // Images are static for now unless we add dynamic image URL support

        let text = layer.content;

        // Regex to find {Key} patterns
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            let val = '';

            if (inputData.mode === 'manual') {
                // Check in manualData
                // @ts-ignore
                if (inputData.manualData && inputData.manualData[key]) {
                    // @ts-ignore
                    val = inputData.manualData[key];
                }
            } else if (inputData.mode === 'csv' && inputData.batchData?.preview?.[0]) {
                const row = inputData.batchData.preview[0];
                // Case-insensitive lookup (or strict if preferred, user said "exact match" but convenient to be safe)
                // Let's try exact first, then fallback? 
                // User said "Match CSV column headers exactly". So simple direct access.
                if (row && row[key] !== undefined) {
                    val = row[key];
                }
            }

            // If value found, return it. If not, keep the placeholder {Key} (or empty string?)
            // Requirement: "If placeholder has no matching CSV column... highlight" -> For rendering, keeping it makes it obvious it's missing.
            return val || match;
        });
    };

    // --- DRAG LOGIC ---
    const handleMouseDown = (e: React.MouseEvent, layerId: string) => {
        e.stopPropagation();
        selectElement(layerId);

        const layer = layoutLayers.find(l => l.id === layerId);
        if (!layer || layer.locked) return; // Respect lock

        const startX = e.pageX;
        const startY = e.pageY;
        const initialX = layer.x;
        const initialY = layer.y;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.pageX - startX) * (100 / zoom);
            const dy = (moveEvent.pageY - startY) * (100 / zoom);

            updateLayoutLayer(layerId, {
                x: Math.round(initialX + dx),
                y: Math.round(initialY + dy)
            });
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    // Handle Background Selection
    const handleBackgroundClick = () => {
        selectElement(null);
    };

    return (
        <div
            className="relative bg-white shadow-2xl transition-transform duration-200 origin-top-center"
            style={{
                width: width,
                height: height,
                transform: `scale(${zoom / 100})`,
                flexShrink: 0
            }}
            onMouseDown={handleBackgroundClick} // Deselect
        >
            {/* Base Background Image */}
            {backgroundUrl && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <img
                        src={backgroundUrl}
                        className="w-full h-full object-contain"
                        style={{ imageRendering: 'auto' }}
                        alt="Template Background"
                        onLoad={(e) => {
                            const img = e.currentTarget;
                            console.log("Background Image Loaded:", {
                                naturalWidth: img.naturalWidth,
                                naturalHeight: img.naturalHeight,
                                canvasWidth: width,
                                canvasHeight: height,
                                src: backgroundUrl
                            });
                            if (img.naturalWidth !== width || img.naturalHeight !== height) {
                                console.error(`CRITICAL: Dimension Mismatch! Image: ${img.naturalWidth}x${img.naturalHeight}, Canvas: ${width}x${height}`);
                            }
                        }}
                    />
                </div>
            )}

            {/* Render Layers */}
            {layoutLayers.map(layer => {
                const isActive = layer.id === selectedId;
                const content = resolveContent(layer);
                const isPlaceholder = layer.placeholderKey && content === layer.content;

                return (
                    <div
                        key={layer.id}
                        onMouseDown={(e) => !readOnly && handleMouseDown(e, layer.id)}
                        className={`
                            absolute select-none
                            ${readOnly ? '' : 'cursor-move'}
                            ${!readOnly && isActive ? 'ring-2 ring-brand-blue ring-offset-2' : ''}
                            ${!readOnly && !layer.locked ? 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-1' : ''}
                            ${!layer.visible ? 'opacity-0 pointer-events-none' : ''}
                        `}
                        style={{
                            left: layer.x,
                            top: layer.y,
                            transform: `translate(-50%, -50%) rotate(${layer.rotation || 0}deg) scale(${layer.style.scale || 1})`,

                            // Layout & Appearance
                            opacity: layer.style.opacity ?? 1,
                            borderRadius: layer.style.borderRadius ? `${layer.style.borderRadius}px` : undefined,
                            boxShadow: layer.style.shadow,
                            filter: layer.style.blur ? `blur(${layer.style.blur}px)` : undefined,
                        }}
                    >
                        {layer.type === 'image' ? (
                            <img
                                src={content}
                                alt="Layer"
                                className="max-w-[300px]"
                                style={{
                                    transform: `scaleX(${layer.flip?.x ? -1 : 1}) scaleY(${layer.flip?.y ? -1 : 1})`
                                }}
                            />
                        ) : (
                            // Text - Apply typography styles strictly here to allow accurate inheritance/rendering
                            <span
                                className="block w-full h-full"
                                style={{
                                    fontFamily: layer.style.font,
                                    fontSize: `${layer.style.size}px`,
                                    fontWeight: layer.style.weight,
                                    fontStyle: layer.style.fontStyle,
                                    textDecoration: layer.style.textDecoration,
                                    color: isPlaceholder ? '#9ca3af' : (layer.style.color || '#000'),
                                    textAlign: layer.style.align,
                                    whiteSpace: 'pre-wrap',
                                    overflowWrap: 'break-word',
                                    wordBreak: 'break-word'
                                }}
                            >
                                {content}
                            </span>
                        )}

                        {/* Active Selection Handles (Visual Only for now) - Hide in ReadOnly */}
                        {!readOnly && isActive && !layer.locked && (
                            <>
                                <div className="absolute -top-2 -left-2 w-3 h-3 bg-white border border-brand-blue rounded-full" />
                                <div className="absolute -top-2 -right-2 w-3 h-3 bg-white border border-brand-blue rounded-full" />
                                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-white border border-brand-blue rounded-full" />
                                <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-white border border-brand-blue rounded-full" />
                                {/* Rotate Handle */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-brand-blue">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-brand-blue rounded-full cursor-ew-resize"></div>
                                </div>
                            </>
                        )}
                        {!readOnly && layer.locked && (
                            <div className="absolute -top-3 -right-3 bg-white p-0.5 rounded shadow">
                                {/* Simple lock indicator */}
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
