import React, { useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import './TrailFinder.css';

const MapControls = ({ 
  onBaseLayerChange, 
  onElevationToggle, 
  onFindSteepPoints, 
  isLoading,
  showElevation 
}) => {
  const map = useMap();
  const [steepPointCount, setSteepPointCount] = useState(5);
  
  // Handle base layer selection
  const handleBaseLayerSelect = (e) => {
    const layer = e.target.value;
    onBaseLayerChange(layer);
  };
  
  // Handle elevation layer toggle
  const handleElevationToggle = () => {
    onElevationToggle(!showElevation);
  };
  
  // Handle find steep points button click
  const handleFindClick = () => {
    onFindSteepPoints(steepPointCount);
  };
  
  return (
    <div className="map-controls">
      <div className="map-controls-inner">
        <div className="control-section">
          <h3>Map Layers</h3>
          <div className="control-row">
            <label htmlFor="base-layer-select">Base Map:</label>
            <select 
              id="base-layer-select" 
              onChange={handleBaseLayerSelect} 
              className="control-select"
            >
              <option value="osm">OpenStreetMap</option>
              <option value="satellite">Satellite</option>
              <option value="terrain">Terrain</option>
            </select>
          </div>
          
          <div className="control-row">
            <label htmlFor="elevation-toggle" className="checkbox-label">
              <input
                id="elevation-toggle"
                type="checkbox"
                checked={showElevation}
                onChange={handleElevationToggle}
                className="control-checkbox"
              />
              Show Elevation
            </label>
          </div>
        </div>
        
        <div className="control-section">
          <h3>Steep Points</h3>
          <div className="control-row">
            <label htmlFor="steep-count">Number of points:</label>
            <input
              id="steep-count"
              type="number"
              min="1"
              max="20"
              value={steepPointCount}
              onChange={(e) => setSteepPointCount(parseInt(e.target.value) || 5)}
              className="control-input"
            />
          </div>
          
          <button 
            onClick={handleFindClick}
            disabled={isLoading}
            className="find-btn"
          >
            {isLoading ? 'Searching...' : 'Find Steep Points'}
          </button>
        </div>
        
        <div className="control-section">
          <div className="control-info">
            <p>Current zoom: {map.getZoom()}</p>
            <p>Showing Perth region 4x4 trails</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create a Leaflet control for our React component
const createControlComponent = (Component, props = {}) => {
  // This factory creates a component that will mount our React component as a Leaflet control
  return function WrappedControl(componentProps) {
    const map = useMap();
    
    L.Control.MapControlsControl = L.Control.extend({
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-custom-control');
        
        // Prevent click events from propagating to the map
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);
        
        return container;
      }
    });
    
    React.useEffect(() => {
      const control = new L.Control.MapControlsControl({ position: 'topright' });
      control.addTo(map);
      
      return () => {
        control.remove();
      };
    }, [map]);
    
    return <Component {...props} {...componentProps} />;
  };
};

export default createControlComponent(MapControls);