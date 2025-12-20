import React, { useState, useRef, useEffect } from 'react';

const MultiSelect = ({
    options,
    value = [],
    onChange,
    placeholder = 'Select...',
    allLabel = 'All',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (optionValue) => {
        if (!optionValue) return; // Skip "All" option value

        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];

        onChange(newValue);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange([]);
    };

    const getDisplayText = () => {
        if (value.length === 0) return allLabel;
        if (value.length === 1) {
            const opt = options.find(o => o.value === value[0]);
            return opt?.label || value[0];
        }
        return `${value.length} selected`;
    };

    // Filter out the "All" option (empty value)
    const selectableOptions = options.filter(o => o.value !== '');

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all cursor-pointer"
            >
                <span className={`truncate ${value.length === 0 ? 'text-slate-500' : 'text-slate-800'}`}>
                    {getDisplayText()}
                </span>
                <div className="flex items-center gap-1 ml-1">
                    {value.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-0.5 hover:bg-slate-100 rounded transition-colors"
                            title="Clear selection"
                        >
                            <svg className="w-3 h-3 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <svg
                        className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto custom-scrollbar">
                    {selectableOptions.map((option) => (
                        <label
                            key={option.value}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 cursor-pointer transition-colors text-xs"
                        >
                            <input
                                type="checkbox"
                                checked={value.includes(option.value)}
                                onChange={() => handleToggle(option.value)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-slate-700 truncate">{option.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
