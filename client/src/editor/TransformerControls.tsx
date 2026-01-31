import React, { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import { useEditorStore } from '../store/editorStore';

export const TransformerControls: React.FC = () => {
    const { selectedId, elements, isPreviewMode } = useEditorStore();
    const trRef = useRef<any>(null);

    const selectedElement = elements.find(el => el.id === selectedId);

    useEffect(() => {
        if (trRef.current) {
            // we need to attach transformer manually
            const stage = trRef.current.getStage();
            const selectedNode = stage.findOne('#' + selectedId);

            if (selectedNode) {
                trRef.current.nodes([selectedNode]);
                trRef.current.getLayer().batchDraw();
            } else {
                trRef.current.nodes([]);
                trRef.current.getLayer().batchDraw();
            }
        }
    }, [selectedId, elements]); // Depend on elements in case they change/re-render

    if (!selectedElement || isPreviewMode || selectedElement.isLocked) {
        return null;
    }

    return (
        <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
                // limit resize
                if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                }
                return newBox;
            }}
            // Only show resizing handles for images, or allow for text too but normally text is sized by font
            // For Canva reference, text box width creates wrapping.
            // Konva Text width behavior needs explicit handling for wrapping. Only enabled width resizing for text if we want wrapping.
            // For now, let's allow general transform.
            enabledAnchors={selectedElement.type === 'text' ? ['middle-left', 'middle-right'] : ['top-left', 'top-right', 'bottom-left', 'bottom-right']}
        />
    );
};
