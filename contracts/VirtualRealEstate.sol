pragma solidity ^0.4.2;

/*
ToDo:
- ##Users pay however much they want, no requirement on cost
- ##Users can earn earnings on a property for up to (N+1)^2 minutes
- ##Users get private use of a property for N/2 minutes
- ##Owners in private mode costs 1 coins a minute
- ##Timer is now 2 coins a second not 2 coins a hour
- ##No free mode during the first 3 days, but "increased earnings" paying zero or 1 coin is treated like 2 coins
    - ##So for the first 3 days, setting it for free gets it set to private for 1 minute and earns you 1->9 coins [Validate with Jaegar first]
- ##Property prices start at 0.005 ETH and 100 PPT
- ##Make sure total circulating supply actually is calculated right. Unit test that plz
- Make getHoverText and getLink use a different data type
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
    
    //Mapping of propertyID to property
    mapping (uint24 => Property) map;
    //propertyOwner to link
    mapping (address => byte[64]) ownerLink;
    //propertyRenter to link
    mapping (address => byte[64]) ownerHoverText;
    mapping (address => uint32) moderators; // 0 = Not, 1 = nsfw-power, 2 = ban-power, 3 = set-moderator-level-power
    
    uint256 priceETH;
    uint256 PRICE_ETH_MIN_INCREASE = 1000;//10000000000000000000000; //0.0001 ETH
    uint256 PRICE_ETH_MIN_PERCENT = 20; //0.0001 ETH
    uint256 pricePPT;
    uint256 PRICE_PPT_MIN_INCREASE = 10;
    uint256 PRICE_PPT_MIN_PERCENT = 20;
    
    uint256 USER_BUY_CUT_PERCENT = 98; //%
    
    uint256 PROPERTY_GENERATES_PER_MINUTE = 1;
    uint256 FREE_COLOR_SETTING_UNTIL;
    
    event PropertyColorUpdate(uint24 indexed property, uint256[10] colors, uint256 lastUpdate, address lastUpdaterPayee);
    event PropertyColorUpdatePixel(uint24 indexed property, uint8 row, uint24 rgb);
    event PropertyBought(uint24 indexed property,  address newOwner, uint256 ethAmount, uint256 PPTAmount, uint256 timestamp); //Added ethAmount, PPTAmount and timestamp
    event SetUserHoverText(address indexed user, byte[64] newHoverText);
    event SetUserSetLink(address indexed user, byte[64] newLink);
    event PropertySetForSale(uint24 indexed property, uint256 forSalePrice);
    event DelistProperty(uint24 indexed property);
    event SetPropertyPublic(uint24 indexed property);
    event SetPropertyPrivate(uint24 indexed property, uint32 numMinutesPrivate);
    
    struct TradeOffer {
        uint256 ethPer;
        uint256 PPTAmount;
        bool buyingPPT;
    }
    
    struct Property {
        address owner;
        uint256[10] colors; //10x10 rgb pixel colors per property
        uint256 salePrice;
        address lastUpdater;
        bool isInPrivateMode;
        uint256 lastUpdate; //Last Update
        uint256 becomePublic;
        uint256 earnUntil;
        uint32 flag; //0 == none, 1 == nsfw, 2 == ban
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
        FREE_COLOR_SETTING_UNTIL = now;// + 1 days;
        pricePPT = 100;
        priceETH = 10000;//1000000000000000000; //0.001 ETH
        moderators[msg.sender] = 3;
    }
    function setFlag(uint24 propertyID, uint32 flag) public validPropertyID(propertyID)  {
        Property storage property = map[propertyID];

        require(flag < 3);

        uint256 moderationLevel = moderators[msg.sender];
        require(moderationLevel >= 1); //Must be moderator or higher
    
        if (flag == 2) { //If ban, must be higher than nsfw
            require(moderationLevel >= 2);
            require(property.isInPrivateMode); //Can't ban an owner's property if a public user did it
            property.colors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        property.flag = flag;
    }
    function setHoverText(byte[64] text) public {
        ownerHoverText[msg.sender] = text;
        SetUserHoverText(msg.sender, text);
    }
    function setLink(byte[64] link) public {
        ownerLink[msg.sender] = link;
        SetUserSetLink(msg.sender, link);
    }
    function getSystemSalePrices() public view returns(uint256, uint256) {
        return (priceETH, pricePPT);
    }
    function getForSalePrices(uint24 propertyID) public validPropertyID(propertyID) view returns(uint256, uint256) {
        Property storage property = map[propertyID];
        if (property.owner == 0) {
            return (priceETH, pricePPT);
        } else {
            return (0, property.salePrice);
        }
    }
    function getHoverText(address user) public view returns(byte[64]) {
        return ownerHoverText[user];
    }
    function getLink(address user) public view returns(byte[64]) {
        return ownerLink[user];
    }
    
    function getPropertyColors(uint24 propertyID) public validPropertyID(propertyID) view returns(uint256[10]) {
        return map[propertyID].colors;
    }
    
    function getPropertyData(uint24 propertyID) public validPropertyID(propertyID) view returns(address, uint256, uint256, uint256, bool) {
        Property storage property = map[propertyID];
        if (property.owner == 0) {
            return (property.owner, priceETH, pricePPT, property.lastUpdate, property.isInPrivateMode);
        } else {
            return (property.owner, 0, property.salePrice, property.lastUpdate, property.isInPrivateMode);
        }
    }
    function tryForcePublic(uint24 propertyID) public validPropertyID(propertyID) {
        Property storage property = map[propertyID];
        //If its private when it shouldnt be
        if (property.isInPrivateMode && property.becomePublic < now) {
            property.isInPrivateMode = false;
        }
    }
    function getProjectedPayout(uint24 propertyID) public view returns(uint256) {
        Property storage property = map[propertyID];
        if (!property.isInPrivateMode && property.lastUpdate != 0) {
            uint256 minutesSinceLastColourChange = (now - property.lastUpdate) / (1 seconds); //ERRORs on property.lastUpdate = 0
            return minutesSinceLastColourChange * PROPERTY_GENERATES_PER_MINUTE;
        }
        return 0;
    }
    //Change a 10x10 == 70 | 30 | 0 cost
    function setColors(uint24 propertyID, uint256[10] newColors, uint256 pptToSpend) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];

        tryForcePublic(propertyID);
        
        uint256 pptSpent = pptToSpend;

        //If first 3 days and we spent <2 coins, treat it as if we spent 2
        if (now <= FREE_COLOR_SETTING_UNTIL && pptSpent < 2) { 
            pptSpent = 2;
        }
        //If we are in the first 3 days, set pptToSpend to = 2, but don't charge them. Maybe give them the amount they don't have to subtract later?

        bool updateOccured = false;

        if (property.isInPrivateMode) {
            require(msg.sender == property.owner);
            require(property.flag != 2);
            //TODO: What if a owner tries to set a property which is locked by a Free-Use user?
            updateOccured = true;
        } else if (property.becomePublic < now) {
            require(balances[msg.sender] >= pptToSpend);
            uint256 minutesOfEarning = (pptSpent + 1) * (pptSpent + 1) * (1 seconds); //(N+1)^2 coins earned max/minutes we can earn from
            uint256 minutesOfLock = (pptSpent / 2) * (1 seconds); //N/2 minutes of user-private mode
            balances[msg.sender] -= pptToSpend;
            totalSupply -= pptToSpend;
            uint256 payoutEach = getProjectedPayout(propertyID);
            if (payoutEach > 0) {
                if (property.lastUpdater != 0) {
                    balances[property.lastUpdater] += payoutEach;
                    totalSupply += payoutEach;
                }
                if (property.owner != 0) {
                    balances[property.owner] += payoutEach;
                    totalSupply += payoutEach;
                }
            }
            updateOccured = true;
            property.becomePublic = now + minutesOfLock;
            property.earnUntil = now + minutesOfEarning;
        }
        
        if (updateOccured) {
            PropertyColorUpdate(propertyID, newColors, now, property.lastUpdater);
            property.colors = newColors;
            property.lastUpdater = msg.sender;
            property.lastUpdate = now;
        }
        return updateOccured;
    }
    function setPropertyMode(uint24 propertyID, bool isInPrivateMode, uint32 numMinutesPrivate) public validPropertyID(propertyID) {
        Property storage property = map[propertyID];
        require(msg.sender == property.owner);
        if (isInPrivateMode) {
            require(numMinutesPrivate > 0);
            require(balances[msg.sender] >= numMinutesPrivate);
            balances[msg.sender] -= numMinutesPrivate;
            totalSupply -= numMinutesPrivate;
            property.becomePublic = now + (1 seconds) * numMinutesPrivate;
        } else {
            property.becomePublic = 0;
        }
        property.isInPrivateMode = isInPrivateMode;
        
        if (isInPrivateMode) {
            SetPropertyPrivate(propertyID, numMinutesPrivate);
        } else {
            SetPropertyPublic(propertyID);
        }
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

        PropertyBought(propertyID, newOwner, 0, 0, now);
        
        return true;
    }
    function buyProperty(uint24 propertyID, uint256 PPTValue) public validPropertyID(propertyID) payable returns(bool) {
        Property storage property = map[propertyID];
        
        //Must be the first purchase, otherwise do it with PPT
        require(property.owner == 0);
        //Required to avoid underflowing (pricePPT - PPTValue)
        require(PPTValue <= pricePPT);
        require(balances[msg.sender] >= PPTValue);
        require(PPTValue != 0);
        
        uint256 PPTLeft = pricePPT - PPTValue;
        uint256 ethLeft = priceETH / pricePPT * PPTLeft;
        
        require(msg.value >= ethLeft);
    
        balances[owner] += PPTValue;
        balances[msg.sender] -= PPTValue;

        uint256 minPercent = pricePPT * PRICE_PPT_MIN_PERCENT / 100;
        pricePPT += ((minPercent < PRICE_PPT_MIN_INCREASE) ? minPercent : PRICE_PPT_MIN_INCREASE) * PPTValue / pricePPT;

        ownerEth += msg.value;
        minPercent = priceETH * PRICE_ETH_MIN_PERCENT / 100;
        priceETH += ((minPercent < PRICE_ETH_MIN_INCREASE) ? minPercent : PRICE_ETH_MIN_INCREASE) * PPTLeft / PPTValue;
        
        property.owner = msg.sender;
        
        PropertyBought(propertyID, property.owner, msg.value, PPTValue, now);

        property.owner = msg.sender;
        property.flag = 0;
        
        return true;
    }
    function buyPropertyInPPT(uint24 propertyID, uint256 PPTValue) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
        
        //If they have no owner, do the PPT price and update it
        if (property.owner == 0) {
            property.salePrice = pricePPT;
            property.owner = owner;
            uint256 minPercent = pricePPT * PRICE_PPT_MIN_PERCENT / 100;
            pricePPT += (minPercent < PRICE_PPT_MIN_INCREASE) ? minPercent : PRICE_PPT_MIN_INCREASE;
        }
        
        require(property.salePrice <= PPTValue);
        require(balances[msg.sender] >= property.salePrice);
        
        uint256 amountTransfered = 0;
        amountTransfered = property.salePrice * USER_BUY_CUT_PERCENT / 100;
        
        balances[msg.sender] -= amountTransfered;
        balances[property.owner] += amountTransfered;
        balances[owner] += PPTValue - amountTransfered;
        
        PropertyBought(propertyID, property.owner, 0, property.salePrice, now);

        property.salePrice = 0;
        property.owner = msg.sender;
        property.isInPrivateMode = false;
        property.flag = 0;
        
        return true;
    }
    //Use Case: Buyer wants to buy a property.
    function buyPropertyInETH(uint24 propertyID) public validPropertyID(propertyID) payable returns(bool) {
        Property storage property = map[propertyID];
        
        require(property.owner == 0);
        require(msg.value >= priceETH);
        
        ownerEth += msg.value;
    
        uint256 minPercent = priceETH * PRICE_ETH_MIN_PERCENT / 100;
        priceETH += (minPercent < PRICE_ETH_MIN_INCREASE) ? minPercent : PRICE_ETH_MIN_INCREASE;
        
        property.owner = msg.sender;
        
        PropertyBought(propertyID, property.owner, msg.value, 0, now);
        property.flag = 0;
        
        return true;
    }
    
    //Use Case: Owner of a property lists for sale at a given price
    function listForSale(uint24 propertyID, uint128 price ) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
      
        require(price != 0);
      
        require(msg.sender == property.owner); //Must be the owner
        //You can listForSale an already listed item to update the listing
        property.salePrice = price;
        
        PropertySetForSale(propertyID, property.salePrice);
        
        return true;
    }
    
    //Use Case: Owner of a property delists from sale offer
    function delist(uint24 propertyID) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
        
        require(msg.sender == property.owner); //Must be the owner

        property.salePrice = 0;
        
        DelistProperty(propertyID);
        
        return true;
    }
    function setModeratorLevel(address user, uint32 level) public {
        require(moderators[msg.sender] == 3);
        require(level < 4);
        require(user != 0);
        moderators[user] = level;
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
    
    ////////////////////////////////////////////////
    ///TODO: TESTING ONLY: REMOVE BEFORE RELEASE:///
    ////////////////////////////////////////////////
    function addCoin(address user, uint256 amount) public ownerOnly() {
        require(msg.sender == owner);
        balances[user] += amount;
    }
}