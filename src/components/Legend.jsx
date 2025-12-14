import React, { useMemo } from 'react';
import { getPartyColor } from '../utils/colors';

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

const Legend = ({ mode, selectedParty, data, inline = false }) => {
    const config = LEGEND_CONFIG[mode];

    // Calculate dynamic stats for party-based modes
    const partyStats = useMemo(() => {
        if (!data || !config || config.type !== 'parties') return [];

        const counts = {};
        let total = 0;

        data.features.forEach(f => {
            const p = f.properties;
            const party = mode === 'WINNER' ? p.winner_party : p.runnerup_party;
            if (party) {
                counts[party] = (counts[party] || 0) + 1;
                total++;
            }
        });

        return Object.entries(counts)
            .map(([party, count]) => ({ party, count, percentage: (count / total) * 100 }))
            .sort((a, b) => b.count - a.count);
    }, [data, mode, config]);

    if (!config) return null;

    const containerClass = inline
        ? "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 animate-fadeIn"
        : "absolute bottom-4 left-4 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/40 p-4 z-[1000] min-w-[220px] max-w-[260px] animate-fadeIn";

    // For party-based modes (Winner/Runner-up), show dynamic stats
    if (config.type === 'parties') {
        // Show top 8 parties, group others
        const topParties = partyStats.slice(0, 8);
        const othersCount = partyStats.slice(8).reduce((sum, item) => sum + item.count, 0);

        return (
            <div className={containerClass}>
                <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-bold text-slate-700">{config.title}</h4>
                    <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {data?.features?.length || 0} Total
                    </span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {topParties.map((item, index) => (
                        <div key={item.party} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs font-medium text-slate-400 w-4">{index + 1}.</span>
                                <div
                                    className="w-3.5 h-3.5 rounded-md shadow-sm border border-black/5"
                                    style={{ backgroundColor: getPartyColor(item.party) }}
                                />
                                <span className="text-xs font-semibold text-slate-700 truncate max-w-[100px]" title={item.party}>
                                    {item.party}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-12 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.max(item.percentage, 5)}%`,
                                            backgroundColor: getPartyColor(item.party)
                                        }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-slate-600 w-6 text-right">{item.count}</span>
                            </div>
                        </div>
                    ))}

                    {othersCount > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-1">
                            <span className="text-xs font-semibold text-slate-500 pl-7">Others</span>
                            <span className="text-xs font-bold text-slate-500 pr-0.5">{othersCount}</span>
                        </div>
                    )}

                    {topParties.length === 0 && (
                        <div className="text-xs text-slate-400 text-center py-2">No data available</div>
                    )}
                </div>
            </div>
        );
    }

    // For gradient-based modes
    return (
        <div className={inline ? "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 animate-fadeIn" : "absolute bottom-4 left-4 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-white/30 p-3 z-[1000] animate-fadeIn"}>
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
