/**
 * TrailFinderUtils.js - Utility functions for the TrailFinder component
 * 
 * This file contains helper functions for:
 * - Fetching and processing elevation data
 * - Finding steep points on the map
 * - Calculating gradient between points
 * - Handling API requests and caching
 */

/**
 * Fetch elevation data for a geographical area
 * @param {L.LatLngBounds} bounds - Leaflet bounds object
 * @returns {Promise<Object>} - Raw elevation data
 */
export const fetchElevationData = async (bounds) => {
    if (!bounds) {
      throw new Error('No bounds provided for elevation data fetch');
    }
    
    // In a real implementation, you would fetch from an actual API
    // For example, using Mapbox's Terrain-RGB tiles or open elevation data
    // This is a placeholder implementation that returns synthetic data
    
    // Check if we have cached data for these bounds
    const cachedData = checkElevationCache(bounds);
    if (cachedData) {
      console.log('Using cached elevation data');
      return cachedData;
    }
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate synthetic elevation data for the area
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();
    
    // Create a grid of elevation points
    const data = generateSyntheticElevationData(south, west, north, east);
    
    // Cache the data for future use
    cacheElevationData(bounds, data);
    
    return data;
  };
  
  /**
   * Generate synthetic elevation data for testing
   * In a real implementation, this would be replaced with actual API calls
   */
  const generateSyntheticElevationData = (south, west, north, east) => {
    const data = [];
    const resolution = 0.01; // Roughly 1km at the equator
    
    // Create a terrain-like pattern using sine waves
    for (let lat = south; lat <= north; lat += resolution) {
      for (let lng = west; lng <= east; lng += resolution) {
        // Base elevation around Perth (relatively flat with some hills)
        let elevation = 100; // Base elevation in meters
        
        // Add some terrain features using sine waves
        elevation += Math.sin(lat * 10) * Math.cos(lng * 15) * 100;
        elevation += Math.sin(lat * 20 + lng * 15) * 50;
        
        // Add some hills in specific areas
        const distanceToHill1 = Math.sqrt(
          Math.pow(lat - (-32.1), 2) + Math.pow(lng - 116.05, 2)
        );
        const distanceToHill2 = Math.sqrt(
          Math.pow(lat - (-31.85), 2) + Math.pow(lng - 116.2, 2)
        );
        
        if (distanceToHill1 < 0.2) {
          elevation += (0.2 - distanceToHill1) * 1000; // Make a steep hill
        }
        
        if (distanceToHill2 < 0.15) {
          elevation += (0.15 - distanceToHill2) * 1200; // Make another steep hill
        }
        
        // Ensure elevation is positive
        elevation = Math.max(0, elevation);
        
        data.push({
          lat,
          lng,
          elevation
        });
      }
    }
    
    return data;
  };
  
  /**
   * Simple in-memory cache for elevation data
   * In a real application, you might use localStorage or IndexedDB for persistence
   */
  const elevationCache = {};
  
  /**
   * Check if we have cached elevation data for the given bounds
   */
  const checkElevationCache = (bounds) => {
    // For simplicity, we'll use a string key based on the bounds coordinates
    // In a real app, you'd want a more sophisticated caching strategy
    const key = `${bounds.getSouth().toFixed(2)}_${bounds.getWest().toFixed(2)}_${bounds.getNorth().toFixed(2)}_${bounds.getEast().toFixed(2)}`;
    
    return elevationCache[key];
  };
  
  /**
   * Store elevation data in the cache
   */
  const cacheElevationData = (bounds, data) => {
    const key = `${bounds.getSouth().toFixed(2)}_${bounds.getWest().toFixed(2)}_${bounds.getNorth().toFixed(2)}_${bounds.getEast().toFixed(2)}`;
    
    elevationCache[key] = data;
    
    // In a real app, you might want to limit cache size or implement expiration
    // Here's a simple implementation to prevent memory issues
    const cacheKeys = Object.keys(elevationCache);
    if (cacheKeys.length > 10) {
      // Remove the oldest entry if we have more than 10 cached areas
      delete elevationCache[cacheKeys[0]];
    }
  };
  
  /**
   * Process raw elevation data into a format usable by the application
   * @param {Object} rawData - Raw elevation data
   * @returns {Array} - Processed elevation points
   */
  export const processElevationData = (rawData) => {
    // In a real implementation, this would transform API-specific data
    // For example, decoding Mapbox's RGB-encoded elevation tiles
    
    // For our synthetic data, we can just return it directly
    return rawData;
  };
  
  /**
   * Calculate the gradient (steepness) between two points
   * @param {number} elev1 - Elevation of point 1 (meters)
   * @param {number} elev2 - Elevation of point 2 (meters)
   * @param {number} distance - Horizontal distance between points (meters)
   * @returns {number} - Gradient as a percentage
   */
  export const calculateGradient = (elev1, elev2, distance) => {
    if (distance === 0) return 0;
    const elevDiff = Math.abs(elev2 - elev1);
    return (elevDiff / distance) * 100;
  };
  
  /**
   * Convert degrees to meters (approximate)
   * @param {number} lat - Latitude
   * @param {number} latDiff - Latitude difference in degrees
   * @param {number} lngDiff - Longitude difference in degrees
   * @returns {Object} - Distance in meters (north-south and east-west)
   */
  const degreesToMeters = (lat, latDiff, lngDiff) => {
    // 1 degree of latitude is approximately 111,000 meters
    const northSouth = latDiff * 111000;
    
    // 1 degree of longitude varies with latitude
    const eastWest = lngDiff * 111000 * Math.cos(lat * Math.PI / 180);
    
    return { northSouth, eastWest };
  };
  
  /**
   * Find the steepest points within the current map view
   * @param {Array} elevationData - Processed elevation data
   * @param {number} count - Number of steep points to find
   * @param {L.LatLngBounds} bounds - Map bounds to search within
   * @returns {Array} - Array of steep points with their coordinates and gradients
   */
  export const findSteepPoints = async (elevationData, count = 5, bounds) => {
    if (!elevationData || elevationData.length === 0) {
      throw new Error('No elevation data available');
    }
    
    if (!bounds) {
      throw new Error('No map bounds provided');
    }
    
    // Filter elevation data to the current bounds
    const pointsInBounds = elevationData.filter(point => 
      point.lat >= bounds.getSouth() &&
      point.lat <= bounds.getNorth() &&
      point.lng >= bounds.getWest() &&
      point.lng <= bounds.getEast()
    );
    
    if (pointsInBounds.length === 0) {
      throw new Error('No elevation data points within current bounds');
    }
    
    // For each point, calculate the gradient to neighboring points
    const gradientPoints = [];
    
    for (let i = 0; i < pointsInBounds.length; i++) {
      const point = pointsInBounds[i];
      
      // Find neighboring points
      const neighbors = findNeighbors(point, pointsInBounds);
      
      if (neighbors.length === 0) continue;
      
      // Calculate max gradient to any neighbor
      let maxGradient = 0;
      
      for (const neighbor of neighbors) {
        // Calculate approximate distance in meters
        const { northSouth, eastWest } = degreesToMeters(
          point.lat,
          Math.abs(point.lat - neighbor.lat),
          Math.abs(point.lng - neighbor.lng)
        );
        
        // Horizontal distance using Pythagorean theorem
        const distance = Math.sqrt(northSouth * northSouth + eastWest * eastWest);
        
        // Calculate gradient
        const gradient = calculateGradient(point.elevation, neighbor.elevation, distance);
        maxGradient = Math.max(maxGradient, gradient);
      }
      
      gradientPoints.push({
        ...point,
        gradient: maxGradient
      });
    }
    
    // Sort by gradient (steepest first) and return the requested number
    const sortedPoints = gradientPoints.sort((a, b) => b.gradient - a.gradient);
    return sortedPoints.slice(0, count);
  };
  
  /**
   * Find neighboring points in the elevation dataset
   * @param {Object} point - Current point
   * @param {Array} points - All elevation points
   * @returns {Array} - Neighboring points
   */
  const findNeighbors = (point, points) => {
    // Define what constitutes a "neighbor" (adjust radius as needed)
    const radius = 0.01; // Approximately 1km
    
    return points.filter(p => {
      if (p === point) return false;
      
      const distance = Math.sqrt(
        Math.pow(p.lat - point.lat, 2) + Math.pow(p.lng - point.lng, 2)
      );
      
      return distance < radius;
    });
  };