import React from 'react';
import { cn } from '@/components/common/Icon';

interface LogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
    variant?: 'color' | 'white';
}

export const Logo = ({ className, size = 32, showText = true, variant = 'color' }: LogoProps) => {
    // Brand Colors
    const primaryColor = variant === 'color' ? '#2563EB' : '#FFFFFF'; // blue-600
    const secondaryColor = variant === 'color' ? '#60A5FA' : '#E0F2FE'; // blue-400

    return (
        <div className={cn("flex items-center gap-2 select-none", className)}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="GreetCard Logo"
            >
                {/* Card Background - Rounded Soft */}
                <rect x="4" y="4" width="24" height="24" rx="6" fill={primaryColor} fillOpacity="0.1" />
                <rect x="4" y="4" width="24" height="24" rx="6" stroke={primaryColor} strokeWidth="2.5" />

                {/* "Smile" / Connector Line */}
                <path
                    d="M10 17C10 17 12.5 20.5 16 20.5C19.5 20.5 22 17 22 17"
                    stroke={primaryColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Eyes / Dots for human feel */}
                <circle cx="11" cy="12" r="1.5" fill={primaryColor} />
                <circle cx="21" cy="12" r="1.5" fill={primaryColor} />
            </svg>

            {showText && (
                <span className={cn(
                    "font-extrabold tracking-tight leading-none",
                    variant === 'color' ? "text-gray-900" : "text-white"
                )} style={{ fontSize: size * 0.7 }}>
                    GreetCard
                </span>
            )}
        </div>
    );
};
