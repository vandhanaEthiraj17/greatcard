import { useEditorStore, Layer } from "@/store/editorStore";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/common/Icon";
import {
    Eye, EyeOff, Lock, Unlock, GripVertical, Trash2,
    Type, Image, Square
} from "lucide-react";
import { Input } from "@/components/ui/Input";

export const LayerListPanel = () => {
    const {
        layoutLayers, selectedId,
        selectElement, updateLayoutLayer, deleteElement, reorderElement
    } = useEditorStore();

    // In a real app, we'd use 'dnd-kit' or 'react-beautiful-dnd' here.
    // For now, simple re-order buttons or just visualizing z-index order (array order).
    // The layer array is usually rendered back-to-front (0 is bottom).
    // So visual list should probably be reversed (top is front).

    const reversedLayers = [...layoutLayers].filter(l => l.type !== 'logo').reverse();

    const handleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        selectElement(id);
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full animate-in slide-in-from-left duration-300">
            <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 bg-gray-50/50">
                <span className="font-semibold text-sm text-gray-700">Layers</span>
                <span className="text-xs text-gray-400">{layoutLayers.length} items</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {reversedLayers.map((layer) => (
                    <div
                        key={layer.id}
                        onClick={(e) => handleSelect(layer.id, e)}
                        className={`
                            group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all border
                            ${selectedId === layer.id
                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                            }
                        `}
                    >
                        {/* Drag Handle (Visual Only) */}
                        <div className="text-gray-300 cursor-grab hover:text-gray-500">
                            <GripVertical size={14} />
                        </div>

                        {/* Icon Type */}
                        <div className={`p-1.5 rounded-md ${selectedId === layer.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                            {layer.type === 'text' && <Icon icon={Type} size={14} />}
                            {layer.type === 'image' && <Icon icon={Image} size={14} />}
                            {layer.type === 'logo' && <Icon icon={Image} size={14} />}
                            {layer.type === 'background' && <Icon icon={Square} size={14} />}
                        </div>

                        {/* Name Input (Renaming) */}
                        <div className="flex-1 min-w-0">
                            {selectedId === layer.id ? (
                                <input
                                    className="w-full text-xs bg-transparent border-none focus:ring-0 p-0 font-medium text-gray-900"
                                    value={layer.name}
                                    onChange={(e) => updateLayoutLayer(layer.id, { name: e.target.value })}
                                />
                            ) : (
                                <div className="text-xs font-medium text-gray-700 truncate">{layer.name}</div>
                            )}
                        </div>

                        {/* Action Buttons (Hover Only) */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); updateLayoutLayer(layer.id, { locked: !layer.locked }); }}
                                className={`p-1 rounded hover:bg-gray-200 ${layer.locked ? 'text-orange-500 opacity-100' : 'text-gray-400'}`}
                            >
                                <Icon icon={layer.locked ? Lock : Unlock} size={12} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); updateLayoutLayer(layer.id, { visible: !layer.visible }); }}
                                className={`p-1 rounded hover:bg-gray-200 ${!layer.visible ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                                <Icon icon={layer.visible ? Eye : EyeOff} size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Note for Reorder */}
            <div className="p-4 bg-gray-50 border-t text-xs text-gray-400 text-center">
                Drag items to reorder (Coming soon)
            </div>
        </div>
    );
};
