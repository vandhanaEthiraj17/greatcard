import React from 'react';
import { useEditorStore } from '../store/editorStore';
import {
    AlignLeft, AlignCenter, AlignRight,
    Bold, Italic, Underline,
    Lock, Unlock, Trash2,
    Type, Move, Palette,
    Image as ImageIcon
} from 'lucide-react';
import { IconButton } from '../components/ui/IconButton';
import { Select } from '../components/ui/Select';
import { NumberInput } from '../components/ui/NumberInput';
import { ToggleGroup } from '../components/ui/ToggleGroup';
import { Slider } from '../components/ui/Slider';

const FONT_OPTIONS = [
    { value: 'Inter, sans-serif', label: 'Inter', fontFamily: 'Inter, sans-serif' },
    { value: 'Arial, sans-serif', label: 'Arial', fontFamily: 'Arial, sans-serif' },
    { value: 'Times New Roman, serif', label: 'Times New Roman', fontFamily: 'Times New Roman, serif' },
    { value: 'Georgia, serif', label: 'Georgia', fontFamily: 'Georgia, serif' },
    { value: 'Courier New, monospace', label: 'Courier New', fontFamily: 'Courier New, monospace' },
    { value: 'Brush Script MT, cursive', label: 'Brush Script', fontFamily: 'Brush Script MT, cursive' },
];

const ALIGN_OPTIONS = [
    { value: 'left', icon: AlignLeft, title: 'Align Left' },
    { value: 'center', icon: AlignCenter, title: 'Align Center' },
    { value: 'right', icon: AlignRight, title: 'Align Right' },
];

export const RightPropertiesPanel: React.FC = () => {
    const { elements, selectedId, updateElement, deleteElement } = useEditorStore();
    const selectedElement = elements.find(el => el.id === selectedId);

    if (!selectedElement) {
        return (
            <div className="w-72 bg-white border-l border-gray-200 p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-gray-900 font-medium mb-1">No selection</h3>
                <p className="text-sm text-gray-500">Select an element on the canvas to edit its properties.</p>
            </div>
        );
    }

    const handleChange = (key: string, value: any) => {
        updateElement(selectedElement.id, { [key]: value });
    };

    return (
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                    {selectedElement.type === 'text' ? <Type size={16} className="text-blue-500" /> : <ImageIcon size={16} className="text-green-500" />}
                    {selectedElement.type === 'text' ? 'Text' : 'Image'} Properties
                </span>
                <div className="flex gap-1">
                    <IconButton
                        icon={selectedElement.isLocked ? Lock : Unlock}
                        variant="ghost"
                        className="h-8 w-8 text-gray-500"
                        onClick={() => handleChange('isLocked', !selectedElement.isLocked)}
                        title={selectedElement.isLocked ? "Unlock" : "Lock"}
                    />
                    <IconButton
                        icon={Trash2}
                        variant="danger"
                        className="h-8 w-8"
                        onClick={() => deleteElement(selectedElement.id)}
                        title="Delete"
                    />
                </div>
            </div>

            <div className="p-5 space-y-6">

                {/* --- Typography Section --- */}
                {selectedElement.type === 'text' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Typography</label>
                        </div>

                        {/* Font Family */}
                        <Select
                            value={selectedElement.fontFamily || 'Inter, sans-serif'}
                            onChange={(val) => handleChange('fontFamily', val)}
                            options={FONT_OPTIONS}
                        />

                        {/* Size & Weight Row */}
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <NumberInput
                                    label="Size"
                                    value={selectedElement.fontSize}
                                    onChange={(val) => handleChange('fontSize', val)}
                                    min={8} max={400}
                                />
                            </div>
                            <div className="w-24">
                                <Select
                                    value={selectedElement.fontWeight || 'normal'}
                                    onChange={(val) => handleChange('fontWeight', val)}
                                    options={[
                                        { value: 'normal', label: 'Regular' },
                                        { value: 'bold', label: 'Bold' },
                                        { value: '300', label: 'Light' }
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Styling Row */}
                        <div className="flex justify-between items-end gap-2">
                            {/* Alignment Group */}
                            <div className="flex-1">
                                <ToggleGroup
                                    value={selectedElement.align || 'left'}
                                    onChange={(val) => handleChange('align', val)}
                                    options={ALIGN_OPTIONS}
                                />
                            </div>

                            {/* Style Toggles */}
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <IconButton
                                    icon={Bold}
                                    isActive={selectedElement.fontWeight === 'bold'}
                                    onClick={() => handleChange('fontWeight', selectedElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                                    variant="ghost"
                                    className="h-8 w-8 rounded-md"
                                />
                                <IconButton
                                    icon={Italic}
                                    isActive={selectedElement.fontStyle === 'italic'}
                                    onClick={() => handleChange('fontStyle', selectedElement.fontStyle === 'italic' ? 'normal' : 'italic')}
                                    variant="ghost"
                                    className="h-8 w-8 rounded-md"
                                />
                                <IconButton
                                    icon={Underline}
                                    isActive={selectedElement.textDecoration === 'underline'}
                                    onClick={() => handleChange('textDecoration', selectedElement.textDecoration === 'underline' ? 'none' : 'underline')}
                                    variant="ghost"
                                    className="h-8 w-8 rounded-md"
                                />
                            </div>
                        </div>

                        {/* Content Edit */}
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-medium ml-1">Content</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                rows={3}
                                value={selectedElement.text}
                                onChange={(e) => handleChange('text', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <hr className="border-gray-100" />

                {/* --- Appearance Section --- */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Palette size={12} /> Appearance
                    </label>

                    {/* Fill Color */}
                    {selectedElement.type === 'text' && (
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium ml-1">Text Color</label>
                            <div className="flex gap-2 items-center">
                                <div className="relative w-10 h-10 rounded-full border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
                                    <input
                                        type="color"
                                        value={selectedElement.fill || '#000000'}
                                        onChange={(e) => handleChange('fill', e.target.value)}
                                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                                    />
                                </div>
                                <div className="flex-1 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono text-gray-600">
                                    {selectedElement.fill || '#000000'}
                                </div>
                            </div>

                            {/* Preset Colors */}
                            <div className="flex gap-1.5 flex-wrap">
                                {['#000000', '#FFFFFF', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => handleChange('fill', color)}
                                        className="w-6 h-6 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Opacity */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs text-gray-500 font-medium">Opacity</label>
                            <span className="text-xs text-gray-400">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="1" step="0.01"
                            value={selectedElement.opacity ?? 1}
                            onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* --- Layout Section --- */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Move size={12} /> Layout & Position
                    </label>

                    <div className="space-y-4">
                        <Slider
                            label="X Position"
                            min={0}
                            max={1200}
                            value={Math.round(selectedElement.x)}
                            onChange={(val) => handleChange('x', val)}
                        />
                        <Slider
                            label="Y Position"
                            min={0}
                            max={800}
                            value={Math.round(selectedElement.y)}
                            onChange={(val) => handleChange('y', val)}
                        />
                    </div>
                    {selectedElement.type === 'image' && (
                        <>
                            <NumberInput
                                label="Width"
                                value={Math.round(selectedElement.width || 0)}
                                onChange={(val) => handleChange('width', val)}
                            />
                            <NumberInput
                                label="Height"
                                value={Math.round(selectedElement.height || 0)}
                                onChange={(val) => handleChange('height', val)}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>

    );
};
