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
        title: 'Party Hold Percentages',
        type: 'voteShareStats',
        ranges: [
            { color: 'rgb(6, 77, 25)', min: 50, max: 100, label: '> 50%' },
            { color: 'rgb(0, 255, 0)', min: 35, max: 50, label: '35-50%' },
            { color: 'rgb(255, 255, 0)', min: 20, max: 35, label: '20-35%' },
            { color: 'rgb(255, 0, 0)', min: 10, max: 20, label: '10-20%' },
            { color: 'rgb(137, 0, 0)', min: 0, max: 10, label: '< 10%' },
        ]
    },
    MARGIN: {
        title: 'Victory Margin',
        type: 'statsWithCount',
        countField: 'marginPct',
        ranges: [
            { color: 'rgb(6, 77, 25)', min: 20, max: 100, label: '> 20% (Landslide)' },
            { color: 'rgb(0, 255, 0)', min: 10, max: 20, label: '10-20%' },
            { color: 'rgb(255, 255, 0)', min: 5, max: 10, label: '5-10%' },
            { color: 'rgb(255, 0, 0)', min: 2, max: 5, label: '2-5%' },
            { color: 'rgb(137, 0, 0)', min: 0, max: 2, label: '< 2% (Close)' },
        ]
    },
    TURNOUT: {
        title: 'Voter Turnout',
        type: 'statsWithCount',
        countField: 'turnout',
        ranges: [
            { color: '#1e3a8a', min: 85, max: 100, label: '> 85%' },
            { color: '#1e40af', min: 80, max: 85, label: '80-85%' },
            { color: '#1d4ed8', min: 75, max: 80, label: '75-80%' },
            { color: '#2563eb', min: 70, max: 75, label: '70-75%' },
            { color: '#3b82f6', min: 60, max: 70, label: '60-70%' },
            { color: '#93c5fd', min: 0, max: 60, label: '< 60%' },
        ]
    },
    DEMOGRAPHICS_GENDER: {
        title: 'Winner Gender',
        type: 'statsWithCount',
        countField: 'winner_gender',
        items: [
            { color: '#3b82f6', value: 'MALE', label: 'Male' },
            { color: '#ec4899', value: 'FEMALE', label: 'Female' },
        ]
    },
    DEMOGRAPHICS_CATEGORY: {
        title: 'Winner Category',
        type: 'statsWithCount',
        countField: 'winner_category',
        items: [
            { color: '#7c3aed', value: 'SC', label: 'SC' },
            { color: '#059669', value: 'ST', label: 'ST' },
            { color: '#f59e0b', value: 'GEN', label: 'General' },
        ]
    },
    DEMOGRAPHICS_AGE: {
        title: 'Winner Age',
        type: 'statsWithCount',
        countField: 'winner_age',
        ranges: [
            { color: '#10b981', min: 0, max: 35, label: '21-35 (Young)' },
            { color: '#14b8a6', min: 35, max: 45, label: '36-45' },
            { color: '#f59e0b', min: 45, max: 55, label: '46-55' },
            { color: '#f97316', min: 55, max: 65, label: '56-65' },
            { color: '#ef4444', min: 65, max: 150, label: '65+ (Senior)' },
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

    // Calculate vote share statistics for selected party
    const voteShareStats = useMemo(() => {
        if (!data || !config || config.type !== 'voteShareStats' || !selectedParty) return null;

        const ranges = config.ranges;
        const stats = ranges.map(range => ({
            ...range,
            contested: 0,
            winning: 0
        }));

        let totalContested = 0;
        let totalWinning = 0;

        data.features.forEach(f => {
            const p = f.properties;
            const voteShare = p.party_vote_shares?.[selectedParty];

            if (voteShare !== undefined) {
                totalContested++;
                const isWinner = p.winner_party === selectedParty;
                if (isWinner) totalWinning++;

                // Find which range this belongs to
                for (const stat of stats) {
                    if (voteShare > stat.min && voteShare <= stat.max) {
                        stat.contested++;
                        if (isWinner) stat.winning++;
                        break;
                    }
                    // Handle edge case for exactly 0%
                    if (stat.min === 0 && voteShare === 0) {
                        stat.contested++;
                        if (isWinner) stat.winning++;
                        break;
                    }
                }
            }
        });

        return { stats, totalContested, totalWinning };
    }, [data, config, selectedParty]);

    // Calculate general stats for statsWithCount modes
    const generalStats = useMemo(() => {
        if (!data || !config || config.type !== 'statsWithCount') return null;

        const countField = config.countField;
        const isRangeBased = !!config.ranges;
        const items = config.ranges || config.items;

        const stats = items.map(item => ({
            ...item,
            count: 0
        }));

        let total = 0;

        data.features.forEach(f => {
            const p = f.properties;
            total++;

            if (isRangeBased) {
                // Handle numeric range-based fields (MARGIN, TURNOUT)
                let value;
                if (countField === 'marginPct') {
                    const margin = p.margin || 0;
                    const totalVotes = p.total_votes || 1;
                    value = (margin / totalVotes) * 100;
                } else {
                    value = p[countField] || 0;
                }

                for (const stat of stats) {
                    if (value > stat.min && value <= stat.max) {
                        stat.count++;
                        break;
                    }
                    // Handle edge case for the lowest range
                    if (stat.min === 0 && value === 0) {
                        stat.count++;
                        break;
                    }
                }
            } else {
                // Handle categorical fields (GENDER, CATEGORY)
                const value = p[countField];
                for (const stat of stats) {
                    if (value === stat.value) {
                        stat.count++;
                        break;
                    }
                }
            }
        });

        return { stats, total };
    }, [data, config]);

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

    // For vote share stats mode - table with contested/winning seats
    if (config.type === 'voteShareStats') {
        if (!selectedParty) {
            return (
                <div className={containerClass}>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">{config.title}</h4>
                    <p className="text-xs text-slate-500">Select a party to view statistics</p>
                </div>
            );
        }

        if (!voteShareStats) {
            return (
                <div className={containerClass}>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">{config.title}</h4>
                    <p className="text-xs text-slate-500">Loading statistics...</p>
                </div>
            );
        }

        const { stats, totalContested, totalWinning } = voteShareStats;

        return (
            <div className={containerClass}>
                <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-bold text-slate-700">{config.title}</h4>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {selectedParty}
                    </span>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-[24px_1fr_50px_60px] gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 pb-1 border-b border-slate-200">
                    <span></span>
                    <span>Range</span>
                    <span className="text-center">Seats</span>
                    <span className="text-center">Wins</span>
                </div>

                {/* Table Rows */}
                <div className="space-y-1.5">
                    {stats.map((row, idx) => {
                        const winPct = row.contested > 0 ? ((row.winning / row.contested) * 100).toFixed(1) : '0.0';
                        return (
                            <div key={idx} className="grid grid-cols-[24px_1fr_50px_60px] gap-1 items-center text-xs">
                                <div
                                    className="w-4 h-4 rounded border border-black/10"
                                    style={{ backgroundColor: row.color }}
                                />
                                <span className="text-slate-600 font-medium">{row.label}</span>
                                <span className="text-center font-semibold text-slate-700">{row.contested}</span>
                                <span className="text-center font-semibold text-slate-700">
                                    {row.winning} <span className="text-slate-400 text-[10px]">({winPct}%)</span>
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Total Row */}
                <div className="grid grid-cols-[24px_1fr_50px_60px] gap-1 items-center text-xs mt-2 pt-2 border-t border-slate-300 font-bold">
                    <span></span>
                    <span className="text-slate-700">Total</span>
                    <span className="text-center text-slate-800">{totalContested}</span>
                    <span className="text-center text-slate-800">
                        {totalWinning} <span className="text-slate-500 text-[10px]">({totalContested > 0 ? ((totalWinning / totalContested) * 100).toFixed(1) : '0.0'}%)</span>
                    </span>
                </div>
            </div>
        );
    }

    // For stats with count modes (MARGIN, TURNOUT, GENDER, CATEGORY)
    if (config.type === 'statsWithCount' && generalStats) {
        const { stats, total } = generalStats;

        return (
            <div className={containerClass}>
                <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-bold text-slate-700">{config.title}</h4>
                    <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {total} Total
                    </span>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-[24px_1fr_50px_50px] gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 pb-1 border-b border-slate-200">
                    <span></span>
                    <span>Category</span>
                    <span className="text-center">Count</span>
                    <span className="text-center">%</span>
                </div>

                {/* Table Rows */}
                <div className="space-y-1.5">
                    {stats.map((row, idx) => {
                        const pct = total > 0 ? ((row.count / total) * 100).toFixed(1) : '0.0';
                        return (
                            <div key={idx} className="grid grid-cols-[24px_1fr_50px_50px] gap-1 items-center text-xs">
                                <div
                                    className="w-4 h-4 rounded border border-black/10"
                                    style={{ backgroundColor: row.color }}
                                />
                                <span className="text-slate-600 font-medium truncate" title={row.label}>{row.label}</span>
                                <span className="text-center font-semibold text-slate-700">{row.count}</span>
                                <span className="text-center font-semibold text-slate-500">{pct}%</span>
                            </div>
                        );
                    })}
                </div>

                {/* Total Row */}
                <div className="grid grid-cols-[24px_1fr_50px_50px] gap-1 items-center text-xs mt-2 pt-2 border-t border-slate-300 font-bold">
                    <span></span>
                    <span className="text-slate-700">Total</span>
                    <span className="text-center text-slate-800">{total}</span>
                    <span className="text-center text-slate-600">100%</span>
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
