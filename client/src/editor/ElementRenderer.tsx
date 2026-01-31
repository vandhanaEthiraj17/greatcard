import React from 'react';
import { Text, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { EditorElement, useEditorStore } from '../store/editorStore';

interface ElementRendererProps {
    element: EditorElement;
    isSelected: boolean;
    onSelect: () => void;
    onChange: (attrs: Partial<EditorElement>) => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, onSelect, onChange }) => {
    const { isPreviewMode, batchData, previewIndex } = useEditorStore();

    // ImageLoader...
    const [image] = useImage(element.src || '', 'anonymous');

    // Drag handlers...
    const handleDragStart = () => {
        onSelect();
    };

    const handleDragEnd = (e: any) => {
        onChange({
            x: e.target.x(),
            y: e.target.y(),
        });
    };

    // Prepare text content (handle preview mode)
    let displayContent = element.text;

    // Resolve placeholders directly if batchData exists (even if not strictly in "preview mode" toggle, 
    // the user wants to see the data while editing)
    if (element.text && batchData && batchData.length > 0) {
        let newText = element.text;
        const currentRow = batchData[previewIndex];

        // Replace all {Key} or {{Key}} patterns using the current row
        Object.keys(currentRow).forEach(key => {
            const value = currentRow[key];
            const regex = new RegExp(`{{?${key}}}?`, 'gi');
            newText = newText.replace(regex, value);
        });
        displayContent = newText;
    }

    if (element.type === 'text') {
        return (
            <Text
                key={element.id}
                id={element.id}
                x={element.x}
                y={element.y}
                text={displayContent}
                fontFamily={element.fontFamily}
                fontSize={element.fontSize}
                fontStyle={element.fontWeight}
                fill={element.fill}
                align={element.align}
                width={element.width}
                // Interactive properties
                draggable={!element.isLocked && !isPreviewMode}
                visible={element.isVisible}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClick={onSelect}
                onTap={onSelect}
            // Visual cues for selection or locking could be done here or via Transformer
            />
        );
    }

    if (element.type === 'image') {
        return (
            <KonvaImage
                key={element.id}
                id={element.id}
                x={element.x}
                y={element.y}
                image={image}
                width={element.width}
                height={element.height}
                rotation={element.rotation}
                // Interactive properties
                draggable={!element.isLocked && !isPreviewMode}
                visible={element.isVisible}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClick={onSelect}
                onTap={onSelect}
            />
        );
    }

    return null;
};
