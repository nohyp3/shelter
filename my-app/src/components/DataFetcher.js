import React, {useState} from 'react';
import Person from './GridItem'
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Bar, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';

// register the necessary components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// variable to hold data for the chart
var shelterLabels;
var shelterDataPoints;

function DataFetcher({data}) {
    const [filterCapacity, setFilterCapacity] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedItem, setExpandedItem] = useState(null)
    const [isExpanded, setIsExpanded] = useState(false) 

    // Handle displaying results after a filter button has been clicked
    const handleFilterChange = (capacity) => {
        setFilterCapacity(prev => prev === null ? capacity : null);
    }

    // Make the expanded div visible and set the state to true
    const expandItem = async(item) => {
        try{
            // fetch data from the api
            const response = await fetch(`https://shelter-backend.vercel.app/api/shelter/${item.id}`);
            if (!response.ok) {
                throw new Error('Data fetching failed');
            }
            const jsonData = await response.json();
            item = jsonData;
            setExpandedItem(item);
            setIsExpanded(true);
            // set the variables to data from the api call 
            shelterLabels = jsonData.map(data => data.name);
            shelterDataPoints = jsonData.map(data => data.unoccupied_beds);
        }
        catch(error){
            console.log("Error fetching this shelter's data", error);
        }
    };
    
    // Set the isExpanded state to false to close the expanded div 
    const closeItem = () => {
        setIsExpanded(false)
    }

    // Function to check if any field matches the search query
    const matchesSearch = (item) => {
        if (item == null) return false;
        const query = searchQuery.toLowerCase();
        return (
            item.name.toLowerCase().includes(query) ||
            item.sector.toLowerCase().includes(query) ||
            item.address.toLowerCase().includes(query) ||
            item.org_name.toLowerCase().includes(query)
        );
    };


    // Filter data based on unoccupied_beds field inside the nested 'data' object
    const filteredData = data.map(item => {
        // Assume each 'item' in data is an object with a 'data' property
        if(!item) return null;
        return {
            ...item,
            data: item.data.filter(shelter => (!filterCapacity || shelter.unoccupied_beds >= filterCapacity) &&
            (!searchQuery || matchesSearch(shelter)))
        };
    }).filter(item => item.data && item.data.length > 0); // Remove entries without any matching shelters

    return (
        <div>
            <h2>List of Shelters</h2>
            <h3>Total Displayed: {filteredData.length > 0 ? Object.keys(filteredData[0].data).length : 0}</h3>
            <Stack spacing={2} sx={{maxWidth: 'md', mx: 'auto'}}>
                <TextField sx={{backgroundColor: 'White'}}placeholder="Search for a Shelter" onChange={event => setSearchQuery(event.target.value)}></TextField>
                <Button variant="contained" onClick={() => handleFilterChange(1)}>{filterCapacity ? 'Show All Shelters' : 'Show only Availble Beds'}</Button>
            </Stack>
            {/* Get all the data and put inside a Grid */}
            <ul>
                {filteredData.map((entry, index) => (
                    <div>
                        <div className="container">
                            {entry.data.map((org, index) => (
                                <Person 
                                    name={org.name} 
                                    sector={org.sector} 
                                    address={org.address} 
                                    orgName={org.org_name} 
                                    unoccupiedBeds={org.unoccupied_beds}
                                    onClick={() => expandItem(org)}/>
                                
                            ))}
                        </div>
                    </div>
                ))}
            </ul>
            {/* Conditional rendering of expanded card after clicking on a div*/}
            {isExpanded && expandedItem && (
                <div className="expanded-card">
                {/* <Card sx={{zIndex: 'modal', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', overflow: 'scroll', width: '35vw', height: '50vh'}}> */}
                    <h2>{expandedItem.name}</h2>
                    <p>Sector: {expandedItem.sector}</p>
                    <p>Organization Name: {expandedItem.org_name}</p>
                    <p>Address: {expandedItem.address}</p>
                    <p>Occupancy Rooms: {expandedItem.occupancy_rooms}</p>
                    <p>Occupancy Beds: {expandedItem.occupancy_beds}</p>
                    <p>Unoccupied Beds: {expandedItem.unoccupied_beds}</p>
                    <p>Unavailable Beds: {expandedItem.unavailable_beds}</p>
                    {/* <LineChart chartData={chartData1} /> */}
                    <div style={{width: '400px', height: '300px'}}>
                        <Bar data={{
                            labels: shelterLabels,
                            datasets: [
                                {
                                    label: "Unoccupied Beds",
                                    data: shelterDataPoints,
                                },
                            ],
                            }}
                            options={{
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                    },
                                },
                            }} 
                        />
                    </div>
                    <Button variant='contained' onClick={closeItem}>Close</Button>
                    {/* </Card> */}
                 </div>
            )}
        </div>
    );
}

export default DataFetcher;