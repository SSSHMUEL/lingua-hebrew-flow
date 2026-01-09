import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    "aria-label"?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 'md', showText = true, "aria-label": ariaLabel }) => {
    const { isRTL } = useLanguage();

    const sizes = {
        sm: { icon: 'w-5 h-5', text: 'text-lg', t: 'text-[10px]' },
        md: { icon: 'w-8 h-8', text: 'text-3xl', t: 'text-lg' },
        lg: { icon: 'w-12 h-12', text: 'text-5xl', t: 'text-3xl' },
        xl: { icon: 'w-20 h-20', text: 'text-7xl', t: 'text-5xl' }
    };

    const currentSize = sizes[size];

    return (
        <div className={`flex flex-row items-center gap-2 ${className}`} dir="ltr" aria-label={ariaLabel} role={ariaLabel ? "img" : undefined}>
            {showText && (
                <span className={`${currentSize.text} font-black text-[#7eb1e3] tracking-tighter uppercase select-none`}>
                    TALK FIX
                </span>
            )}
            <div className={`${currentSize.icon} rounded-[30%] bg-gradient-to-br from-[#7eb1e3] to-[#e68a4d] flex items-center justify-center shadow-lg transition-transform`}>
                <span className={`text-black font-bold ${currentSize.t} select-none`}>T</span>
            </div>
        </div>
    );
};
