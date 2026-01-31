import React from 'react';
import { useEditorStore } from '../store/editorStore';
import { Eye, EyeOff, Lock, Unlock, GripVertical } from 'lucide-react';
import { IconButton } from '../components/ui/IconButton';

export const LayersPanel: React.FC = () => {
    const { elements, selectedId, selectElement, updateElement } = useEditorStore();

    // Reverse elements for layer list (top layer first)
    const layers = [...elements].reverse();

    return (
        <div className="flex flex-col h-1/3 border-t border-gray-200 bg-white">
            <div className="p-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Layers</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {layers.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No layers</p>
                )}

                {layers.map((el) => (
                    <div
                        key={el.id}
                        onClick={() => selectElement(el.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm group ${selectedId === el.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                        <GripVertical size={14} className="text-gray-300 cursor-grab" />

                        <div className="flex-1 truncate font-medium text-gray-700">
                            {el.type === 'image' ? 'Image' : (el.text || 'Text')}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <IconButton
                                icon={el.isVisible ? Eye : EyeOff}
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={(e) => { e.stopPropagation(); updateElement(el.id, { isVisible: !el.isVisible }); }}
                            />
                            <IconButton
                                icon={el.isLocked ? Lock : Unlock}
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={(e) => { e.stopPropagation(); updateElement(el.id, { isLocked: !el.isLocked }); }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
