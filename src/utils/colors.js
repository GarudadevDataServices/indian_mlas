import partyColors from '../data/colors.json';

const DEFAULT_COLOR = '#808080'; // Grey
const LOST_DEPOSIT_COLOR = '#d1d5db'; // Light Grey

export const getPartyColor = (party) => {
    const color = partyColors[party];
    if (!color) return DEFAULT_COLOR;

    // Handle array format [r, g, b, a] where r,g,b are 0-1
    if (Array.isArray(color)) {
        const [r, g, b, a] = color;
        return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }

    return color;
};

export const getColorForMode = (feature, mode, selectedParty) => {
    const props = feature.properties;

    if (!props) return DEFAULT_COLOR;

    switch (mode) {
        case 'WINNER':
            return getPartyColor(props.winner_party);

        case 'RUNNER_UP':
            return getPartyColor(props.runnerup_party);

        case 'VOTE_SHARE':
            if (!selectedParty) return '#e5e7eb'; // Light grey if no party selected
            // Check if party participated
            if (!props.party_vote_shares || props.party_vote_shares[selectedParty] === undefined) {
                return '#ffffff';
            }
            const share = props.party_vote_shares[selectedParty];

            // Using the same palette as Victory Margin for intensity
            // Palette: [(137,0,0),(255,0,0),(255,255,0),(0,255,0),(6,77,25)]

            // Thresholds for Vote Share:
            // > 50%: Deep Green (Dominant)
            // 35-50%: Green (Strong)
            // 20-35%: Yellow (Competitive)
            // 10-20%: Red (Weak)
            // < 10%: Deep Red (Insignificant/Lost Deposit)

            if (share > 50) return 'rgb(6, 77, 25)';     // Deep Green
            if (share > 35) return 'rgb(0, 255, 0)';     // Green
            if (share > 20) return 'rgb(255, 255, 0)';   // Yellow
            if (share > 10) return 'rgb(255, 0, 0)';     // Red
            return 'rgb(137, 0, 0)';                     // Deep Red

        case 'MARGIN':
            // Percentage based margin
            // Color Palette: [(137,0,0),(255,0,0),(255,255,0),(0,255,0),(6,77,25)]
            // Deep Red (Close) -> Red -> Yellow -> Green -> Deep Green (Landslide)

            const margin = props.margin || 0;
            const total = props.total_votes || 1; // Avoid divide by zero
            const marginPct = (margin / total) * 100;

            // Thresholds: 
            // < 2%: Deep Red (Very Close contest)
            // 2-5%: Red (Close)
            // 5-10%: Yellow (Moderate)
            // 10-20%: Green (Comfortable)
            // > 20%: Deep Green (Landslide)

            if (marginPct > 20) return 'rgb(6, 77, 25)';     // Deep Green
            if (marginPct > 10) return 'rgb(0, 255, 0)';     // Green
            if (marginPct > 5) return 'rgb(255, 255, 0)';   // Yellow
            if (marginPct > 2) return 'rgb(255, 0, 0)';     // Red
            return 'rgb(137, 0, 0)';                         // Deep Red

        case 'TURNOUT':
            // Blue scale
            const turnout = props.turnout || 0;
            if (turnout > 85) return '#1e3a8a'; // Dark Blue
            if (turnout > 80) return '#1e40af';
            if (turnout > 75) return '#1d4ed8';
            if (turnout > 70) return '#2563eb';
            if (turnout > 60) return '#3b82f6';
            return '#93c5fd'; // Light Blue

        case 'DEMOGRAPHICS_GENDER':
            return props.winner_gender === 'MALE' ? '#3b82f6' : '#ec4899'; // Blue/Pink

        case 'DEMOGRAPHICS_CATEGORY':
            if (props.winner_category === 'SC') return '#7c3aed'; // Violet
            if (props.winner_category === 'ST') return '#059669'; // Green
            return '#f59e0b'; // Amber (General)

        case 'DEMOGRAPHICS_AGE':
            // Age-based coloring
            const age = props.winner_age || 0;
            if (age <= 35) return '#10b981'; // Emerald (Young)
            if (age <= 45) return '#14b8a6'; // Teal
            if (age <= 55) return '#f59e0b'; // Amber
            if (age <= 65) return '#f97316'; // Orange
            return '#ef4444'; // Red (Senior)

        default:
            return getPartyColor(props.winner_party);
    }
};

