import React, { useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { useEditorStore } from '../store/editorStore';
import { ElementRenderer } from './ElementRenderer';
import { TransformerControls } from './TransformerControls';

export const CardCanvas: React.FC = () => {
    const {
        width,
        height,
        scale,
        elements,
        selectedId,
        selectElement,
        updateElement
    } = useEditorStore();

    const stageRef = useRef<any>(null);

    const handleDeselect = (e: any) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectElement(null);
        }
    };

    return (
        <Stage
            width={width * scale + 100} // Extra padding
            height={height * scale + 100}
            onMouseDown={handleDeselect}
            onTouchStart={handleDeselect}
            ref={stageRef}
            style={{
                margin: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Layer
                scaleX={scale}
                scaleY={scale}
                x={50} // Offset for padding
                y={50}
            >
                {/* White Card Background */}
                <Rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill="white"
                    shadowColor="black"
                    shadowBlur={20}
                    shadowOpacity={0.1}
                    shadowOffset={{ x: 0, y: 10 }}
                    onClick={() => selectElement(null)} // Clicking card bg also deselects elements
                />

                {/* Elements */}
                {elements.map((element) => (
                    <ElementRenderer
                        key={element.id}
                        element={element}
                        isSelected={element.id === selectedId}
                        onSelect={() => selectElement(element.id)}
                        onChange={(attrs) => updateElement(element.id, attrs)}
                    />
                ))}

                {/* Controls Layer */}
                <TransformerControls />
            </Layer>
        </Stage>
    );
};
