import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import mapData from '../data/map_data.json';
import { getColorForMode } from '../utils/colors';

const MapComponent = ({ data, bounds, mode, selectedParty, onSelectConstituency, selectedAcId }) => {
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
                weight: 2,
                opacity: 1,
                color: 'red',
                fillOpacity: 0.7
            });
            layer.bringToFront();
        }

        prevSelectedAcIdRef.current = newAcId;
    }, [selectedAcId, mode, selectedParty]);

    const style = (feature) => {
        // Base style (not selected)
        // Use props directly since GeoJSON recreates on mode/party change
        return {
            fillColor: getColorForMode(feature, mode, selectedParty),
            weight: 0.5,
            opacity: 0.6,
            color: 'black',
            fillOpacity: 0.7
        };
    };

    const onEachFeature = (feature, layer) => {
        // Store layer reference
        if (feature.properties && feature.properties.ac_id) {
            layersRef.current[feature.properties.ac_id] = layer;
        }

        layer.on({
            click: () => {
                onSelectConstituency(feature.properties);
            },
            mouseover: (e) => {
                const { selectedAcId } = propsRef.current;
                if (selectedAcId && feature.properties.ac_id === selectedAcId) return;

                const layer = e.target;
                layer.setStyle({
                    weight: 2,
                    color: '#666',
                    dashArray: '',
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
            style={{ height: '100%', width: '100%', background: 'rgb(248 250 252)' }}
            zoomControl={false}
        >
            <LayersControl position="topright">
                <LayersControl.BaseLayer name="Google-Maps">
                    <TileLayer
                        url="https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGF0dGEwNyIsImEiOiJja3A2dHRrajEyN3JwMnZtd2ZtZTZnYzB4In0.i89VhIgx3UVvpTffewpr4Q"
                        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
                        tileSize={512}
                        zoomOffset={-1}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite">
                    <TileLayer
                        url="https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGF0dGEwNyIsImEiOiJja3A2dHRrajEyN3JwMnZtd2ZtZTZnYzB4In0.i89VhIgx3UVvpTffewpr4Q"
                        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
                        tileSize={512}
                        zoomOffset={-1}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite-Label">
                    <TileLayer
                        url="https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGF0dGEwNyIsImEiOiJja3A2dHRrajEyN3JwMnZtd2ZtZTZnYzB4In0.i89VhIgx3UVvpTffewpr4Q"
                        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
                        tileSize={512}
                        zoomOffset={-1}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Streets">
                    <TileLayer
                        url="https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGF0dGEwNyIsImEiOiJja3A2dHRrajEyN3JwMnZtd2ZtZTZnYzB4In0.i89VhIgx3UVvpTffewpr4Q"
                        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
                        tileSize={512}
                        zoomOffset={-1}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Navigation-day">
                    <TileLayer
                        url="https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGF0dGEwNyIsImEiOiJja3A2dHRrajEyN3JwMnZtd2ZtZTZnYzB4In0.i89VhIgx3UVvpTffewpr4Q"
                        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
                        tileSize={512}
                        zoomOffset={-1}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Navigation-night">
                    <TileLayer
                        url="https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGF0dGEwNyIsImEiOiJja3A2dHRrajEyN3JwMnZtd2ZtZTZnYzB4In0.i89VhIgx3UVvpTffewpr4Q"
                        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
                        tileSize={512}
                        zoomOffset={-1}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Light">
                    <TileLayer
                        url="https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGF0dGEwNyIsImEiOiJja3A2dHRrajEyN3JwMnZtd2ZtZTZnYzB4In0.i89VhIgx3UVvpTffewpr4Q"
                        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
                        tileSize={512}
                        zoomOffset={-1}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Dark">
                    <TileLayer
                        url="https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGF0dGEwNyIsImEiOiJja3A2dHRrajEyN3JwMnZtd2ZtZTZnYzB4In0.i89VhIgx3UVvpTffewpr4Q"
                        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
                        tileSize={512}
                        zoomOffset={-1}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="OpenStreetMap">
                    <TileLayer
                        url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer checked name="None">
                    <TileLayer url="" />
                </LayersControl.BaseLayer>
            </LayersControl>
            {data && (
                <GeoJSON
                    key={`${data.features.length}-${mode}-${selectedParty}`} // Force re-render when data, mode, or party changes
                    data={data}
                    style={style}
                    onEachFeature={onEachFeature}
                />
            )}
            <ChangeView selectedAcId={selectedAcId} data={data} bounds={bounds} />
        </MapContainer>
    );
};

// Helper to zoom to selected AC or Bounds
function ChangeView({ selectedAcId, data, bounds }) {
    const map = useMap();

    // Zoom to Bounds (State Filter)
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds);
        }
    }, [bounds, map]);

    // Zoom to Selected AC
    useEffect(() => {
        if (selectedAcId && data) {
            const feature = data.features.find(f => f.properties.ac_id === selectedAcId);
            if (feature) {
                import('leaflet').then(L => {
                    const layer = L.geoJSON(feature);
                    map.fitBounds(layer.getBounds());
                });
            }
        }
    }, [selectedAcId, data, map]);
    return null;
}

export default MapComponent;
