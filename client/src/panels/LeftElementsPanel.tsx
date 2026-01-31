import React from 'react';
import { Type, Image as ImageIcon, MessageSquare, User, Calendar, Smile, Sparkles } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { v4 as uuidv4 } from 'uuid';

export const LeftElementsPanel: React.FC = () => {
    const addElement = useEditorStore(state => state.addElement);
    const autoArrangeElements = useEditorStore(state => state.autoArrangeElements);
    const isAnalyzing = useEditorStore(state => state.isAnalyzing);

    const addText = (text: string, placeholderKey?: string) => {
        addElement({
            id: uuidv4(),
            type: 'text',
            x: 200,
            y: 200,
            text,
            fontSize: 40,
            fontFamily: 'Inter, sans-serif',
            fill: '#000000',
            width: 300,
            isVisible: true,
            isLocked: false,
            align: 'center',
            placeholderKey
        });
    };

    const addImage = () => {
        addElement({
            id: uuidv4(),
            type: 'image',
            x: 200,
            y: 200,
            width: 200,
            height: 200,
            src: 'https://placehold.co/200x200/png', // Default placeholder
            isVisible: true,
            isLocked: false,
        });
    };

    return (
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Elements</h3>
            </div>

            <div className="p-4 space-y-6">
                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Text Placeholders</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => addText('Greeting', 'Greeting')}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                            <MessageSquare className="text-gray-400 group-hover:text-blue-500 mb-2" />
                            <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">Greeting</span>
                        </button>
                        <button
                            onClick={() => addText('Recipient Name', 'RecipientName')}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                            <User className="text-gray-400 group-hover:text-blue-500 mb-2" />
                            <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">Recipient</span>
                        </button>
                        <button
                            onClick={() => addText('Occasion', 'Occasion')}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                            <Smile className="text-gray-400 group-hover:text-blue-500 mb-2" />
                            <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">Occasion</span>
                        </button>
                        <button
                            onClick={() => addText('Custom Date', 'Date')}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                            <Calendar className="text-gray-400 group-hover:text-blue-500 mb-2" />
                            <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">Date</span>
                        </button>
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Standard Elements</h4>
                    <button
                        onClick={() => addText('Add Heading')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all mb-2 text-left"
                    >
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Type size={16} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Add Text Box</span>
                    </button>

                    <button
                        onClick={addImage}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-left"
                    >
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <ImageIcon size={16} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Add Image/Logo</span>
                    </button>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Smart Tools</h4>
                    <button
                        onClick={() => autoArrangeElements('https://placehold.co/1080x1920/png')} // TO DO: Use actual background URL
                        disabled={isAnalyzing}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all text-left ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                            {isAnalyzing ? (
                                <span className="animate-spin text-blue-600">⟳</span>
                            ) : (
                                <Sparkles size={16} className="text-blue-600" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-blue-900">
                                {isAnalyzing ? 'Analyzing...' : 'Auto-Fill Layout'}
                            </span>
                            <span className="text-xs text-blue-600">Detects lines & labels</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
