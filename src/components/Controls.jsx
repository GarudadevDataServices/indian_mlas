import React, { useState, useMemo } from 'react';
import searchIndex from '../data/search_index.json';
import partyColors from '../data/colors.json';
import Legend from './Legend';
import _ from 'lodash';

const MODES = [
    { id: 'WINNER', label: 'Winner Map', icon: '🏆' },
    { id: 'RUNNER_UP', label: 'Runner-up Map', icon: '🥈' },
    { id: 'VOTE_SHARE', label: 'Vote Share', icon: '📊' },
    { id: 'MARGIN', label: 'Victory Margin', icon: '📈' },
    { id: 'TURNOUT', label: 'Turnout %', icon: '🗳️' },
    { id: 'DEMOGRAPHICS_GENDER', label: 'By Gender', icon: '👤' },
    { id: 'DEMOGRAPHICS_CATEGORY', label: 'By Category', icon: '📋' },
];

// Controls component
const Controls = ({
    currentMode, onModeChange,
    selectedParty, onPartyChange,
    onSearch, onStateChange,
    data
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(true);

    // Extract unique states
    const states = useMemo(() => {
        const s = _.uniqBy(searchIndex, 'st_code')
            .map(i => {
                const match = i.label.match(/\(([^)]+)\)$/);
                return match ? match[1] : null;
            })
            .filter(Boolean)
            .sort();
        return s;
    }, []);

    // Filter search results
    const searchResults = useMemo(() => {
        if (searchTerm.length < 2) return [];
        return searchIndex.filter(item =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10);
    }, [searchTerm]);

    const handleSearchSelect = (item) => {
        setSearchTerm('');
        onSearch(item.id);
    };

    const labelStyle = "text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5";
    const selectStyle = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition-all cursor-pointer";
    const inputStyle = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition-all";

    return (
        <>
            {/* Toggle Button - Always visible */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed top-4 z-[1001] bg-white/90 backdrop-blur-lg p-3 rounded-xl shadow-lg border border-white/30 hover:bg-white transition-all duration-300 ${isOpen ? 'left-[280px]' : 'left-4'
                    }`}
                title={isOpen ? 'Hide Controls' : 'Show Controls'}
            >
                <svg
                    className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Left Panel */}
            <div
                className={`fixed left-0 top-0 h-full w-[260px] bg-white/95 backdrop-blur-xl shadow-2xl border-r border-slate-200/50 z-[1000] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        🗳️ Election Map
                    </h1>
                    <p className="text-blue-100 text-xs mt-0.5">India Assembly Elections</p>
                </div>

                {/* Controls */}
                <div className="p-4 space-y-5 overflow-y-auto h-[calc(100%-80px)] custom-scrollbar">
                    {/* Map Mode Selector */}
                    <div>
                        <label className={labelStyle}>
                            <span>🗺️</span>
                            <span>Map Mode</span>
                        </label>
                        <select
                            value={currentMode}
                            onChange={(e) => onModeChange(e.target.value)}
                            className={selectStyle}
                        >
                            {MODES.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.icon} {m.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Party Selector (Only for Vote Share) */}
                    {currentMode === 'VOTE_SHARE' && (
                        <div className="animate-fadeIn">
                            <label className={labelStyle}>
                                <span>🏛️</span>
                                <span>Select Party</span>
                            </label>
                            <select
                                value={selectedParty}
                                onChange={(e) => onPartyChange(e.target.value)}
                                className={selectStyle}
                            >
                                <option value="">Choose a party...</option>
                                {Object.keys(partyColors).sort().map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-slate-200 pt-1"></div>

                    {/* State Filter */}
                    <div>
                        <label className={labelStyle}>
                            <span>📍</span>
                            <span>Filter by State</span>
                        </label>
                        <select
                            onChange={(e) => onStateChange(e.target.value)}
                            className={selectStyle}
                        >
                            <option value="">All India</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <label className={labelStyle}>
                            <span>🔍</span>
                            <span>Search Constituency</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={inputStyle}
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white mt-1 rounded-xl shadow-xl max-h-48 overflow-y-auto border border-slate-200 z-50">
                                {searchResults.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSearchSelect(item)}
                                        className="px-3 py-2.5 text-sm hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                                    >
                                        <div className="font-medium text-slate-800">{item.label.split('(')[0].trim()}</div>
                                        <div className="text-xs text-slate-500">
                                            {item.label.match(/\(([^)]+)\)$/)?.[1]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-200 pt-1"></div>

                    {/* Legend (Replaces Tips) */}
                    <Legend mode={currentMode} selectedParty={selectedParty} data={data} inline={true} />
                </div>
            </div>
        </>
    );
};

export default Controls;
