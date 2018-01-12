pragma solidity ^0.4.2;

contract VirtualRealEstate {
    address owner;
    uint256 ownerEth = 0;
    
    //Mapping of propertyID to property
    mapping (uint24 => Property) map;
    //propertyOwner to link
    mapping (address => bytes32[2]) ownerLink;
    //propertyRenter to link
    mapping (address => bytes32[2]) ownerHoverText;
    
    uint128 DEFAULT_PRICE = 100000000000000000;
    
    uint128 USER_BUY_CUT_PERCENT = 98; //%
    uint128 USER_RENT_CUT_PERCENT = 98; //%;
    
    event PropertyColorUpdate(uint24 indexed property, uint256[10] colors);
    
    struct Property {
        address owner;
        uint256[10] colors; //10x10 rgb pixel colors per property
        uint128 salePrice;
        address renter;
        uint256 rentAvailableUntil;
        uint256 rentedUntil;
        uint128 rentPrice;
    }
    
    modifier ownerOnly() {
        require(owner == msg.sender);
        _;
    }
    
    modifier validPropertyID(uint24 propertyID) {
        if (propertyID < 10000) {
            _;
        }
    }
    
    function VirtualRealEstate() public {
        owner = msg.sender;
    }
    function setHoverText(bytes32[2] text) public {
        ownerHoverText[msg.sender] = text;
    }
    function setLink(bytes32[2] link) public {
        ownerLink[msg.sender] = link;
    }
    
    function getForSalePrice(uint24 propertyID) public validPropertyID(propertyID) view returns(uint128) {
        Property storage property = map[propertyID];
        require(property.salePrice != 0);
        return property.salePrice;
    }
    
    function getForRentPrice(uint24 propertyID) public validPropertyID(propertyID) view returns(uint128) {
        Property storage property = map[propertyID];
        require(property.rentPrice != 0);
        return property.rentPrice;
    }
    function getHoverText(uint24 propertyID) public validPropertyID(propertyID) view returns(bytes32[2]) {
        Property storage property = map[propertyID];
        
        //Must have a owner or renter, and that owner/renter must have a short or long hover text
        require(property.renter != 0 || property.owner != 0);
        address propertyResident;
        if (property.renter == 0) {
            propertyResident = property.owner;
        } else {
            propertyResident = property.renter;
        }
        return ownerHoverText[propertyResident];
    }
    
    function getLink(uint24 propertyID) public validPropertyID(propertyID) view returns(bytes32[2]) {
        Property storage property = map[propertyID];
        //Must have a owner or renter, and that owner/renter must have a short or long hover text
        require(property.renter != 0 || property.owner != 0);
        address propertyResident;
        if (property.renter == 0) {
            propertyResident = property.owner;
        } else {
            propertyResident = property.renter;
        }
        return ownerLink[propertyResident];
    }
    
    function getPropertyColorsOfRow(uint24 x, uint24 row) public validPropertyID(x + (row / 10) * 100) view returns(uint256[10]) {
        uint256[10] result;
        uint24 propertyID = x + row * 10;
        uint24 pixelRow = row % 10;
        for(uint24 i = 0; i < 10; i++) {
            result[i] = map[propertyID + i].colors[pixelRow];
        }
        return result;
    }
    
    function getPropertyColors(uint24 propertyID) public validPropertyID(propertyID) view returns(uint256[10]) {
        return map[propertyID].colors;
    }
    
    function getPropertyData(uint24 propertyID) public validPropertyID(propertyID) view returns(address, uint128, address, uint256, uint256, uint128) {
        Property storage property = map[propertyID];
        return (property.owner, property.salePrice, property.renter, property.rentAvailableUntil, property.rentedUntil, property.rentPrice);
    }
    
    function setColors(uint24 propertyID, uint256[10] newColors) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
        
        if (property.rentPrice != 0 && property.renter != 0 && property.rentedUntil < now) {
            property.renter = 0;
        }
        
        require((msg.sender == property.owner && property.renter == 0) || (msg.sender == property.renter));
        
        property.colors = newColors;
        
        PropertyColorUpdate(propertyID, newColors);
        
        return true;
    }
    
    //Use Case: Buyer wants to buy a property
    function buyProperty(uint24 propertyID) public validPropertyID(propertyID) payable returns(bool) {
        //If this is the first ever purchase, the property hasn't been made yet, property.owner is just default
        if (map[propertyID].owner == 0) {
            map[propertyID].owner = owner;
            map[propertyID].salePrice = DEFAULT_PRICE;
        }
        
        Property storage property = map[propertyID];
      
        if (property.rentPrice != 0 && property.renter != 0 && property.rentedUntil < now) {
            property.renter = 0;
        }
      
        require(property.salePrice != 0);//property must be for sale
        require(property.renter == 0);//property cannot be being rented
        require(msg.value >= property.salePrice);//Amount paid must be at least the price
      
        //User gets the majority of the listed price's sale
        uint128 amountTransfered = 0;
        
        if (property.owner != 0) {
            amountTransfered = property.salePrice * USER_BUY_CUT_PERCENT / 100;
            property.owner.transfer(amountTransfered);
        }
        
        property.rentPrice = 0;
        property.renter = 0;
        property.salePrice = 0;
        property.owner = msg.sender;
        
        ownerEth += msg.value - amountTransfered;
        
        return true;
    }
    
    //Use Case: Renter wants to rent a property
    function rentProperty(uint24 propertyID) public validPropertyID(propertyID) payable returns(bool) {
        Property storage property = map[propertyID];
        
        //How many units they paid to rent
        uint256 timeToRent = msg.value / property.rentPrice;
        
        if (property.rentPrice != 0 && property.renter != 0 && property.rentedUntil < now) {
            property.renter = 0;
        }
      
        require(property.owner != 0); //Must have been owned
        require(property.rentPrice != 0);//property must be for sale
        require(timeToRent >= 1);//The renting must be for at least one unit
        require(property.renter == 0);//property cannot be being rented already
      
        //User gets the majority of the listed price's sale
        uint256 amountTransfered = msg.value * USER_RENT_CUT_PERCENT / 100;
        
        property.owner.transfer(amountTransfered);
        
        property.renter = msg.sender;
      
        if (property.rentAvailableUntil < now + timeToRent) {
            property.rentedUntil = property.rentAvailableUntil;
        } else {
            property.rentedUntil = now + timeToRent;
        }
        
        ownerEth += msg.value - amountTransfered;
        
        return true;
    }
    
    //Use Case: Renter wants to stop renting the property
    function stopRenting(uint24 propertyID) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
        
        require(msg.sender == property.renter);
        
        property.renter = 0;
        
        return true;
    }
    
    //Use Case: Owner of a property lists for sale at a given price
    function listForSale(uint24 propertyID, uint128 price ) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
      
        require(price != 0);
      
        if (property.rentPrice != 0 && property.renter != 0 && property.rentedUntil < now) {
            property.renter = 0;
        }
      
        require(msg.sender == property.owner); //Must be the owner
        require(property.renter == 0); //Must not currently be already rented out
        //You can listForSale an already listed item to update the listing
        property.salePrice = price;
        
        return true;
    }
    //Use Case: Owner of a property lists for rent at a given price
    function listForRent(uint24 propertyID, uint128 rentPrice, uint128 rentDuration) public validPropertyID(propertyID) returns(bool)  {
        Property storage property = map[propertyID];
      
        if (property.rentPrice != 0 && property.renter != 0 && property.rentedUntil < now) {
            property.renter = 0;
        }
      
        require(rentPrice != 0);
        require(msg.sender == property.owner); //Must be the owner
        require(property.renter == 0); //Must not currently be already rented out
        require(rentDuration > 0); //Must be renting for a proper duration
        //You can listForRent an already listed item to update the listing
      
        property.rentPrice = rentPrice;
        property.rentAvailableUntil = now + rentDuration;
        
        return true;
    }
    //Use Case: Owner of a property delists from both renting offer and sale offer
    function delist(uint24 propertyID, bool delistFromSale, bool delistFromRent) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
      
        if (property.rentPrice != 0 && property.renter != 0 && property.rentedUntil < now) {
            property.renter = 0;
        }
        
        require(msg.sender == property.owner); //Must be the owner
        require(property.renter == 0); //Must have no current renter
        
        if (delistFromRent) {
            property.rentPrice = 0;
            property.renter = 0;
        }
        if (delistFromSale) {
            property.salePrice = 0;
        }
        return true;
    }
    
    //////////////////////////////////////////////////////
    ////Owner Sections: Meta-Functions For Owner only/////
    //////////////////////////////////////////////////////
    function withdraw(uint256 amount) public ownerOnly() {
        if (amount <= ownerEth) {
            owner.transfer(amount);
        }
    }
    
    function withdrawAll() public ownerOnly() {
        owner.transfer(ownerEth);
    }
    
    function changeOwners(address newOwner) public ownerOnly() {
        owner = newOwner;
    }
    
    function changeDefaultPrice(uint128 defaultPrice) public ownerOnly() {
        DEFAULT_PRICE = defaultPrice;
    }
}