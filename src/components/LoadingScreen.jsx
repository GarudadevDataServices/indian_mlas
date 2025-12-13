import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Animated Map Icon */}
            <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 opacity-20 animate-ping absolute" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center relative">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Indian Assembly Elections
            </h1>
            <p className="text-slate-400 mb-8">Interactive Constituency Map</p>

            {/* Loading Bar */}
            <div className="w-64 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full animate-loading-bar" />
            </div>

            {/* Loading Text */}
            <p className="text-slate-500 text-sm mt-4">
                Loading ~4000 constituencies...
            </p>

            <style>{`
                @keyframes loading-bar {
                    0% { width: 0%; transform: translateX(0); }
                    50% { width: 100%; transform: translateX(0); }
                    100% { width: 100%; transform: translateX(100%); }
                }
                .animate-loading-bar {
                    animation: loading-bar 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
