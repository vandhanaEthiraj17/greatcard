import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
    fontFamily?: string;
}

interface SelectProps {
    value?: string;
    onChange?: (value: string) => void;
    options: Option[];
    className?: string;
    label?: string;
    defaultValue?: string;
}

export const Select: React.FC<SelectProps> = ({ value, onChange, options, className = '', label, defaultValue }) => {
    return (
        <div className={`relative ${className}`}>
            {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
            <div className="relative">
                <select
                    value={value}
                    defaultValue={defaultValue}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} style={{ fontFamily: opt.fontFamily }}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                    <ChevronDown size={14} />
                </div>
            </div>
        </div>
    );
};
