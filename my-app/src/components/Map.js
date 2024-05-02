import React, { useRef, useEffect, useState } from 'react';

// Map Imports
import {SearchBox} from '@mapbox/search-js-react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import * as turf from '@turf/turf';

function Map({data}){
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-79.34);
    const [lat, setLat] = useState(43.65);
    const [zoom, setZoom] = useState(9);
    const [value, setValue] = useState('');
    const [address, setAddress] = useState('');

    const handleAddressChange = (newAddress) => {
      setAddress(newAddress); // Assuming 'place_name' holds the full address string
      console.log(newAddress)
    };

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
        map.current.on('move', () => {
          setLng(map.current.getCenter().lng.toFixed(4));
          setLat(map.current.getCenter().lat.toFixed(4));
          setZoom(map.current.getZoom().toFixed(2));
        });
        // add markers to map
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
                                  .addTo(map.current)
                                  .setPopup(
                                    new mapboxgl.Popup({offset: 25})
                                      .setHTML(
                                        `<h3>${org.name}</h3>
                                        <h3>${org.address}</h3>`
                                      )
                                  )
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
            <form>
              <SearchBox accessToken={mapboxgl.accessToken} map={map.current} marker={true} mapboxgl={mapboxgl} onRetrieve={handleAddressChange} placeholder={"Enter your address"} value={value}/>
            </form>
        </div>
    );
}
export default Map