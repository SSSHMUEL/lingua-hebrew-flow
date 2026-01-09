import React, { useState, useEffect } from 'react';

interface WordSwapDemoProps {
    isRTL?: boolean;
}

export const WordSwapDemo = ({ isRTL = true }: WordSwapDemoProps) => {
    const [step, setStep] = useState(0);

    // Cycle: 
    // 0: Full Text
    // 1: Highlight Word 1
    // 2: Swap Word 1
    // 3: Highlight Word 2
    // 4: Swap Word 2
    // 5: Highlight Word 3
    // 6: Swap Word 3
    // 7: Pause
    // 8: Reset to 0

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % 9);
        }, 1500); // Change step every 1.5 seconds

        return () => clearInterval(timer);
    }, []);

    const getWord = (original: string, translation: string, highlightStep: number, swapStep: number) => {
        const isSwapped = step >= swapStep;
        const isHighlight = step === highlightStep || (step === swapStep && !isSwapped); // Highlight right before swap

        return (
            <span
                className={`inline-block px-1 rounded-md transition-all duration-500 transform ${isSwapped
                    ? 'bg-primary/20 text-primary font-bold'
                    : isHighlight
                        ? 'bg-yellow-500/30 scale-110'
                        : ''
                    }`}
            >
                <span className={`inline-block transition-all duration-500 ${isSwapped ? 'animate-in fade-in zoom-in duration-300' : ''}`}>
                    {isSwapped ? translation : original}
                </span>
            </span>
        );
    };

    return (
        <div className="w-full max-w-md mx-auto glass-card rounded-2xl p-6 border border-primary/30 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)] relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_60px_-10px_hsl(var(--primary)/0.4)] hover:scale-[1.02]">
            {/* Mock Browser Header */}
            <div className="flex items-center gap-2 mb-4 opacity-50 border-b border-white/10 pb-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                <div className="w-3 h-3 rounded-full bg-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <div className="w-full h-2 bg-white/10 rounded-full ml-2" />
            </div>

            <div className={`space-y-4 font-medium text-lg md:text-xl leading-relaxed ${isRTL ? 'text-right' : 'text-left'} relative z-10`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-50 blur-xl pointer-events-none" />

                {isRTL ? (
                    <>
                        <p>
                            {getWord("שלום", "HELLO", 1, 2)} חברים!
                        </p>
                        <p>
                            ברוכים הבאים ל-TalkFix.
                        </p>
                        <p>
                            כאן אנחנו {getWord("לומדים", "LEARN", 3, 4)} שפות.
                        </p>
                        <p>
                            זה פשוט, קל, ומשפר את ה-{getWord("אנגלית", "ENGLISH", 5, 6)} שלכם!
                        </p>
                    </>
                ) : (
                    <>
                        <p>
                            {getWord("Hello", "שלום", 1, 2)} friends!
                        </p>
                        <p>
                            Welcome to TalkFix.
                        </p>
                        <p>
                            Here we {getWord("learn", "לומדים", 3, 4)} languages.
                        </p>
                        <p>
                            It's simple, easy, and improves your {getWord("Hebrew", "עברית", 5, 6)}!
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
