import React from 'react';

interface ToggleOption {
    value: string;
    icon?: React.ElementType;
    label?: string;
    title?: string;
}

interface ToggleGroupProps {
    options: ToggleOption[];
    value: string | string[]; // Single value or array for multi-select
    onChange: (value: string) => void;
    multiSelect?: boolean;
    className?: string;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
    options,
    value,
    onChange,
    multiSelect = false,
    className = ''
}) => {
    return (
        <div className={`flex bg-gray-100 p-1 rounded-lg gap-1 ${className}`}>
            {options.map((opt) => {
                const isActive = multiSelect
                    ? Array.isArray(value) && value.includes(opt.value)
                    : value === opt.value;

                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        title={opt.title}
                        className={`
                            flex-1 flex items-center justify-center p-1.5 rounded-md transition-all
                            ${isActive
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                            }
                        `}
                    >
                        {opt.icon && <opt.icon size={16} strokeWidth={isActive ? 2.5 : 2} />}
                        {opt.label && <span className="text-sm">{opt.label}</span>}
                    </button>
                );
            })}
        </div>
    );
};
