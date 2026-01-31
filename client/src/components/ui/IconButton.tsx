import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: LucideIcon;
    label?: string;
    isActive?: boolean;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon: Icon,
    label,
    isActive,
    variant = 'secondary',
    className = '',
    ...props
}) => {
    const baseStyles = "p-2 rounded-lg flex items-center justify-center transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
        secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    };

    const activeStyles = isActive ? "bg-blue-100 text-blue-700 border-blue-200 ring-2 ring-blue-500/20" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${activeStyles} ${className}`}
            title={label}
            {...props}
        >
            <Icon size={20} strokeWidth={1.5} />
            {label && <span className="ml-2 text-sm font-medium">{label}</span>}
        </button>
    );
};
