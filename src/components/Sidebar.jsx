import React from 'react';
import BattleChart from './BattleChart';
import { getPartyColor } from '../utils/colors';
import classNames from 'classnames';

const Sidebar = ({ data, onClose }) => {
    if (!data) return null;

    const {
        ac_name, st_name, ac_no,
        winner_name, winner_party, winner_age, winner_gender, winner_category,
        margin, turnout, total_votes, postal_votes,
        top_candidates, wiki_link, year, is_bye_election
    } = data;

    return (
        <div className="fixed right-0 top-0 h-full w-full md:w-[420px] bg-gradient-to-b from-white via-white to-slate-50 shadow-2xl overflow-y-auto z-[1000] animate-slideIn">
            {/* Header */}
            <div className="sticky top-0 p-4 border-b bg-white/95 backdrop-blur-lg flex justify-between items-start z-10">
                <div className="pr-8">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                        {ac_name}
                        {is_bye_election && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-200 font-medium">
                                By-Election
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        <span className="font-medium text-slate-600">{st_name}</span>
                        <span className="mx-2">•</span>
                        AC {ac_no}
                        <span className="mx-2">•</span>
                        {year}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 flex-shrink-0"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-4 space-y-6">
                {/* Winner Profile */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white"
                            style={{ backgroundColor: getPartyColor(winner_party) }}
                        >
                            {winner_party.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-slate-800 truncate">{winner_name}</h3>
                            <p className="text-sm font-medium" style={{ color: getPartyColor(winner_party) }}>
                                {winner_party}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                <span className="px-2 py-0.5 bg-white rounded-full border text-xs text-slate-600 shadow-sm">
                                    {winner_gender === 'MALE' ? '👨' : '👩'} {winner_gender}
                                </span>
                                <span className="px-2 py-0.5 bg-white rounded-full border text-xs text-slate-600 shadow-sm">
                                    🎂 {winner_age} Yrs
                                </span>
                                <span className="px-2 py-0.5 bg-white rounded-full border text-xs text-slate-600 shadow-sm">
                                    📋 {winner_category}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Battle Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Vote Share</h4>
                    <BattleChart candidates={top_candidates} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <StatBox label="Victory Margin" value={margin.toLocaleString()} icon="🏆" highlight />
                    <StatBox label="Turnout" value={`${turnout}%`} icon="📊" />
                    <StatBox label="Total Votes" value={total_votes.toLocaleString()} icon="🗳️" />
                    <StatBox label="Postal Votes" value={postal_votes.toLocaleString()} icon="📬" />
                </div>

                {/* Candidate Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider p-4 pb-2">Top Candidates</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 bg-slate-50 uppercase">
                                <tr>
                                    <th className="px-4 py-2.5">Name</th>
                                    <th className="px-4 py-2.5">Party</th>
                                    <th className="px-4 py-2.5 text-right">Votes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top_candidates.map((c, i) => (
                                    <tr key={i} className={classNames("border-t border-slate-100 hover:bg-slate-50 transition-colors", { "bg-slate-50/50 text-slate-400": c.lost_deposit })}>
                                        <td className="px-4 py-2.5 font-medium">{c.name}</td>
                                        <td className="px-4 py-2.5">
                                            <span className="px-2 py-1 rounded-full text-xs text-white font-medium" style={{ backgroundColor: getPartyColor(c.party) }}>
                                                {c.party}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-right font-mono text-slate-600">{c.votes.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-slate-400 px-4 py-2 bg-slate-50 border-t italic">* Grey rows indicate lost deposit</p>
                </div>

                {/* External Link */}
                {wiki_link && (
                    <a
                        href={`https://en.wikipedia.org/wiki${wiki_link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.09 13.119c-.936 1.932-2.217 4.548-2.853 5.728-.616 1.074-1.127.931-1.532.029-1.406-3.321-4.293-9.144-5.651-12.409-.251-.601-.441-.987-.619-1.139-.181-.15-.554-.24-1.122-.271C.103 5.033 0 4.982 0 4.898v-.455l.052-.045c.924-.005 5.401 0 5.401 0l.051.045v.434c0 .119-.075.176-.225.176l-.564.031c-.485.029-.727.164-.727.436 0 .135.053.33.166.601 1.082 2.646 4.818 10.521 4.818 10.521l.136.046 2.411-4.81-.482-1.067-1.658-3.264s-.318-.654-.428-.872c-.728-1.443-.712-1.518-1.447-1.617-.207-.023-.313-.05-.313-.149v-.468l.06-.045h4.292l.113.037v.451c0 .105-.076.15-.227.15l-.308.047c-.792.061-.661.381-.136 1.422l1.582 3.252 1.758-3.504c.293-.64.233-.801.111-.947-.07-.084-.305-.22-.812-.24l-.201-.021c-.052 0-.098-.015-.145-.051-.045-.031-.067-.076-.067-.129v-.427l.061-.045c1.247-.008 4.043 0 4.043 0l.059.045v.436c0 .121-.059.178-.193.178-.646.03-.782.095-1.023.439-.12.186-.375.589-.646 1.039l-2.301 4.273-.065.135 2.792 5.712.17.048 4.396-10.438c.154-.422.129-.722-.064-.895-.197-.172-.346-.273-.857-.295l-.42-.016c-.061 0-.105-.014-.152-.045-.043-.029-.072-.075-.072-.119v-.436l.059-.045h4.961l.041.045v.437c0 .119-.074.18-.209.18-.648.03-1.127.18-1.443.421-.314.255-.557.616-.736 1.067 0 0-4.043 9.258-5.426 12.339-.525 1.007-1.053.917-1.503-.031-.571-1.171-1.773-3.786-2.646-5.71l.053-.036z" />
                        </svg>
                        View on Wikipedia
                    </a>
                )}
            </div>
        </div>
    );
};

const StatBox = ({ label, value, icon, highlight }) => (
    <div className={classNames(
        "p-3 rounded-xl border shadow-sm transition-all hover:shadow-md",
        highlight ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200" : "bg-white border-slate-200"
    )}>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase">
            <span>{icon}</span>
            <span>{label}</span>
        </div>
        <div className={classNames("font-bold text-lg mt-1", highlight ? "text-emerald-700" : "text-slate-800")}>
            {value}
        </div>
    </div>
);

export default Sidebar;
