import React, { useState, useEffect, useMemo } from 'react';
import MapComponent from './components/MapContainer';
import Sidebar from './components/Sidebar';
import Controls from './components/Controls';
import mapData from './data/map_data.json'; // Need to access data for sidebar
import searchIndex from './data/search_index.json';
import stateBounds from './data/state_bounds.json';

function App() {
  const [mapMode, setMapMode] = useState('WINNER');
  const [selectedParty, setSelectedParty] = useState('BJP'); // Default party
  const [selectedAcId, setSelectedAcId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFeatureData, setSelectedFeatureData] = useState(null);
  const [selectedState, setSelectedState] = useState('');

  // Filter Data based on State
  const filteredMapData = useMemo(() => {
    if (!selectedState) return mapData;
    return {
      ...mapData,
      features: mapData.features.filter(f => f.properties.st_name === selectedState)
    };
  }, [selectedState]);

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
    const feature = mapData.features.find(f => f.properties.ac_id === acId);
    if (feature) {
      handleSelectConstituency(feature.properties);
      // If state filter is active and different, maybe reset it? 
      // Or just let map zoom to it.
      // Ideally we should switch state filter to this AC's state if we want to show it.
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

  return (
    <div className="h-screen w-screen relative overflow-hidden font-sans text-slate-900">
      <MapComponent
        data={filteredMapData}
        bounds={mapBounds}
        mode={mapMode}
        selectedParty={selectedParty}
        onSelectConstituency={handleSelectConstituency}
        selectedAcId={selectedAcId}
      />

      <Controls
        currentMode={mapMode}
        onModeChange={setMapMode}
        selectedParty={selectedParty}
        onPartyChange={setSelectedParty}
        onSearch={handleSearch}
        onStateChange={handleStateChange}
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

export default App;
