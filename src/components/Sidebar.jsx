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
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl overflow-y-auto z-[1000] transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        {ac_name}
                        {is_bye_election && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-200">
                                By-Election
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-slate-500">{st_name} • AC {ac_no} • {year}</p>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div className="p-4 space-y-6">
                {/* Winner Profile */}
                <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md" style={{ backgroundColor: getPartyColor(winner_party) }}>
                        {winner_party.substring(0, 2)}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{winner_name}</h3>
                        <p className="text-sm text-slate-600">{winner_party}</p>
                        <div className="flex space-x-2 mt-1 text-xs text-slate-500">
                            <span className="bg-white px-2 py-0.5 rounded border">{winner_gender}</span>
                            <span className="bg-white px-2 py-0.5 rounded border">{winner_age} Yrs</span>
                            <span className="bg-white px-2 py-0.5 rounded border">{winner_category}</span>
                        </div>
                    </div>
                </div>

                {/* Battle Chart */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Vote Share</h4>
                    <BattleChart candidates={top_candidates} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <StatBox label="Margin" value={margin.toLocaleString()} />
                    <StatBox label="Turnout" value={`${turnout}%`} />
                    <StatBox label="Total Votes" value={total_votes.toLocaleString()} />
                    <StatBox label="Postal Votes" value={postal_votes.toLocaleString()} />
                </div>

                {/* Candidate Table */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Top Candidates</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 bg-slate-50 uppercase">
                                <tr>
                                    <th className="px-2 py-2">Name</th>
                                    <th className="px-2 py-2">Party</th>
                                    <th className="px-2 py-2 text-right">Votes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top_candidates.map((c, i) => (
                                    <tr key={i} className={classNames("border-b", { "bg-slate-100 text-slate-400": c.lost_deposit })}>
                                        <td className="px-2 py-2 font-medium">{c.name}</td>
                                        <td className="px-2 py-2">
                                            <span className="px-1.5 py-0.5 rounded text-xs text-white" style={{ backgroundColor: getPartyColor(c.party) }}>
                                                {c.party}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2 text-right">{c.votes.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 italic">* Grey rows indicate lost deposit</p>
                </div>

                {/* External Link */}
                {wiki_link && (
                    <a
                        href={`https://en.wikipedia.org${wiki_link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-2 px-4 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        View on Wikipedia
                    </a>
                )}
            </div>
        </div>
    );
};

const StatBox = ({ label, value }) => (
    <div className="bg-slate-50 p-3 rounded border border-slate-100">
        <div className="text-xs text-slate-500 uppercase">{label}</div>
        <div className="font-bold text-slate-800">{value}</div>
    </div>
);

export default Sidebar;
