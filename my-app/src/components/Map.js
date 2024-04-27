import React, { useRef, useEffect, useState } from 'react';

// Map Imports
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import * as turf from '@turf/turf';

mapboxgl.accessToken = 'pk.eyJ1Ijoibm9oeXBlIiwiYSI6ImNsdjBlZXl5YjFpczkycW84NDl1Znl4YzEifQ.wGi61OuX6Ya5Q2HvYx_BDQ';

function Map({data}){
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-79.34);
    const [lat, setLat] = useState(43.65);
    const [zoom, setZoom] = useState(9);
    const geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-77.032, 38.913]
            },
            properties: {
              title: 'Mapbox',
              description: 'Washington, D.C.'
            }
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-122.414, 37.776]
            },
            properties: {
              title: 'Mapbox',
              description: 'San Francisco, California'
            }
          }
        ]
    };
    useEffect(() => {
      console.log("map1 "+ data)
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: zoom
        });
        map.current.on('move', () => {
          setLng(map.current.getCenter().lng.toFixed(4));
          setLat(map.current.getCenter().lat.toFixed(4));
          setZoom(map.current.getZoom().toFixed(2));
        });
        // add markers to map
        // for (const feature of geojson.features) {
        //     // create a HTML element for each feature
        //     const el = document.createElement('div');
        //     el.className = 'marker';
        
        //     // make a marker for each feature and add to the map
        //     new mapboxgl.Marker(el)
        //         .setLngLat(feature.geometry.coordinates).addTo(map.current)
        //         .setPopup(
        //             new mapboxgl.Popup({ offset: 25 }) // add popups
        //                 .setHTML(
        //                     `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
        //                 )
        //         );
        // }
        // const geojsonFeatures = [];
        // data.forEach(object => {
        //   console.log("map2 "+data )
        //     object.forEach(async shelter => {
        //       try {
        //         const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(shelter.data.address)}.json?access_token=${mapboxgl.accessToken}`);
        //         const data = await response.json();
        //         const coordinates = data.features[0].center; // Extract coordinates from geocoding response
        
        //         // Create GeoJSON feature
        //         const feature = turf.point(coordinates, shelter.data.address);
        //         geojsonFeatures.push(feature);
        
        //         // Add marker to map
        //         new mapboxgl.Marker().setLngLat(coordinates).addTo(map.current);
        //       } catch (error) {
        //           console.error('Error geocoding address:', shelter, error);
        //       }
        //     })
        //     console.log("test " + geojsonFeatures)
        // })
        const addMarkers = async () => {
          if (data && data.length > 0) {
              for (const entry of data) {
                  if (entry.data) {
                      console.log("hello");
                      for (const org of entry.data) {
                          try {
                              const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(org.address)}.json?access_token=${mapboxgl.accessToken}`);
                              const geocodingData = await response.json();
                              const coordinates = geocodingData.features[0].center;
  
                              new mapboxgl.Marker()
                                  .setLngLat(coordinates)
                                  .addTo(map.current);
                          } catch (error) {
                              console.error('Error geocoding address:', org, error);
                          }
                      }
                  }
              }
          }
          else {
            console.log("no")
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