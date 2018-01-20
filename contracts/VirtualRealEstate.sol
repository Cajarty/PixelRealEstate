pragma solidity ^0.4.2;


/*
- ethPrice, pxlPrice. 
*/

contract Token {
    uint256 public totalSupply;
    function balanceOf(address _owner) public constant returns (uint256 balance);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
    function approve(address _spender, uint256 _value) public returns (bool success);
    function allowance(address _owner, address _spender) public constant returns (uint256 remaining);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}
/*  ERC 20 token */
contract StandardToken is Token {

    function transfer(address _to, uint256 _value) public returns (bool success) {
      if (balances[msg.sender] >= _value && _value > 0) {
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        Transfer(msg.sender, _to, _value);
        return true;
      } else {
        return false;
      }
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
      if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _value > 0) {
        balances[_to] += _value;
        balances[_from] -= _value;
        allowed[_from][msg.sender] -= _value;
        Transfer(_from, _to, _value);
        return true;
      } else {
        return false;
      }
    }

    function balanceOf(address _owner) public constant returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public constant returns (uint256 remaining) {
      return allowed[_owner][_spender];
    }

    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;
}

contract VirtualRealEstate is StandardToken {
    address owner;
    uint256 ownerEth = 0;
    
    uint256 pixelPot;
    
    //Mapping of propertyID to property
    mapping (uint24 => Property) map;
    //propertyOwner to link
    mapping (address => bytes32[2]) ownerLink;
    //propertyRenter to link
    mapping (address => bytes32[2]) ownerHoverText;
    //trade offers
    mapping (address => TradeOffer) pxlTradeStatus;
    
    uint256 priceEth;
    uint256 PRICE_ETH_MIN_INCREASE = 1000;//10000000000000000000000; //0.0001 ETH
    uint256 PRICE_ETH_MIN_PERCENT = 20; //0.0001 ETH
    uint256 pricePxl;
    uint256 PRICE_PXL_MIN_INCREASE = 10;
    uint256 PRICE_PXL_MIN_PERCENT = 20;
    
    uint256 USER_BUY_CUT_PERCENT = 98; //%
    
    uint256 PROPERTY_GENERATES_PER_HOUR = 2;
    uint256 FREE_COLOR_SETTING_UNTIL;
    
    event PropertyColorUpdate(uint24 indexed property, uint256[10] colors, address propertyOwnerPayee, address lastUpdaterPayee);
    event PropertyColorUpdatePixel(uint24 indexed property, uint8 row, uint24 rgb);
    event PropertyBought(uint24 indexed property,  address newOwner);
    event SetUserHoverText(address indexed user, bytes32[2] newHoverText);
    event SetUserSetLink(address indexed user, bytes32[2] newLink);
    event PropertySetForSale(uint24 indexed property);
    event DelistProperty(uint24 indexed propertyID);
    event ListTradeOffer(address indexed offerOwner, uint256 eth, uint256 pxl, bool isBuyingPxl);
    event AcceptTradeOffer(address indexed accepter, address indexed offerOwner);
    event CancelTradeOffer(address indexed offerOwner);
    event SetPropertyPublic(uint24 indexed property);
    event SetPropertyPrivate(uint24 indexed property, uint32 numHoursPrivate);
    
    struct TradeOffer {
        uint256 eth;
        uint256 pxl;
        bool buyingPxl;
    }
    
    struct Property {
        address owner;
        uint256[10] colors; //10x10 rgb pixel colors per property
        uint256 salePrice;
        address lastUpdater;
        bool isInPrivateMode;
        uint256 lastUpdate;
        uint256 becomePublic;
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
        totalSupply = 0;
        FREE_COLOR_SETTING_UNTIL = now + 3 days;
        pricePxl = 10;
        priceEth = 10000;//1000000000000000000; //0.001 ETH
    }
    function setHoverText(bytes32[2] text) public {
        ownerHoverText[msg.sender] = text;
        SetUserHoverText(msg.sender, text);
    }
    function setLink(bytes32[2] link) public {
        ownerLink[msg.sender] = link;
        SetUserSetLink(msg.sender, link);
    }
    
    function getForSalePrice(uint24 propertyID) public validPropertyID(propertyID) view returns(uint256) {
        Property storage property = map[propertyID];
        require(property.salePrice != 0);
        return property.salePrice;
    }
    function getHoverText(uint24 propertyID) public validPropertyID(propertyID) view returns(bytes32[2]) {
        Property storage property = map[propertyID];
        
        //Must have a owner or renter, and that owner/renter must have a short or long hover text
        if (property.isInPrivateMode) {
            require(property.owner != 0);
            return ownerHoverText[property.owner];
        } else {
            require(property.lastUpdater != 0);
            return ownerHoverText[property.lastUpdater];
        }
    }
    
    function getLink(uint24 propertyID) public validPropertyID(propertyID) view returns(bytes32[2]) {
        Property storage property = map[propertyID];
        //Must have a owner or renter, and that owner/renter must have a short or long hover text
        require(property.owner != 0);
        
        return ownerLink[property.owner];
    }
    
    function getPropertyColors(uint24 propertyID) public validPropertyID(propertyID) view returns(uint256[10]) {
        return map[propertyID].colors;
    }
    
    function getPropertyData(uint24 propertyID) public validPropertyID(propertyID) view returns(address, uint256, address, bool) {
        Property storage property = map[propertyID];
        return (property.owner, property.salePrice, property.lastUpdater, property.isInPrivateMode);
    }
    function getPurchaseETHandPXLPrice() public view returns(uint256, uint256) {
        return (priceEth, pricePxl);
    }
    
    //Change a 10x10 == 70 | 30 | 0 cost
    function setColors(uint24 propertyID, uint256[10] newColors) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
        
        //Cost 2 if no owner, 1 if owned
        uint256 cost = property.owner != 0 ? 1 : 2;
        
        //If it's in private mode, we must be the owner, but it's free
        if (property.isInPrivateMode) {
            //If it's still privately owned
            if (property.becomePublic > now) {
                require(msg.sender == property.owner);
                cost = 0;
            }
            //No long erin private mode, ran out
            else {
                property.isInPrivateMode = false;
                property.becomePublic = 0;
            }
        } 
        //If we're in the first few days, setting the color is free
        else if (now <= FREE_COLOR_SETTING_UNTIL) {
            cost = 0;
        }
        
        require(balances[msg.sender] >= cost);
        
        //If we're in Public Mode, payouts occur
        
        if (!property.isInPrivateMode && property.lastUpdate != 0) {
            uint256 hoursSinceLastColorChange = (now - property.lastUpdate) / (1 seconds); //ERRORs on property.lastUpdate = 0
            uint256 payout = hoursSinceLastColorChange * PROPERTY_GENERATES_PER_HOUR;
    
            if (payout > 0) {
                address propertyOwnerPayee = property.owner;
                address lastUpdaterPayee = property.lastUpdater;
                if (propertyOwnerPayee == 0) {
                    if (lastUpdaterPayee != 0) {
                        propertyOwnerPayee = lastUpdaterPayee;
                    }
                }
                //Payout half to ownerPayee and half to updaterPayee
                if (propertyOwnerPayee != 0) {
                    balances[propertyOwnerPayee] += payout / 2;
                }
                if (lastUpdaterPayee != 0) {
                    balances[lastUpdaterPayee] += payout / 2;
                }
                totalSupply += payout;
            }
        }
        
        //Burn the coins from the sender
        balances[msg.sender] -= cost; //Burn the coin to set the color
        
        property.colors = newColors;
        property.lastUpdater = msg.sender;
        property.lastUpdate = now;
        
        PropertyColorUpdate(propertyID, newColors, propertyOwnerPayee, lastUpdaterPayee);
        
        return true;
    }
    function setPropertyMode(uint24 propertyID, bool isInPrivateMode, uint32 numHoursPrivate) public validPropertyID(propertyID) {
        Property storage property = map[propertyID];
        require(msg.sender == property.owner);
        if (isInPrivateMode) {
            require(numHoursPrivate > 0);
            require(balances[msg.sender] >= numHoursPrivate);
            balances[msg.sender] -= numHoursPrivate;
            property.becomePublic = now + (1 hours) * numHoursPrivate;
        } else {
            property.becomePublic = 0;
        }
        property.isInPrivateMode = isInPrivateMode;
        
        if (isInPrivateMode) {
            SetPropertyPrivate(propertyID, numHoursPrivate);
        } else {
            SetPropertyPublic(propertyID);
        }
    }
    function setBuyETHOffer(uint256 ethToBuy, uint256 offeredPxl) public {
        //Require we have the pxl to offer
        require(balances[msg.sender] >= offeredPxl);
        require(ethToBuy > 0 && offeredPxl > 0);
        
        //Cancel old TradeOffer if present
        cancelTradeOffer();
        
        //Set Offer
        pxlTradeStatus[msg.sender].eth = ethToBuy;
        pxlTradeStatus[msg.sender].pxl = offeredPxl;
        pxlTradeStatus[msg.sender].buyingPxl = false;
        
        //Lose offered pxl
        balances[msg.sender] -= offeredPxl;
        
        ListTradeOffer(msg.sender, ethToBuy, offeredPxl, false);
    }
    function setBuyPXLOffer(uint256 pxlToBuy, uint256 offeredEth) public payable {
        //Require we have the eth to offer
        require(msg.value >= offeredEth);
        require(pxlToBuy > 0 && offeredEth > 0);
        
        //Cancel old TradeOffer if present
        cancelTradeOffer();
        
        //Set Offer
        TradeOffer storage tradeOffer = pxlTradeStatus[msg.sender];
        tradeOffer.pxl = pxlToBuy;
        tradeOffer.eth = offeredEth;
        tradeOffer.buyingPxl = true;
        
        ListTradeOffer(msg.sender, offeredEth, pxlToBuy, true);
    }
    function cancelTradeOffer() public {
        TradeOffer storage tradeOffer = pxlTradeStatus[msg.sender];
        //If we have a trade offer
        if (tradeOffer.eth > 0 && tradeOffer.pxl > 0) {
            //We already deposited ETH. Return it back
            if (tradeOffer.buyingPxl) {
                msg.sender.transfer(tradeOffer.eth);
            }
            //We already deposited PXL. Return it back
            else {
                balances[msg.sender] += tradeOffer.pxl;
            }
            CancelTradeOffer(msg.sender);
        }
    }
    function acceptOfferBuyingETH(address ownerOfTradeOffer) public payable {
        TradeOffer storage tradeOffer = pxlTradeStatus[ownerOfTradeOffer];
        //Make sure the accepter has enough to justify accepting
        require(tradeOffer.eth <= msg.value);
        require(ownerOfTradeOffer != 0);
        
        //Give them our money. We are deposited it by this being "payable"
        ownerOfTradeOffer.transfer(msg.value);
        
        //Take their money. They already deposited their coins
        balances[msg.sender] += tradeOffer.pxl;
        
        //Clear trade offer
        tradeOffer.eth = 0;
        tradeOffer.pxl = 0;
        
        AcceptTradeOffer(msg.sender, ownerOfTradeOffer);
    }
    function acceptOfferBuyingPXL(address ownerOfTradeOffer) public {
        TradeOffer storage tradeOffer = pxlTradeStatus[ownerOfTradeOffer];
        //Make sure the accepter has enough to justify accepting
        require(tradeOffer.pxl <= balances[msg.sender]);
        require(ownerOfTradeOffer != 0);
        
        //Give them our money
        balances[ownerOfTradeOffer] += tradeOffer.pxl;
        balances[msg.sender] -= tradeOffer.pxl;
        
        //Take their money. They already deposited ETH
        msg.sender.transfer(tradeOffer.eth);
        
        //Clear trade offer
        tradeOffer.eth = 0;
        tradeOffer.pxl = 0;
        
        AcceptTradeOffer(msg.sender, ownerOfTradeOffer);
    }
    
    //Change pixel or 10x1 costs 7 | 3 | 0
    function setRowColors(uint24 propertyID, uint8 row, uint24 newColorData) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
        
        require(row >= 0 && row <= 9);
        
        uint256 cost = property.owner != 0 ? 1 : 2;
        
        if (property.isInPrivateMode) {
                require(msg.sender == property.owner);
                cost = 0;
        } 
        
        require(balances[msg.sender] >= cost);
        
        balances[msg.sender] -= cost; //Burn the coin to set the color
        
        property.colors[row] = newColorData;
        property.lastUpdater = msg.sender;
        PropertyColorUpdatePixel(propertyID, row, newColorData);
        
        return true;
    }
    
    function transferProperty(uint24 propertyID, address newOwner) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
        
        require(property.owner == msg.sender);
        require(newOwner != 0);
        
        property.owner = newOwner;
        
        return true;
    }
    function buyPropertyInPXL(uint24 propertyID, uint256 pxlValue) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
        
        //If they have no owner, do the PXL price and update it
        if (property.owner == 0) {
            property.salePrice = pricePxl;
            property.owner = owner;
            uint256 minPercent = pricePxl * PRICE_PXL_MIN_PERCENT / 100;
            pricePxl += (minPercent < PRICE_PXL_MIN_INCREASE) ? minPercent : PRICE_PXL_MIN_INCREASE;
        }
        
        require(property.salePrice <= pxlValue);
        require(balances[msg.sender] >= property.salePrice);
        
        uint256 amountTransfered = 0;
        amountTransfered = property.salePrice * USER_BUY_CUT_PERCENT / 100;
        
        
        balances[property.owner] += amountTransfered;
        balances[owner] += pxlValue - amountTransfered;
        
        property.salePrice = 0;
        property.owner = msg.sender;
        property.isInPrivateMode = false;
        
        PropertyBought(propertyID, property.owner);
        
        return true;
    }
    //Use Case: Buyer wants to buy a property.
    function buyPropertyInETH(uint24 propertyID) public validPropertyID(propertyID) payable returns(bool) {
        Property storage property = map[propertyID];
        
        require(property.owner == 0);
        require(msg.value >= priceEth);
        
        ownerEth += msg.value;
    
        uint256 minPercent = priceEth * PRICE_ETH_MIN_PERCENT / 100;
        priceEth += (minPercent < PRICE_ETH_MIN_INCREASE) ? minPercent : PRICE_ETH_MIN_INCREASE;
        
        property.owner = msg.sender;
        
        PropertyBought(propertyID, property.owner);
        
        return true;
    }
    
    //Use Case: Owner of a property lists for sale at a given price
    function listForSale(uint24 propertyID, uint128 price ) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
      
        require(price != 0);
      
        require(msg.sender == property.owner); //Must be the owner
        //You can listForSale an already listed item to update the listing
        property.salePrice = price;
        
        PropertySetForSale(propertyID);
        
        return true;
    }
    
    //Use Case: Owner of a property delists from both renting offer and sale offer
    function delist(uint24 propertyID) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
        
        require(msg.sender == property.owner); //Must be the owner
        
        property.salePrice = 0;
        
        DelistProperty(propertyID);
        
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

    //REMOVE BEFORE RELEASE
    function addCoin(address user, uint256 amount) public ownerOnly() {
        balances[user] += amount;
    }
}