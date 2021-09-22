// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21; 
pragma experimental ABIEncoderV2;

contract PropertyRegistry {        
          
    string property;
    string currentOwner;
    string[] ownerList;
              
    constructor() public {                  
        property = "123 Main St, Boulder CO 80303";  
        currentOwner = "123456";
        ownerList.push(currentOwner);
    }        
    
    event OwnerSet(string currentOwner, string newOwner);

    function getProperty() public view returns (string memory) {        
        return property;        
    }  
    
    function getOwnerList() public view returns (string[] memory) {
        return ownerList;
    }
    
    function getCurrentOwner() public view returns (string memory) {  
        return currentOwner;        
    }
    
    function changeOwner(string memory newOwner) public {
        emit OwnerSet(currentOwner, newOwner);
        currentOwner = newOwner;
        ownerList.push(newOwner);
    }
    
}