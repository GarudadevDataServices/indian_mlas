import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';

const RAW_DATA_DIR = path.resolve('raw_data');
const DATA_DIR = path.resolve('src/data');

// Ensure output directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load Data
console.log('Loading data...');
const workbook = XLSX.readFile(path.join(RAW_DATA_DIR, 'india_asm.xlsx'));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet);

const geoJsonPath = path.join(RAW_DATA_DIR, 'india_asm.geojson');
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));

const colorsPath = path.join(RAW_DATA_DIR, 'colors.json');
const colors = JSON.parse(fs.readFileSync(colorsPath, 'utf-8'));

console.log(`Loaded ${rawData.length} rows from Excel.`);
console.log(`Loaded ${geoJson.features.length} features from GeoJSON.`);

// Group by AC ID
const groupedData = _.groupBy(rawData, 'AC ID');

const acDataMap = {};
const searchIndex = [];

console.log('Processing constituencies...');

Object.keys(groupedData).forEach(acId => {
    const candidates = groupedData[acId];
    const first = candidates[0]; // For static AC info

    // Sort candidates by Total Votes (descending)
    const sortedCandidates = _.orderBy(candidates, ['TOTAL'], ['desc']);

    const winner = sortedCandidates[0];
    const runnerUp = sortedCandidates[1];

    const totalValidVotes = _.sumBy(candidates, 'TOTAL');
    const totalElectors = first['TOTAL ELECTORS'];
    const turnout = (totalValidVotes / totalElectors) * 100;

    const margin = winner.TOTAL - (runnerUp ? runnerUp.TOTAL : 0);

    // Vote Shares
    const partyVoteShares = {};
    candidates.forEach(c => {
        const share = (c.TOTAL / totalValidVotes) * 100;
        partyVoteShares[c.PARTY] = parseFloat(share.toFixed(2));
    });

    // Top 5 Candidates for Sidebar
    const top5 = sortedCandidates.slice(0, 5).map(c => ({
        name: c['CANDIDATE NAME'],
        party: c.PARTY,
        votes: c.TOTAL,
        share: ((c.TOTAL / totalValidVotes) * 100).toFixed(2),
        lost_deposit: c.TOTAL < (totalValidVotes / 6)
    }));

    acDataMap[acId] = {
        ac_name: first['AC NAME'],
        st_name: first['STATE/UT NAME'],
        ac_no: first['AC NO.'],
        winner_name: winner['CANDIDATE NAME'],
        winner_party: winner.PARTY,
        winner_age: winner.AGE,
        winner_gender: winner.GENDER,
        winner_category: winner.CATEGORY,
        runnerup_party: runnerUp ? runnerUp.PARTY : 'N/A',
        margin: margin,
        turnout: parseFloat(turnout.toFixed(2)),
        total_votes: totalValidVotes,
        total_electors: totalElectors,
        postal_votes: winner.POSTAL, // Just showing winner's postal? Or total? Requirement says "Postal Votes count" in stats grid. Usually total postal.
        // Let's calculate total postal for the AC
        total_postal: _.sumBy(candidates, 'POSTAL'),
        is_bye_election: first.BYELECTION,
        year: first.YEAR,
        party_vote_shares: partyVoteShares,
        top_candidates: top5,
        wiki_link: first['WIKIPEDIA LINK']
    };

    searchIndex.push({
        label: `${first['AC NAME']} (${first['STATE/UT NAME']})`,
        id: parseInt(acId),
        st_code: first['STATE CODE'] // Useful for filtering
    });
});

// Merge into GeoJSON
console.log('Merging data into GeoJSON...');
let matchedCount = 0;

geoJson.features.forEach(feature => {
    const acId = feature.properties.ac_id;
    const data = acDataMap[acId];

    if (data) {
        feature.properties = {
            ...feature.properties, // Keep existing properties (st_code, st_name, etc)
            ...data
        };
        matchedCount++;
    } else {
        // console.warn(`No data found for AC ID: ${acId}`);
    }
});

console.log(`Merged data for ${matchedCount} features.`);

// Calculate State Bounds
console.log('Calculating state bounds...');
const stateBounds = {};

geoJson.features.forEach(feature => {
    const stName = feature.properties.st_name;
    if (!stName) return;

    if (!stateBounds[stName]) {
        stateBounds[stName] = {
            minLat: 90, maxLat: -90,
            minLon: 180, maxLon: -180
        };
    }

    const bounds = stateBounds[stName];

    // Helper to traverse coordinates
    const traverse = (coords) => {
        if (typeof coords[0] === 'number') {
            const [lon, lat] = coords;
            if (lat < bounds.minLat) bounds.minLat = lat;
            if (lat > bounds.maxLat) bounds.maxLat = lat;
            if (lon < bounds.minLon) bounds.minLon = lon;
            if (lon > bounds.maxLon) bounds.maxLon = lon;
        } else {
            coords.forEach(traverse);
        }
    };

    traverse(feature.geometry.coordinates);
});

// Format for Leaflet: [[minLat, minLon], [maxLat, maxLon]] -> No, Leaflet bounds are [[lat1, lon1], [lat2, lon2]] (SouthWest, NorthEast)
// Actually Leaflet fitBounds takes [[lat1, lon1], [lat2, lon2]]
const formattedBounds = {};
Object.keys(stateBounds).forEach(st => {
    const b = stateBounds[st];
    formattedBounds[st] = [
        [b.minLat, b.minLon],
        [b.maxLat, b.maxLon]
    ];
});

// Write outputs
fs.writeFileSync(path.join(DATA_DIR, 'map_data.json'), JSON.stringify(geoJson));
fs.writeFileSync(path.join(DATA_DIR, 'search_index.json'), JSON.stringify(searchIndex));
fs.writeFileSync(path.join(DATA_DIR, 'state_bounds.json'), JSON.stringify(formattedBounds));

console.log('Data processing complete.');
