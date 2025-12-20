import React, { useState, useMemo } from 'react';
import searchIndex from '../data/search_index.json';
import partyColors from '../data/colors.json';
import Legend from './Legend';
import MultiSelect from './MultiSelect';
import _ from 'lodash';

const MODES = [
    { id: 'WINNER', label: 'Winner Map', icon: '🏆' },
    { id: 'RUNNER_UP', label: 'Runner-up Map', icon: '🥈' },
    { id: 'VOTE_SHARE', label: 'Vote Share', icon: '📊' },
    { id: 'MARGIN', label: 'Victory Margin', icon: '📈' },
    { id: 'TURNOUT', label: 'Turnout %', icon: '🗳️' },
    { id: 'DEMOGRAPHICS_GENDER', label: 'By Gender', icon: '👤' },
    { id: 'DEMOGRAPHICS_CATEGORY', label: 'By Category', icon: '📋' },
    { id: 'DEMOGRAPHICS_AGE', label: 'By Age', icon: '🎂' },
];

// Filter configurations
const AGE_RANGES = [
    { value: '', label: 'All Ages' },
    { value: '21-35', label: '21-35 (Young)', min: 21, max: 35 },
    { value: '36-45', label: '36-45', min: 36, max: 45 },
    { value: '46-55', label: '46-55', min: 46, max: 55 },
    { value: '56-65', label: '56-65', min: 56, max: 65 },
    { value: '65+', label: '65+ (Senior)', min: 65, max: 150 },
];

const MARGIN_RANGES = [
    { value: '', label: 'All Margins' },
    { value: '<2', label: '< 2% (Close)', min: 0, max: 2 },
    { value: '2-5', label: '2-5%', min: 2, max: 5 },
    { value: '5-10', label: '5-10%', min: 5, max: 10 },
    { value: '10-20', label: '10-20%', min: 10, max: 20 },
    { value: '>20', label: '> 20% (Landslide)', min: 20, max: 100 },
];

const TURNOUT_RANGES = [
    { value: '', label: 'All Turnout' },
    { value: '<60', label: '< 60%', min: 0, max: 60 },
    { value: '60-70', label: '60-70%', min: 60, max: 70 },
    { value: '70-75', label: '70-75%', min: 70, max: 75 },
    { value: '75-80', label: '75-80%', min: 75, max: 80 },
    { value: '80-85', label: '80-85%', min: 80, max: 85 },
    { value: '>85', label: '> 85%', min: 85, max: 100 },
];

// Controls component
const Controls = ({
    currentMode, onModeChange,
    selectedParty, onPartyChange,
    onSearch, onStateChange, selectedState,
    filters, onFiltersChange,
    data, onCopyShareLink
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

    const handleFilterChange = (key, value) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const activeFilterCount = useMemo(() => {
        if (!filters) return 0;
        return Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : (v && v !== '')).length;
    }, [filters]);

    const labelStyle = "text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5";
    const selectStyle = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition-all cursor-pointer";
    const inputStyle = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition-all";
    const filterSelectStyle = "w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition-all cursor-pointer";

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
                {/* Controls - now starts from the top */}
                <div className="p-4 space-y-4 overflow-y-auto h-full custom-scrollbar">
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
                            value={selectedState || ''}
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

                    {/* Advanced Filters Toggle */}
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    >
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                            <span>⚙️</span>
                            <span>Advanced Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                                    {activeFilterCount}
                                </span>
                            )}
                        </span>
                        <svg
                            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Advanced Filters Panel */}
                    {showAdvancedFilters && (
                        <div className="animate-fadeIn space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200 relative z-20">
                            {/* Age Filter */}
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Age</label>
                                <MultiSelect
                                    options={AGE_RANGES}
                                    value={filters?.age || []}
                                    onChange={(val) => handleFilterChange('age', val)}
                                    allLabel="All Ages"
                                />
                            </div>

                            {/* Gender Filter */}
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Gender</label>
                                <MultiSelect
                                    options={[
                                        { value: '', label: 'All Genders' },
                                        { value: 'MALE', label: 'Male' },
                                        { value: 'FEMALE', label: 'Female' }
                                    ]}
                                    value={filters?.gender || []}
                                    onChange={(val) => handleFilterChange('gender', val)}
                                    allLabel="All Genders"
                                />
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Category</label>
                                <MultiSelect
                                    options={[
                                        { value: '', label: 'All Categories' },
                                        { value: 'SC', label: 'SC' },
                                        { value: 'ST', label: 'ST' },
                                        { value: 'GEN', label: 'General' }
                                    ]}
                                    value={filters?.category || []}
                                    onChange={(val) => handleFilterChange('category', val)}
                                    allLabel="All Categories"
                                />
                            </div>

                            {/* Victory Margin Filter */}
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Victory Margin</label>
                                <MultiSelect
                                    options={MARGIN_RANGES}
                                    value={filters?.margin || []}
                                    onChange={(val) => handleFilterChange('margin', val)}
                                    allLabel="All Margins"
                                />
                            </div>

                            {/* Turnout Filter */}
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Turnout</label>
                                <MultiSelect
                                    options={TURNOUT_RANGES}
                                    value={filters?.turnout || []}
                                    onChange={(val) => handleFilterChange('turnout', val)}
                                    allLabel="All Turnout"
                                />
                            </div>

                            {/* Party Filter */}
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Winning Party</label>
                                <MultiSelect
                                    options={[
                                        { value: '', label: 'All Parties' },
                                        ...Object.keys(partyColors).sort().map(p => ({ value: p, label: p }))
                                    ]}
                                    value={filters?.party || []}
                                    onChange={(val) => handleFilterChange('party', val)}
                                    allLabel="All Parties"
                                />
                            </div>

                            {/* Clear Filters */}
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={() => onFiltersChange({ age: [], gender: [], category: [], margin: [], turnout: [], party: [] })}
                                    className="w-full text-xs text-red-600 hover:text-red-700 font-medium py-1.5 hover:bg-red-50 rounded transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            )}

                        </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-slate-200 pt-1"></div>

                    {/* Share Link Button - Always visible */}
                    {onCopyShareLink && (
                        <button
                            onClick={onCopyShareLink}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share This View
                        </button>
                    )}

                    {/* Divider */}
                    <div className="border-t border-slate-200 pt-1"></div>

                    {/* Legend (Replaces Tips) */}
                    <Legend mode={currentMode} selectedParty={selectedParty} data={data} inline={true} />
                </div>
            </div>
        </>
    );
};

// Export filter range configs for use in App.jsx
export const FILTER_CONFIGS = {
    AGE_RANGES,
    MARGIN_RANGES,
    TURNOUT_RANGES,
};

export default Controls;
