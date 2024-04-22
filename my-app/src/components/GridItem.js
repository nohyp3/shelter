
import React from 'react';

class Person extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
        }   
    }
  render(){
    return(
      <div className="card" onClick={this.props.onClick}>
        <h2>{this.props.name}</h2>
        <h3>{this.props.sector}</h3>
        <h3>{this.props.orgName}</h3>
        <h3>{this.props.address}</h3>
        <p style={{color: this.props.unoccupiedBeds === "" || null  ? "grey" : (this.props.unoccupiedBeds < 10 ? "red" : "green")}}>Beds: {this.props.unoccupiedBeds}</p>
      </div>
    )
  }
}

export default Person;