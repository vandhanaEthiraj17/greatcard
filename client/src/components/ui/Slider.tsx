import React from 'react';

interface SliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    label?: string;
    className?: string;
}

export const Slider: React.FC<SliderProps> = ({
    value,
    min,
    max,
    step = 1,
    onChange,
    label,
    className = ''
}) => {
    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-gray-500">{label}</label>
                    <span className="text-xs text-brand-blue font-mono">{value}</span>
                </div>
            )}
            <div className="relative flex items-center h-4 w-full">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
            </div>
        </div>
    );
};
