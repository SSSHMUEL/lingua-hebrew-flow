import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

export const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState(0);

    useEffect(() => {
        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);

        // Stage transitions
        const stageTimeout1 = setTimeout(() => setStage(1), 500);
        const stageTimeout2 = setTimeout(() => setStage(2), 1000);
        const stageTimeout3 = setTimeout(() => setStage(3), 1500);

        // Complete loading
        const completeTimeout = setTimeout(() => {
            onComplete();
        }, 2500);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(stageTimeout1);
            clearTimeout(stageTimeout2);
            clearTimeout(stageTimeout3);
            clearTimeout(completeTimeout);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[hsl(222,47%,8%)] via-[hsl(222,47%,10%)] to-[hsl(222,47%,12%)] overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center gap-8 px-4">
                {/* Logo with scale animation */}
                <div
                    className="transform transition-all duration-1000"
                    style={{
                        opacity: stage >= 0 ? 1 : 0,
                        transform: stage >= 0 ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-180deg)',
                    }}
                >
                    <Logo className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>

                {/* Connecting text */}
                <div className="flex flex-col items-center gap-4">
                    <h2
                        className="text-2xl sm:text-3xl font-bold text-foreground transition-all duration-700"
                        style={{
                            opacity: stage >= 1 ? 1 : 0,
                            transform: stage >= 1 ? 'translateY(0)' : 'translateY(20px)',
                        }}
                    >
                        TalkFix
                    </h2>

                    <div
                        className="flex items-center gap-2 text-muted-foreground transition-all duration-700"
                        style={{
                            opacity: stage >= 2 ? 1 : 0,
                            transform: stage >= 2 ? 'translateY(0)' : 'translateY(20px)',
                        }}
                    >
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                        <span className="text-sm sm:text-base">מתחבר...</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div
                    className="w-64 sm:w-80 transition-all duration-700"
                    style={{
                        opacity: stage >= 3 ? 1 : 0,
                        transform: stage >= 3 ? 'translateY(0)' : 'translateY(20px)',
                    }}
                >
                    <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-blue-500 to-cyan-400 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                    </div>

                    {/* Progress percentage */}
                    <div className="mt-2 text-center text-xs text-muted-foreground font-mono">
                        {progress}%
                    </div>
                </div>

                {/* Status messages */}
                <div className="h-6 text-xs sm:text-sm text-muted-foreground/70 font-mono">
                    {progress < 30 && <span className="animate-pulse">טוען רכיבים...</span>}
                    {progress >= 30 && progress < 60 && <span className="animate-pulse">מאתחל ממשק...</span>}
                    {progress >= 60 && progress < 90 && <span className="animate-pulse">מכין חוויה...</span>}
                    {progress >= 90 && <span className="animate-pulse">כמעט מוכן...</span>}
                </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-primary/20 rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-primary/20 rounded-br-3xl" />
        </div>
    );
};
