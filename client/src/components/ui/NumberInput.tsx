import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberInputProps {
    value?: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    label?: string;
    step?: number;
    className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    value = 0,
    onChange,
    min = 0,
    max = 9999,
    label,
    step = 1,
    className = ''
}) => {
    const handleIncrement = () => {
        if (value < max) onChange(value + step);
    };

    const handleDecrement = () => {
        if (value > min) onChange(value - step);
    };

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && <label className="text-xs font-medium text-gray-500 ml-1">{label}</label>}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white group hover:border-gray-300 transition-colors">
                <button
                    onClick={handleDecrement}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors border-r border-gray-100"
                >
                    <Minus size={12} />
                </button>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) onChange(val);
                    }}
                    onBlur={() => {
                        if (value < min) onChange(min);
                        if (value > max) onChange(max);
                    }}
                    className="w-full text-center text-sm py-1.5 outline-none font-medium text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                    onClick={handleIncrement}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors border-l border-gray-100"
                >
                    <Plus size={12} />
                </button>
            </div>
        </div>
    );
};
