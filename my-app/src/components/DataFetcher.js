import React, {useState} from 'react';
import Person from './GridItem'

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
    const expandItem = (item) => {
        setExpandedItem(item);
        setIsExpanded(true)
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
            <button onClick={() => handleFilterChange(1)}>{filterCapacity ? 'Show All Shelters' : 'Show only Availble Beds'}</button>
            <input placeholder="Search for a Shelter" onChange={event => setSearchQuery(event.target.value)}></input>
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
                    <h2>{expandedItem.name}</h2>
                    <p>Sector: {expandedItem.sector}</p>
                    <p>Organization Name: {expandedItem.org_name}</p>
                    <p>Address: {expandedItem.address}</p>
                    <p>Occupancy Rooms: {expandedItem.occupancy_rooms}</p>
                    <p>Occupancy Beds: {expandedItem.occupancy_beds}</p>
                    <p>Unoccupied Beds: {expandedItem.unoccupied_beds}</p>
                    <p>Unavailable Beds: {expandedItem.unavailable_beds}</p>
                    <button onClick={closeItem}>Close</button>
                </div>
            )}
        </div>
    );
}

export default DataFetcher;