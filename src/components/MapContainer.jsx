import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, LayersControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getColorForMode, getPartyColor } from '../utils/colors';

const MapComponent = ({ data, bounds, mode, selectedParty, onSelectConstituency, selectedAcId, onResetView }) => {
    // Store references to layers by AC ID for efficient updates
    const layersRef = useRef({});
    const prevSelectedAcIdRef = useRef(null);

    // Use refs to access latest props in event handlers
    const propsRef = useRef({ mode, selectedParty, selectedAcId });

    useEffect(() => {
        propsRef.current = { mode, selectedParty, selectedAcId };
    }, [mode, selectedParty, selectedAcId]);

    // Handle selection changes efficiently
    useEffect(() => {
        const prevAcId = prevSelectedAcIdRef.current;
        const newAcId = selectedAcId;

        // Reset previous selection
        if (prevAcId && layersRef.current[prevAcId]) {
            const layer = layersRef.current[prevAcId];
            layer.setStyle(style(layer.feature));
        }

        // Highlight new selection
        if (newAcId && layersRef.current[newAcId]) {
            const layer = layersRef.current[newAcId];
            layer.setStyle({
                weight: 3,
                opacity: 1,
                color: '#ef4444',
                fillOpacity: 0.85
            });
            layer.bringToFront();
        }

        prevSelectedAcIdRef.current = newAcId;
    }, [selectedAcId, mode, selectedParty]);

    const style = (feature) => {
        const fillColor = getColorForMode(feature, mode, selectedParty);

        // For VOTE_SHARE mode, apply special border styling
        if (mode === 'VOTE_SHARE') {
            const isNoParticipation = fillColor === '#ffffff';
            return {
                fillColor: fillColor,
                weight: isNoParticipation ? 0.5 : 1,
                opacity: isNoParticipation ? 0.5 : 0.8,
                color: isNoParticipation ? '#d1d5db' : '#374151',
                fillOpacity: 0.75
            };
        }

        if (mode === 'MARGIN' || mode === 'TURNOUT'
            || mode === 'DEMOGRAPHICS_GENDER' || mode === 'DEMOGRAPHICS_CATEGORY') {
            const isNoParticipation = fillColor === '#ffffff';
            return {
                fillColor: fillColor,
                weight: isNoParticipation ? 0.5 : 0.8,
                opacity: isNoParticipation ? 0.5 : 0.6,
                color: isNoParticipation ? '#d1d5db' : '#374151',
                fillOpacity: 0.75
            };
        }

        // Default styling for other modes (WINNER, RUNNER_UP, etc.)
        return {
            fillColor: fillColor,
            weight: 0.4,
            opacity: 0.8,
            color: '#374151',
            fillOpacity: 0.75
        };
    };

    const onEachFeature = (feature, layer) => {
        // Store layer reference
        if (feature.properties && feature.properties.ac_id) {
            layersRef.current[feature.properties.ac_id] = layer;
        }

        const props = feature.properties;

        // Create tooltip content
        const tooltipContent = `
            <div style="font-family: system-ui; min-width: 180px;">
                <div style="font-weight: 600; font-size: 13px; color: #1e293b; margin-bottom: 4px;">
                    ${props.ac_name || 'Unknown'}
                </div>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
                    ${props.st_name || ''} • AC ${props.ac_no || ''}
                </div>
                <div style="display: flex; align-items: center; gap: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
                    <span style="width: 12px; height: 12px; border-radius: 2px; background: ${getPartyColor(props.winner_party)}"></span>
                    <span style="font-size: 12px; font-weight: 500; color: #334155;">${props.winner_party || 'N/A'}</span>
                    <span style="margin-left: auto; font-size: 11px; color: #64748b;">Margin: ${(props.margin || 0).toLocaleString()}</span>
                </div>
            </div>
        `;

        layer.bindTooltip(tooltipContent, {
            sticky: true,
            className: 'custom-tooltip',
            direction: 'auto',
            opacity: 0.95
        });

        layer.on({
            click: () => {
                onSelectConstituency(feature.properties);
            },
            mouseover: (e) => {
                const { selectedAcId } = propsRef.current;
                if (selectedAcId && feature.properties.ac_id === selectedAcId) return;

                const layer = e.target;
                layer.setStyle({
                    weight: 2.5,
                    color: '#1e40af',
                    fillOpacity: 0.9
                });
                layer.bringToFront();
            },
            mouseout: (e) => {
                const { selectedAcId } = propsRef.current;
                if (selectedAcId && feature.properties.ac_id === selectedAcId) return;

                const layer = e.target;
                layer.setStyle(style(feature));
            }
        });
    };

    return (
        <MapContainer
            center={[22.5937, 78.9629]}
            zoom={5}
            minZoom={4}
            maxZoom={18}
            style={{ height: '100%', width: '100%', background: '#f1f5f9' }}
            zoomControl={false}
            preferCanvas={true}
        >
            {/* Zoom Controls - Bottom Right */}
            <ZoomControl position="bottomright" />

            {/* Custom Map Controls */}
            <MapControls onResetView={onResetView} />

            <LayersControl position="topright">
                {/* Mapbox Tile Layers */}
                {[
                    { name: 'Outdoors', style: 'outdoors-v11' },
                    { name: 'Satellite', style: 'satellite-v9' },
                    { name: 'Satellite + Labels', style: 'satellite-streets-v11' },
                    { name: 'Streets', style: 'streets-v11' },
                    { name: 'Light', style: 'light-v10' },
                    { name: 'Dark', style: 'dark-v10' },
                ].map(layer => (
                    <LayersControl.BaseLayer key={layer.name} name={layer.name}>
                        <TileLayer
                            url={`https://api.mapbox.com/styles/v1/mapbox/${layer.style}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGF0dGEwNyIsImEiOiJja3A2dHRrajEyN3JwMnZtd2ZtZTZnYzB4In0.i89VhIgx3UVvpTffewpr4Q`}
                            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
                            tileSize={512}
                            zoomOffset={-1}
                        />
                    </LayersControl.BaseLayer>
                ))}
                {/* OpenStreetMap */}
                <LayersControl.BaseLayer name="OpenStreetMap">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                </LayersControl.BaseLayer>
                {/* No Base Layer */}
                <LayersControl.BaseLayer checked name="Plain">
                    <TileLayer url="" />
                </LayersControl.BaseLayer>
            </LayersControl>

            {data && (
                <GeoJSON
                    key={`${data.features.length}-${mode}-${selectedParty}`}
                    data={data}
                    style={style}
                    onEachFeature={onEachFeature}
                />
            )}

            <ChangeView selectedAcId={selectedAcId} data={data} bounds={bounds} />

            {/* Custom Tooltip Styles */}
            <style>{`
                .custom-tooltip {
                    background: white !important;
                    border: none !important;
                    border-radius: 8px !important;
                    padding: 10px 12px !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
                }
                .custom-tooltip::before {
                    display: none !important;
                }
                .leaflet-control-zoom {
                    border: none !important;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
                    border-radius: 8px !important;
                    overflow: hidden;
                }
                .leaflet-control-zoom a {
                    width: 32px !important;
                    height: 32px !important;
                    line-height: 32px !important;
                    color: #374151 !important;
                    font-size: 16px !important;
                }
                .leaflet-control-zoom a:hover {
                    background: #f1f5f9 !important;
                    color: #1e40af !important;
                }
                .leaflet-control-layers {
                    border: none !important;
                    border-radius: 8px !important;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
                }
                .leaflet-control-layers-toggle {
                    width: 36px !important;
                    height: 36px !important;
                    background-size: 20px 20px !important;
                }
            `}</style>
        </MapContainer>
    );
};

// Custom Map Controls Component
function MapControls({ onResetView }) {
    const map = useMap();

    const handleResetView = () => {
        map.setView([22.5937, 78.9629], 5, { animate: true, duration: 0.5 });
        if (onResetView) onResetView();
    };

    return (
        <div className="leaflet-bottom leaflet-left" style={{ marginBottom: '20px', marginLeft: '10px' }}>
            <div className="leaflet-control">
                <button
                    onClick={handleResetView}
                    className="bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 w-8 h-8 rounded-lg shadow-md flex items-center justify-center transition-all border-0 cursor-pointer"
                    title="Reset to All India View"
                    style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// Helper to zoom to selected AC or Bounds
function ChangeView({ selectedAcId, data, bounds }) {
    const map = useMap();

    // Zoom to Bounds (State Filter)
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [20, 20], animate: true, duration: 0.5 });
        }
    }, [bounds, map]);

    // Zoom to Selected AC
    useEffect(() => {
        if (selectedAcId && data) {
            const feature = data.features.find(f => f.properties.ac_id === selectedAcId);
            if (feature) {
                import('leaflet').then(L => {
                    const layer = L.geoJSON(feature);
                    map.fitBounds(layer.getBounds(), { padding: [50, 50], animate: true, duration: 0.3 });
                });
            }
        }
    }, [selectedAcId, data, map]);

    return null;
}

export default MapComponent;
