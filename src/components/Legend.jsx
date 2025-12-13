import React from 'react';
import { getPartyColor } from '../utils/colors';
import partyColors from '../data/colors.json';

const LEGEND_CONFIG = {
    WINNER: {
        title: 'Winning Party',
        type: 'parties',
    },
    RUNNER_UP: {
        title: 'Runner-up Party',
        type: 'parties',
    },
    VOTE_SHARE: {
        title: 'Vote Share Intensity',
        items: [
            { color: 'rgb(6, 77, 25)', label: '> 50%' },
            { color: 'rgb(0, 255, 0)', label: '35-50%' },
            { color: 'rgb(255, 255, 0)', label: '20-35%' },
            { color: 'rgb(255, 0, 0)', label: '10-20%' },
            { color: 'rgb(137, 0, 0)', label: '< 10%' },
        ]
    },
    MARGIN: {
        title: 'Victory Margin',
        items: [
            { color: 'rgb(6, 77, 25)', label: '> 20% (Landslide)' },
            { color: 'rgb(0, 255, 0)', label: '10-20%' },
            { color: 'rgb(255, 255, 0)', label: '5-10%' },
            { color: 'rgb(255, 0, 0)', label: '2-5%' },
            { color: 'rgb(137, 0, 0)', label: '< 2% (Close)' },
        ]
    },
    TURNOUT: {
        title: 'Voter Turnout',
        items: [
            { color: '#1e3a8a', label: '> 85%' },
            { color: '#1e40af', label: '80-85%' },
            { color: '#1d4ed8', label: '75-80%' },
            { color: '#2563eb', label: '70-75%' },
            { color: '#3b82f6', label: '60-70%' },
            { color: '#93c5fd', label: '< 60%' },
        ]
    },
    DEMOGRAPHICS_GENDER: {
        title: 'Winner Gender',
        items: [
            { color: '#3b82f6', label: 'Male' },
            { color: '#ec4899', label: 'Female' },
        ]
    },
    DEMOGRAPHICS_CATEGORY: {
        title: 'Winner Category',
        items: [
            { color: '#7c3aed', label: 'SC' },
            { color: '#059669', label: 'ST' },
            { color: '#f59e0b', label: 'General' },
        ]
    }
};

// Top parties to show in legend
const TOP_PARTIES = ['BJP', 'INC', 'AAP', 'TMC', 'DMK', 'YSRCP', 'BJD', 'TRS', 'SP', 'NCP'];

const Legend = ({ mode, selectedParty }) => {
    const config = LEGEND_CONFIG[mode];
    if (!config) return null;

    // For party-based modes, show party colors
    if (config.type === 'parties') {
        const parties = TOP_PARTIES.filter(p => partyColors[p]);
        return (
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-white/30 p-3 z-[1000] max-w-[200px] animate-fadeIn">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">{config.title}</h4>
                <div className="grid grid-cols-2 gap-1.5">
                    {parties.map(party => (
                        <div key={party} className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-3 rounded-sm flex-shrink-0"
                                style={{ backgroundColor: getPartyColor(party) }}
                            />
                            <span className="text-[10px] text-slate-700 truncate">{party}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // For gradient-based modes
    return (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-white/30 p-3 z-[1000] animate-fadeIn">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                {config.title}
                {mode === 'VOTE_SHARE' && selectedParty && (
                    <span className="text-blue-600 ml-1">({selectedParty})</span>
                )}
            </h4>
            <div className="space-y-1">
                {config.items.map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div
                            className="w-4 h-3 rounded-sm flex-shrink-0 border border-slate-200"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[11px] text-slate-600">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Legend;
