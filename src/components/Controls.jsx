import React, { useState, useMemo } from 'react';
import searchIndex from '../data/search_index.json';
import partyColors from '../data/colors.json';
import _ from 'lodash';

const MODES = [
    { id: 'WINNER', label: 'Winner Map' },
    { id: 'RUNNER_UP', label: 'Runner-up Map' },
    { id: 'VOTE_SHARE', label: 'Vote Share Intensity' },
    { id: 'MARGIN', label: 'Victory Margin' },
    { id: 'TURNOUT', label: 'Turnout %' },
    { id: 'DEMOGRAPHICS_GENDER', label: 'Winner Gender' },
    { id: 'DEMOGRAPHICS_CATEGORY', label: 'Winner Category' },
];

const Controls = ({
    currentMode, onModeChange,
    selectedParty, onPartyChange,
    onSearch, onStateChange
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Extract unique states
    const states = useMemo(() => {
        const s = _.uniqBy(searchIndex, 'st_code').map(i => i.label.match(/\((.*?)\)/)[1]).sort();
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
        setSearchTerm(''); // Clear or keep? Clear is better for map view
        onSearch(item.id);
    };

    return (
        <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap gap-4 pointer-events-none">
            {/* Map Mode Selector */}
            <div className="bg-white p-2 rounded shadow-lg pointer-events-auto flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Map Mode</span>
                <select
                    value={currentMode}
                    onChange={(e) => onModeChange(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                >
                    {MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
            </div>

            {/* Party Selector (Only for Vote Share) */}
            {currentMode === 'VOTE_SHARE' && (
                <div className="bg-white p-2 rounded shadow-lg pointer-events-auto flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Party</span>
                    <select
                        value={selectedParty}
                        onChange={(e) => onPartyChange(e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 max-w-[150px]"
                    >
                        <option value="">Select Party</option>
                        {Object.keys(partyColors).sort().map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* State Filter */}
            <div className="bg-white p-2 rounded shadow-lg pointer-events-auto flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 uppercase">State</span>
                <select
                    onChange={(e) => onStateChange(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 max-w-[150px]"
                >
                    <option value="">All India</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Global Search */}
            <div className="bg-white p-2 rounded shadow-lg pointer-events-auto relative">
                <input
                    type="text"
                    placeholder="Search Constituency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-sm w-64 focus:outline-none focus:border-blue-500"
                />
                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white mt-1 rounded shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map(item => (
                            <div
                                key={item.id}
                                onClick={() => handleSearchSelect(item)}
                                className="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer border-b last:border-0"
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Controls;
