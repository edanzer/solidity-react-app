import React, { Component } from "react";
import PropertyRegistryContract from "./contracts/PropertyRegistry.json";
import getWeb3 from "./getWeb3";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import "./App.css";

class App extends Component {
  state = { 
    property: '',
    currentOwner: '',
    newOwner: '',
    ownerList: [],
    web3: null, 
    accounts: null, 
    contract: null, 
  };

  componentDidMount = async () => {
    try {
    
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get user accounts.
      const accounts = await web3.eth.getAccounts();

      // Get contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = PropertyRegistryContract.networks[networkId];
      const instance = new web3.eth.Contract(
        PropertyRegistryContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to state and get property details.
      this.setState({ web3, accounts, contract: instance }, this.getPropertyDetails);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  getPropertyDetails = async () => {
    const { accounts, contract } = this.state;

    // Get current property details from the contract.
    const property = await contract.methods.getProperty().call();
    const currentOwner = await contract.methods.getCurrentOwner().call();
    const condensedOwnerList = await contract.methods.getOwnerList().call();
    let ownerList = condensedOwnerList.map(item => item + " | ");

    // Update state
    this.setState({ 
      property,
      currentOwner,
      ownerList
    });
  };

  updateOwner = async () => {
    const { accounts, contract } = this.state;

    // Send request to update owner with contract.
    await contract.methods.changeOwner(this.state.newOwner).send({ from: accounts[0] });

    // Update property details 
    this.getPropertyDetails();
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Property Details</h1>
        <p>Property: {this.state.property}</p>
        <p>Current Owner: {this.state.currentOwner}</p>
        <p>Owner List: {this.state.ownerList}</p>
        <TextField id="new-owner" label="Enter new owner" value={this.state.newOwner} onChange={(e) => this.setState({newOwner: e.target.value})} variant="outlined" />
        <Button variant="contained" size="large" onClick={this.updateOwner}>Submit Ownership Change</Button>
        <Button variant="contained" onclick={this.getPropertyDetails}>Refresh Property Details</Button>
      </div>
    );
  }
}

export default App;
