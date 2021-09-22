import React, { useEffect, useState } from "react";
import PropertyRegistryContract from "./contracts/PropertyRegistry.json";
import getWeb3 from "./getWeb3";
import "./App.css";

const App = () => {
  const [property, setProperty] = useState('');
  const [owner, setOwner] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [ownerList, setOwnerList] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    async function connectToSmartContract() {
      try {
        // Get network provider and web3 instance.
        const web3Temp = await getWeb3();
  
        // Use web3 to get user accounts.
        const accountsTemp = await web3Temp.eth.getAccounts();
  
        // Get contract instance.
        const networkId = await web3Temp.eth.net.getId();
        const deployedNetwork = PropertyRegistryContract.networks[networkId];
        const instance = new web3Temp.eth.Contract(
          PropertyRegistryContract.abi,
          deployedNetwork && deployedNetwork.address,
        );

        // Update state for web3, accounts, contract
        setWeb3(web3Temp);
        setAccounts(accountsTemp);
        setContract(instance);
      } catch (error) {
        alert(`Failed to load web3, accounts, or contract. Check console for details.`);
        console.error(error);
      }
    }
    connectToSmartContract();
	}, []);

  useEffect(() => {
    if(contract) getPropertyDetails();
	}, [contract]);

  const getPropertyDetails = async () => {
    // Get current property details from the contract.
    const property = await contract.methods.getProperty().call();
    const owner = await contract.methods.getCurrentOwner().call();
    const condensedOwnerList = await contract.methods.getOwnerList().call();
    let ownerList = condensedOwnerList.map(item => item + " | ");

    // Update state for property and ownership
    setProperty(property);
    setOwner(owner);
    setOwnerList(ownerList);
  };

  const updateOwner = async () => {
    // Send request to update owner with contract.
    await contract.methods.changeOwner(newOwner).send({ from: accounts[0] });

    // Update property details 
    setTimeout(getPropertyDetails(), 3000);
  };

  return(
    !web3 ? <div>Loading Web3, accounts, and contract...</div> : (
      <div className="background">
        <div className="content">
          <header>
            <h1>Property Details</h1>
            <p className="uppercase"><label>Property:</label> {property}</p>
            <p className="uppercase"><label>Current Owner:</label>  {owner}</p>
            <button onClick={getPropertyDetails}>Refresh Property Details</button>
          </header>
          <section>
            <p>To update ownership of this property, add new owner's name and submit.</p>
            <input id="new-owner" value={newOwner} onChange={(e) => setNewOwner(e.target.value)} variant="outlined" />
            <button onClick={updateOwner}>Submit Ownership Change</button>
          </section>
          <footer>
            <p><label>List of all current and past owners:</label></p>
            <p>{ownerList}</p>
          </footer>
        </div>
      </div>
    )
  ); 
}

export default App;
