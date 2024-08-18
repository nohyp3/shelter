import React, { useRef, useEffect, useState } from 'react';

// Map Imports
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import * as turf from '@turf/turf';

function Map({data}){
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-79.34);
    const [lat, setLat] = useState(43.65);
    const [zoom, setZoom] = useState(9);
    const [markers, setMarkers] = useState([]); 
    const [loadingMarkers, setLoadingMarkers] = useState(true);

    // Function to find the nearest marker
    function findNearestMarker(lat, lng) {
      let nearestMarker = null;
      let nearestDistance = Infinity;
      markers.forEach(markerData => {
        const distance = turf.distance(turf.point([lng, lat]), turf.point(markerData.coordinates));
        if (distance < nearestDistance) {
            nearestMarker = markerData;
            nearestDistance = distance;
        }
    });
    return nearestMarker;
    }

    useEffect(() => {
        if (map.current){
          map.current.remove();
        }
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX;
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: zoom
        });
        map.current.on('load', () => {
          const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken, // Set the access token
            mapboxgl: mapboxgl, // Set the mapbox-gl instance
            marker: true, // Use the geocoder's default marker style
            bbox: [-79.931030, 43.325178, -78.975220, 44.087585] // Set the bounding box to the GTA
          });
          
          // Add the geocoder to the map
          map.current.addControl(geocoder, 'top-right');

          // Add an event listener when an address is selected
          geocoder.on('result', (event) => {
            if (loadingMarkers) {
              alert("Markers are still loading.");
              //return;
            }
            console.log("Current Markers:", markers)
            const searchResult = event.result.geometry.coordinates;
            console.log("geocoder "+searchResult)
            // Get the nearest marker
            let nearest = findNearestMarker(searchResult[1],searchResult[0]);
            console.log("nearest "+nearest)
            // Open the popup
            if (nearest) {
              nearest.marker.togglePopup(); 
            }
          });
        });
        
        // Adjust the lat and long displayed on the site when map is moved 
        map.current.on('move', () => {
          setLng(map.current.getCenter().lng.toFixed(4));
          setLat(map.current.getCenter().lat.toFixed(4));
          setZoom(map.current.getZoom().toFixed(2));
        });
    }, [data]);
    
    useEffect(() => {
      // add markers to map
      const addMarkers = async () => {
        if (data && data.length > 0) {
            const localMarkers = [];
            for (const entry of data) {
                if (entry.data) {
                    for (const org of entry.data) {
                        try {
                            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(org.address)}.json?access_token=${mapboxgl.accessToken}`);
                            const geocodingData = await response.json();
                            const coordinates = geocodingData.features[0].center;
                            const marker = new mapboxgl.Marker()
                              .setLngLat(coordinates)
                              .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${org.name}</h3><p>${org.address}</p>`))
                              .addTo(map.current);
                            localMarkers.push({
                                coordinates: coordinates,
                                marker: marker
                            });
                            //markers.push(coordinates);
                        } catch (error) {
                            console.error('Error geocoding address:', org, error);
                        }
                    }
                }
            }
            setMarkers(localMarkers);
            setLoadingMarkers(false);
        }
        else {
          console.log("error loading markers")
        }
    };
      addMarkers();
    }, [data]);
    return(
        <div>
            <div className="sidebar">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            <div ref={mapContainer} className="map-container" />
        </div>
    );
}
export default Map