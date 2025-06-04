import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  LayersControl, 
  Marker, 
  Popup, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import MapControls from './MapControls';
import { 
  findSteepPoints, 
  fetchElevationData, 
  processElevationData 
} from './TrailFinderUtils';
import './TrailFinder.css';

// Fix Leaflet's default icon problem
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Create a custom icon for steep points
const steepPointIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon,
  iconUrl: icon,
  shadowUrl: iconShadow
});

// Perth, Western Australia coordinates
const PERTH_COORDINATES = [-31.9523, 115.8613];
const DEFAULT_ZOOM = 10;

// Component to handle map events and updates
const MapEventHandler = ({ onMoveEnd, onElevationDataLoad }) => {
  const map = useMap();
  
  useEffect(() => {
    // Load elevation data when map moves
    const handleMoveEnd = async () => {
      const bounds = map.getBounds();
      onMoveEnd(bounds);
      
      try {
        // Fetch elevation data for the current view
        const elevData = await fetchElevationData(bounds);
        const processedData = processElevationData(elevData);
        onElevationDataLoad(processedData);
      } catch (error) {
        console.error('Error loading elevation data:', error);
      }
    };
    
    map.on('moveend', handleMoveEnd);
    
    // Initial load
    handleMoveEnd();
    
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onMoveEnd, onElevationDataLoad]);
  
  return null;
};

// Elevation overlay component
const ElevationOverlay = ({ data, visible }) => {
  const map = useMap();
  const layerRef = useRef(null);
  
  useEffect(() => {
    if (!data || !visible) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }
    
    // Create elevation heatmap layer
    const heatmapLayer = L.heatLayer(
      data.map(point => [point.lat, point.lng, point.elevation / 10]), // Normalize elevation values
      { 
        radius: 15, 
        blur: 20, 
        maxZoom: 17,
        gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
      }
    );
    
    map.addLayer(heatmapLayer);
    layerRef.current = heatmapLayer;
    
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, data, visible]);
  
  return null;
};

const TrailFinder = () => {
  const [mapBounds, setMapBounds] = useState(null);
  const [activeBaseLayer, setActiveBaseLayer] = useState('osm');
  const [showElevation, setShowElevation] = useState(true);
  const [steepPoints, setSteepPoints] = useState([]);
  const [elevationData, setElevationData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoibHVrZWJyYXlwcm8iLCJhIjoiY2tqdzdseHkxMnIxYjJycWxveTVkaXl1MyJ9.NZWYsJLv4nUUqTgpOOETNA'; // Replace with your token
  
  // Handle map movement
  const handleMapMoveEnd = (bounds) => {
    setMapBounds(bounds);
  };
  
  // Handle elevation data loading
  const handleElevationDataLoad = (data) => {
    setElevationData(data);
  };
  
  // Find steep points based on current map and settings
  const handleFindSteepPoints = async (count) => {
    if (!mapBounds || !elevationData.length) {
      console.warn('Cannot find steep points: No map bounds or elevation data available');
      return;
    }
    
    setIsLoading(true);
    try {
      const points = await findSteepPoints(elevationData, count, mapBounds);
      setSteepPoints(points);
    } catch (error) {
      console.error('Error finding steep points:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle base layer change
  const handleBaseLayerChange = (layer) => {
    setActiveBaseLayer(layer);
  };
  
  // Handle elevation layer toggle
  const handleElevationToggle = (checked) => {
    setShowElevation(checked);
  };
  
  return (
    <div className="trail-finder-container">
      <MapContainer 
        center={PERTH_COORDINATES} 
        zoom={DEFAULT_ZOOM} 
        scrollWheelZoom={true}
        className="trail-finder-map"
      >
        {/* Base layers */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer 
            name="OpenStreetMap" 
            checked={activeBaseLayer === 'osm'}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer 
            name="Satellite" 
            checked={activeBaseLayer === 'satellite'}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
              url={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`}
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer 
            name="Terrain" 
            checked={activeBaseLayer === 'terrain'}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
              url={`https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`}
            />
          </LayersControl.BaseLayer>
          
          {/* Overlay for elevation data */}
          <LayersControl.Overlay 
            name="Elevation" 
            checked={showElevation}
          >
            <ElevationOverlay data={elevationData} visible={showElevation} />
          </LayersControl.Overlay>
        </LayersControl>
        
        {/* Steep points markers */}
        {steepPoints.map((point, index) => (
          <Marker
            key={`steep-point-${index}`}
            position={[point.lat, point.lng]}
            icon={steepPointIcon}
          >
            <Popup>
              <div className="steep-point-popup">
                <h3>Steep Point {index + 1}</h3>
                <p>Elevation: {Math.round(point.elevation)}m</p>
                <p>Gradient: {point.gradient.toFixed(1)}%</p>
                <p>Location: {point.lat.toFixed(5)}, {point.lng.toFixed(5)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Event handler for map interactions */}
        <MapEventHandler 
          onMoveEnd={handleMapMoveEnd} 
          onElevationDataLoad={handleElevationDataLoad} 
        />
        
        {/* Controls for layer toggles and finding steep points */}
        <MapControls 
          onBaseLayerChange={handleBaseLayerChange}
          onElevationToggle={handleElevationToggle}
          onFindSteepPoints={handleFindSteepPoints}
          isLoading={isLoading}
          showElevation={showElevation}
        />
      </MapContainer>
    </div>
  );
};

export default TrailFinder;