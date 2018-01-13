pragma solidity ^0.4.2;

/* taking ideas from BatToken token */
contract SafeMath {
    function safeAdd(uint256 x, uint256 y) internal returns(uint256) {
      uint256 z = x + y;
      assert((z >= x) && (z >= y));
      return z;
    }

    function safeSubtract(uint256 x, uint256 y) internal returns(uint256) {
      assert(x >= y);
      uint256 z = x - y;
      return z;
    }

    function safeMult(uint256 x, uint256 y) internal returns(uint256) {
      uint256 z = x * y;
      assert((x == 0)||(z/x == y));
      return z;
    }
}

contract VirtualRealEstate is SafeMath {
    address owner;
    uint256 ownerEth = 0;
    
    //Mapping of propertyID to property
    mapping (uint24 => Property) map;
    //propertyOwner to link
    mapping (address => bytes32[2]) ownerLink;
    //propertyRenter to link
    mapping (address => bytes32[2]) ownerHoverText;
    
    uint128 DEFAULT_PRICE_INCREMENTATION_INCREMENTATION = 100000000000000; //0.0001
    uint128 DEFAULT_PRICE_INCREMENTATION = 500000000000000; //0.0005
    uint128 DEFAULT_PRICE = 10000000000000000; //0.01 ETH
    uint128 DEFAULT_RENT_PRICE = 231481481481; //0.001 ETH per day on block-by-block rate
    uint128 DEFAULT_MAX_RENT_DURATION = 72; 
    
    uint128 USER_BUY_CUT_PERCENT = 98; //%
    uint128 USER_RENT_CUT_PERCENT = 98; //%;
    
    uint256 BUYABLE_AS_OF_DATE;
    
    event PropertyColorUpdate(uint24 indexed property, uint256[10] colors);
    event PropertyColorUpdatePixel(uint24 indexed property, uint8 row, uint24 rgb);
    event PropertyBought(uint24 indexed property,  address newOwner);
    event PropertyRented(uint24 indexed property, address newRenter, uint256 expiration );
    event SetUserHoverText(address indexed user, bytes32[2] newHoverText);
    event SetUserSetLink(address indexed user, bytes32[2] newLink);
    event PropertySetForSale(uint24 indexed property);
    event PropertySetForRent(uint24 indexed property); //
    event RenterLeaves(uint24 indexed property);
    event DelistProperty(uint24 propertyID, bool delistFromSale, bool delistFromRent);
    
    struct Property {
        address owner;
        uint256[10] colors; //10x10 rgb pixel colors per property
        uint128 salePrice;
        address renter;
        uint256 maxRentDuration;
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
    
    modifier tryEvict(Property property) {
        if (property.rentPrice != 0 && property.renter != 0 && property.rentedUntil < now) {
            property.renter = 0;
        }
        _;
    }
    
    function VirtualRealEstate() public {
        owner = msg.sender;
        BUYABLE_AS_OF_DATE = now + 7 days;
    }
    function setHoverText(bytes32[2] text) public {
        ownerHoverText[msg.sender] = text;
        SetUserHoverText(msg.sender, text);
    }
    function setLink(bytes32[2] link) public {
        ownerLink[msg.sender] = link;
        SetUserSetLink(msg.sender, link);
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
    
    function getPropertyColors(uint24 propertyID) public validPropertyID(propertyID) view returns(uint256[10]) {
        return map[propertyID].colors;
    }
    
    function getPropertyData(uint24 propertyID) public validPropertyID(propertyID) view returns(address, uint128, address, uint256, uint256, uint128) {
        Property storage property = map[propertyID];
        return (property.owner, property.salePrice, property.renter, property.maxRentDuration, property.rentedUntil, property.rentPrice);
    }
    
    function setColors(uint24 propertyID, uint256[10] newColors) public validPropertyID(propertyID) tryEvict(property) returns(bool) {
        Property storage property = map[propertyID];
        
        if (property.owner != 0) {
            require((msg.sender == property.owner && property.renter == 0) || (msg.sender == property.renter));
        }
        
        property.colors = newColors;
        
        PropertyColorUpdate(propertyID, newColors);
        
        return true;
    }
    
    function setRowColors(uint24 propertyID, uint8 row, uint24 newColorData) public validPropertyID(propertyID) tryEvict(property) returns(bool) {
        Property storage property = map[propertyID];
        
        require(row >= 0 && row <= 9);
        
        property.colors[row] = newColorData;
        
        PropertyColorUpdatePixel(propertyID, row, newColorData);
        
        return true;
    }
    
    function transferProperty(uint24 propertyID, address newOwner) public validPropertyID(propertyID)  tryEvict(property) returns(bool) {
        Property storage property = map[propertyID];
        
        require(property.owner == msg.sender);
        require(property.renter == 0);
        require(newOwner != 0);
        
        property.owner = newOwner;
        
        return true;
    }
    
    //Use Case: Buyer wants to buy a property
    function buyProperty(uint24 propertyID) public validPropertyID(propertyID) tryEvict(property) payable returns(bool) {
        require(now < BUYABLE_AS_OF_DATE);
        
        Property storage property = map[propertyID];
        
        //If this is the first ever purchase, the property hasn't been made yet, property.owner is just default
        if (property.owner == 0) {
            property.owner = owner;
            property.salePrice = DEFAULT_PRICE;
            DEFAULT_PRICE += DEFAULT_PRICE_INCREMENTATION;
            DEFAULT_PRICE_INCREMENTATION += DEFAULT_PRICE_INCREMENTATION_INCREMENTATION;
        }
      
        require(property.salePrice != 0);//property must be for sale
        require(property.renter == 0);//property cannot be being rented
        require(msg.value >= property.salePrice);//Amount paid must be at least the price
      
        //User gets the majority of the listed price's sale
        uint128 amountTransfered = 0;
        
        //If there is someone to get paid, they get the purchase. Otherwise, the contract gets it as initial purchase payment
        if (property.owner != 0) {
            amountTransfered = property.salePrice * USER_BUY_CUT_PERCENT / 100;
            property.owner.transfer(amountTransfered);
        }
        
        property.rentPrice = 0;
        property.renter = 0;
        property.salePrice = 0;
        property.owner = msg.sender;
        
        ownerEth += msg.value - amountTransfered;
        
        PropertyBought(propertyID, property.owner);
        
        return true;
    }
    
    //Use Case: Renter wants to rent a property
    function rentProperty(uint24 propertyID, uint32 hoursToRentFor) public validPropertyID(propertyID) tryEvict(property) payable returns(bool) {
        Property storage property = map[propertyID];
        
        uint256 rentPrice = property.owner == 0 ? property.rentPrice : DEFAULT_RENT_PRICE;
        
        //How many units they paid to rent. Truncates to zero if not enough money for one day
        uint256 timeToRent = msg.value / property.rentPrice;
      
        //require(property.owner != 0); //Must have been owned
        require(rentPrice != 0);//property must be for sale
        require(timeToRent >= 1);//The renting must be for at least one unit
        require(property.renter == 0);//property cannot be being rented already
      
        //User gets the majority of the listed price's sale
        uint256 amountTransfered = msg.value * USER_RENT_CUT_PERCENT / 100;
        
        //If there is someone to transfer the funds to, transfer it, otherwise, they rented from the owners initially
        if (property.owner != 0) {
            property.owner.transfer(amountTransfered);
        }
        
        //TODO: moving rent systems over. Double check I'm not missing cases
        require(hoursToRentFor <= timeToRent);
        require(timeToRent <= hoursToRentFor);
        
        property.rentedUntil = now + (1 hours) * hoursToRentFor;
        property.renter = msg.sender;
        ownerEth += msg.value - amountTransfered;
        
        PropertyRented(propertyID, property.renter, property.rentedUntil );
        
        return true;
    }
    
    //Use Case: Renter wants to stop renting the property
    function stopRenting(uint24 propertyID) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
        
        require(msg.sender == property.renter);
        
        property.renter = 0;
        
        RenterLeaves(propertyID);
        
        return true;
    }
    
    //Use Case: Owner of a property lists for sale at a given price
    function listForSale(uint24 propertyID, uint128 price ) public validPropertyID(propertyID) tryEvict(property) returns(bool) {
        Property storage property = map[propertyID];
      
        require(price != 0);
      
        require(msg.sender == property.owner); //Must be the owner
        require(property.renter == 0); //Must not currently be already rented out
        //You can listForSale an already listed item to update the listing
        property.salePrice = price;
        
        PropertySetForSale(propertyID);
        
        return true;
    }
    //Use Case: Owner of a property lists for rent at a given price
    function listForRent(uint24 propertyID, uint128 rentPrice, uint128 maxRentDuration) public validPropertyID(propertyID) tryEvict(property) returns(bool)  {
        Property storage property = map[propertyID];
      
        require(rentPrice != 0);
        require(msg.sender == property.owner); //Must be the owner
        require(property.renter == 0); //Must not currently be already rented out
        require(maxRentDuration > 0); //Must be renting for a proper duration
        //You can listForRent an already listed item to update the listing
      
        property.rentPrice = rentPrice;
        property.maxRentDuration = maxRentDuration;
        property.rentedUntil = 0;
        
        PropertySetForRent(propertyID);
        
        return true;
    }
    //Use Case: Owner of a property delists from both renting offer and sale offer
    function delist(uint24 propertyID, bool delistFromSale, bool delistFromRent) public validPropertyID(propertyID) tryEvict(property) returns(bool) {
        Property storage property = map[propertyID];
        
        require(msg.sender == property.owner); //Must be the owner
        require(property.renter == 0); //Must have no current renter
        
        if (delistFromRent) {
            property.rentPrice = 0;
            property.renter = 0;
        }
        if (delistFromSale) {
            property.salePrice = 0;
        }
        
        DelistProperty(propertyID, delistFromSale, delistFromRent);
        
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