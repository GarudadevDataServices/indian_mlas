import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MapComponent from './components/MapContainer';
import Sidebar from './components/Sidebar';
import Controls, { FILTER_CONFIGS } from './components/Controls';
import Legend from './components/Legend';
import LoadingScreen from './components/LoadingScreen';
import searchIndex from './data/search_index.json';
import stateBounds from './data/state_bounds.json';

// Helper to parse URL parameters on load
const parseArrayParam = (value) => {
  if (!value) return [];
  return value.split(',').filter(v => v);
};

const getInitialStateFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    mode: params.get('mode') || 'WINNER',
    party: params.get('party') || 'BJP',
    state: params.get('state') || '',
    filters: {
      age: parseArrayParam(params.get('f_age')),
      gender: parseArrayParam(params.get('f_gender')),
      category: parseArrayParam(params.get('f_category')),
      margin: parseArrayParam(params.get('f_margin')),
      turnout: parseArrayParam(params.get('f_turnout')),
      party: parseArrayParam(params.get('f_party')),
    }
  };
};

// Helper function to check if a feature passes all filters (multi-select with OR logic within each filter)
const featurePassesFilters = (feature, filters) => {
  const { age, gender, category, margin, turnout, party } = filters;
  const p = feature.properties;

  // Age filter (OR logic: passes if ANY selected age range matches)
  if (age && age.length > 0) {
    const winnerAge = p.winner_age || 0;
    const matchesAny = age.some(ageValue => {
      const ageRange = FILTER_CONFIGS.AGE_RANGES.find(r => r.value === ageValue);
      if (ageRange) {
        return winnerAge >= ageRange.min && winnerAge <= ageRange.max;
      }
      return false;
    });
    if (!matchesAny) return false;
  }

  // Gender filter (OR logic)
  if (gender && gender.length > 0) {
    if (!gender.includes(p.winner_gender)) return false;
  }

  // Category filter (OR logic)
  if (category && category.length > 0) {
    if (!category.includes(p.winner_category)) return false;
  }

  // Margin filter (OR logic: passes if margin falls within ANY selected range)
  if (margin && margin.length > 0) {
    const m = p.margin || 0;
    const total = p.total_votes || 1;
    const marginPct = (m / total) * 100;
    const matchesAny = margin.some(marginValue => {
      const marginRange = FILTER_CONFIGS.MARGIN_RANGES.find(r => r.value === marginValue);
      if (marginRange) {
        return marginPct >= marginRange.min && marginPct < marginRange.max;
      }
      return false;
    });
    if (!matchesAny) return false;
  }

  // Turnout filter (OR logic: passes if turnout falls within ANY selected range)
  if (turnout && turnout.length > 0) {
    const t = p.turnout || 0;
    const matchesAny = turnout.some(turnoutValue => {
      const turnoutRange = FILTER_CONFIGS.TURNOUT_RANGES.find(r => r.value === turnoutValue);
      if (turnoutRange) {
        return t >= turnoutRange.min && t < turnoutRange.max;
      }
      return false;
    });
    if (!matchesAny) return false;
  }

  // Party filter (OR logic)
  if (party && party.length > 0) {
    if (!party.includes(p.winner_party)) return false;
  }

  return true;
};

// Get initial state from URL
const initialState = getInitialStateFromURL();

function App() {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState(initialState.mode);
  const [selectedParty, setSelectedParty] = useState(initialState.party);
  const [selectedAcId, setSelectedAcId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFeatureData, setSelectedFeatureData] = useState(null);
  const [selectedState, setSelectedState] = useState(initialState.state);

  // Advanced filters state
  const [filters, setFilters] = useState(initialState.filters);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (mapMode !== 'WINNER') params.set('mode', mapMode);
    if (selectedParty !== 'BJP') params.set('party', selectedParty);
    if (selectedState) params.set('state', selectedState);

    // Add active filters (serialize arrays as comma-separated)
    if (filters.age?.length) params.set('f_age', filters.age.join(','));
    if (filters.gender?.length) params.set('f_gender', filters.gender.join(','));
    if (filters.category?.length) params.set('f_category', filters.category.join(','));
    if (filters.margin?.length) params.set('f_margin', filters.margin.join(','));
    if (filters.turnout?.length) params.set('f_turnout', filters.turnout.join(','));
    if (filters.party?.length) params.set('f_party', filters.party.join(','));

    // Update URL without page reload
    const newURL = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newURL);
  }, [mapMode, selectedParty, selectedState, filters]);

  // Function to copy shareable link
  const handleCopyShareLink = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      // Could add a toast notification here
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
  }, []);

  // Lazy load map data
  useEffect(() => {
    import('./data/map_data.json').then(data => {
      setMapData(data.default);
      setLoading(false);
    });
  }, []);

  // Check if any advanced filter is active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : (v && v !== ''));
  }, [filters]);

  // Filter Data based on State only - advanced filters are applied via styling
  const stateFilteredMapData = useMemo(() => {
    if (!mapData) return null;

    let features = mapData.features;

    // Filter by state (this actually removes features - state zoom behavior)
    if (selectedState) {
      features = features.filter(f => f.properties.st_name === selectedState);
    }

    return {
      ...mapData,
      features
    };
  }, [selectedState, mapData]);

  // Data for the legend - only includes features that pass advanced filters
  const legendData = useMemo(() => {
    if (!stateFilteredMapData) return null;
    if (!hasActiveFilters) return stateFilteredMapData;

    return {
      ...stateFilteredMapData,
      features: stateFilteredMapData.features.filter(f => featurePassesFilters(f, filters))
    };
  }, [stateFilteredMapData, filters, hasActiveFilters]);

  // Get Bounds for State
  const mapBounds = useMemo(() => {
    if (selectedState && stateBounds[selectedState]) {
      return stateBounds[selectedState];
    }
    return null; // Default view
  }, [selectedState]);

  // Handle Constituency Selection
  const handleSelectConstituency = (properties) => {
    setSelectedAcId(properties.ac_id);
    setSelectedFeatureData(properties);
    setSidebarOpen(true);
  };

  // Handle Search
  const handleSearch = (acId) => {
    if (!mapData) return;
    const feature = mapData.features.find(f => f.properties.ac_id === acId);
    if (feature) {
      handleSelectConstituency(feature.properties);
      // If state filter is active and different, switch to this AC's state
      if (selectedState && feature.properties.st_name !== selectedState) {
        setSelectedState(feature.properties.st_name);
      }
    }
  };

  // Handle State Change
  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    setSidebarOpen(false);
    setSelectedAcId(null); // Reset selection
  };

  // Handle Reset View
  const handleResetView = () => {
    setSelectedState('');
    setSelectedAcId(null);
    setSidebarOpen(false);
  };

  // Show loading screen while data loads
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden font-sans text-slate-900">
      <MapComponent
        data={stateFilteredMapData}
        bounds={mapBounds}
        mode={mapMode}
        selectedParty={selectedParty}
        onSelectConstituency={handleSelectConstituency}
        selectedAcId={selectedAcId}
        onResetView={handleResetView}
        filters={filters}
      />

      <Controls
        currentMode={mapMode}
        onModeChange={setMapMode}
        selectedParty={selectedParty}
        onPartyChange={setSelectedParty}
        onSearch={handleSearch}
        onStateChange={handleStateChange}
        selectedState={selectedState}
        filters={filters}
        onFiltersChange={setFilters}
        data={legendData}
        onCopyShareLink={handleCopyShareLink}
      />

      {sidebarOpen && (
        <Sidebar
          data={selectedFeatureData}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export { featurePassesFilters };
export default App;
