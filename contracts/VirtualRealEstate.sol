pragma solidity ^0.4.2;

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
    
    mapping (uint24 => Property) map;
    mapping (address => uint256[2]) ownerLink;
    mapping (address => uint256[2]) ownerHoverText;
    mapping (address => uint32) moderators; // 0 = Not, 1 = nsfw-power, 2 = ban-power, 3 = set-moderator-level-power
    
    uint256 priceETH;
    uint256 PRICE_ETH_MIN_INCREASE = 1000;//10000000000000000000000; //0.0001 ETH
    uint256 PRICE_ETH_MIN_PERCENT = 20; //0.0001 ETH
    uint256 pricePPT;
    uint256 PRICE_PPT_MIN_INCREASE = 10;
    uint256 PRICE_PPT_MIN_PERCENT = 20;
    uint256 payoutInterval;
    
    uint256 USER_BUY_CUT_PERCENT = 98; //%
    
    uint256 PROPERTY_GENERATES_PER_MINUTE = 1;
    uint256 EXTRA_COLOR_SPEND_UNTIL;
    
    event PropertyColorUpdate(uint24 indexed property, uint256[10] colors, uint256 lastUpdate, address indexed lastUpdaterPayee, uint256 becomePublic);
    event PropertyBought(uint24 indexed property, address indexed newOwner, uint256 ethAmount, uint256 PPTAmount, uint256 timestamp);
    event SetUserHoverText(address indexed user, uint256[2] newHoverText);
    event SetUserSetLink(address indexed user, uint256[2] newLink);
    event PropertySetForSale(uint24 indexed property, uint256 forSalePrice);
    event DelistProperty(uint24 indexed property);
    event SetPropertyPublic(uint24 indexed property);
    event SetPropertyPrivate(uint24 indexed property, uint32 numMinutesPrivate);
    event Bid(uint24 indexed property, uint256 bid, uint256 timestamp);
    event Debug(uint256 num);
    
    struct Property {
        uint8 flag; //0 == none, 1 == nsfw, 2 == ban
        bool isInPrivateMode;
        address owner;
        address lastUpdater;
        uint256[10] colors; //10x10 rgb pixel colors per property
        uint256 salePrice;
        uint256 lastUpdate; //Last Update
        uint256 becomePublic;
        uint256 earnUntil;
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
        EXTRA_COLOR_SPEND_UNTIL = now + 3 days;
        pricePPT = 100;
        priceETH = 10000;//1000000000000000000; //0.001 ETH
        moderators[msg.sender] = 3;
        payoutInterval = (1 minutes);
    }
    function setFlag(uint24 propertyID, uint8 flag) public validPropertyID(propertyID)  {
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
    function setHoverText(uint256[2] text) public {
        ownerHoverText[msg.sender] = text;
        SetUserHoverText(msg.sender, text);
    }
    function setLink(uint256[2] link) public {
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
    function getHoverText(address user) public view returns(uint256[2]) {
        return ownerHoverText[user];
    }
    function getLink(address user) public view returns(uint256[2]) {
        return ownerLink[user];
    }
    
    function getPropertyColors(uint24 propertyID) public validPropertyID(propertyID) view returns(uint256[10]) {
        return map[propertyID].colors;
    }
    
    function getPropertyData(uint24 propertyID) public validPropertyID(propertyID) view returns(address, uint256, uint256, uint256, bool, uint256, uint32) {
        Property memory property = map[propertyID];
        if (property.owner == 0) {
            return (property.owner, priceETH, pricePPT, property.lastUpdate, property.isInPrivateMode, property.becomePublic, property.flag);
        } else {
            return (property.owner, 0, property.salePrice, property.lastUpdate, property.isInPrivateMode, property.becomePublic, property.flag);
        }
    }
    function tryForcePublic(uint24 propertyID) public validPropertyID(propertyID) {
        Property storage property = map[propertyID];
        //If its private when it shouldnt be
        if (property.isInPrivateMode && property.becomePublic < now) {
            property.isInPrivateMode = false;
        }
    }
    function _getProjectedPayout(Property memory property) private view returns(uint256) {
        if (!property.isInPrivateMode && property.lastUpdate != 0) {
            uint256 earnedUntil = (now < property.earnUntil) ? now : property.earnUntil;
            uint256 minutesSinceLastColourChange = (earnedUntil - property.lastUpdate) / payoutInterval;
            return minutesSinceLastColourChange * PROPERTY_GENERATES_PER_MINUTE;
        }
        return 0;
    }
    function getProjectedPayout(uint24 propertyID) public view returns(uint256) {
        Property memory property = map[propertyID];
        return _getProjectedPayout(property);
    }
    function isInGracePeriod() public view returns(bool) {
        return now <= EXTRA_COLOR_SPEND_UNTIL;
    }
    function _tryTriggerPayout(Property storage property, uint256 pptToSpend) private returns(bool) {
        if (property.isInPrivateMode && property.becomePublic < now) {//If its private when it shouldnt be
            property.isInPrivateMode = false;
        }
        if (property.isInPrivateMode) {
            require(msg.sender == property.owner);
            require(property.flag != 2);
        } else if (property.becomePublic < now) {
            uint256 pptSpent = pptToSpend + 1; //All pptSpent math uses N+1, so built in for convenience
            if (pptToSpend < 2 && isInGracePeriod()) { //If first 3 days and we spent <2 coins, treat it as if we spent 2
                pptSpent = 3; //We're treating it like 2, but it's N+1 in the math using this
            }
            require(balances[msg.sender] >= pptToSpend);
            balances[msg.sender] -= pptToSpend;
            totalSupply -= pptToSpend;
            uint256 payoutEach = _getProjectedPayout(property);
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
            property.becomePublic = now + (pptSpent * payoutInterval / 2); //(N+1)/2 minutes of user-private mode
            property.earnUntil = now + (pptSpent) * (pptSpent) * payoutInterval; //(N+1)^2 coins earned max/minutes we can earn from
        } else {
            return false;
        }
        property.lastUpdater = msg.sender;
        property.lastUpdate = now;
        return true;
    }
    //Change a 10x10 == 70 | 30 | 0 cost
    function setColors(uint24 propertyID, uint256[10] newColors, uint256 pptToSpend) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
        if (_tryTriggerPayout(property, pptToSpend)) {
            property.colors = newColors;
            PropertyColorUpdate(propertyID, newColors, now, property.lastUpdater, property.becomePublic);
            return true;
        }
        return false;
    }
    function setRowColors(uint24 propertyID, uint8 row, uint256 newColorData, uint256 pptToSpend) public validPropertyID(propertyID) returns(bool) {
        require(row < 10);
        Property storage property = map[propertyID];
        if (_tryTriggerPayout(property, pptToSpend)) {
            property.colors[row] = newColorData;
            PropertyColorUpdate(propertyID, property.colors, now, property.lastUpdater, property.becomePublic);
            return true;
        }
        return false;
    }
    //0, 1, 1
    function setPropertyMode(uint24 propertyID, bool setPrivateMode, uint32 numMinutesPrivate) public validPropertyID(propertyID) {
        Property storage property = map[propertyID];
        require(msg.sender == property.owner);
        if (setPrivateMode) {
            require(property.isInPrivateMode || property.becomePublic <= now); //If inprivate, we can extend, otherwise it must not be locked by someone else
            require(numMinutesPrivate > 0);
            require(balances[msg.sender] >= numMinutesPrivate);
            balances[msg.sender] -= numMinutesPrivate;
            totalSupply -= numMinutesPrivate;
            property.becomePublic = now + payoutInterval * numMinutesPrivate;
        } else {
            if (property.isInPrivateMode && property.becomePublic > now) { //becomePublic has to be bigger than now
                uint256 refundedAmount = (property.becomePublic - now) / payoutInterval;
                Debug(property.becomePublic);
                Debug(now);
                Debug(payoutInterval);
                Debug(refundedAmount);
                balances[msg.sender] += refundedAmount - 1;
                totalSupply += refundedAmount - 1;
            } else {
                Debug(5000);
            }
            property.becomePublic = 0;
        }
        property.isInPrivateMode = setPrivateMode;
        
        if (setPrivateMode) {
            SetPropertyPrivate(propertyID, numMinutesPrivate);
        } else {
            SetPropertyPublic(propertyID);
        }
    }
    function _transferProperty(Property storage property, uint24 propertyID, address newOwner, uint256 ethAmount, uint256 pptAmount, uint8 flag) private {
        require(newOwner != 0);
        property.owner = newOwner;
        property.salePrice = 0;
        property.isInPrivateMode = false;
        property.flag = flag;
        PropertyBought(propertyID, newOwner, ethAmount, pptAmount, now);
    }
    function transferProperty(uint24 propertyID, address newOwner) public validPropertyID(propertyID) returns(bool) {
        Property storage property = map[propertyID];
        require(property.owner == msg.sender);
        _transferProperty(property, propertyID, newOwner, 0, 0, property.flag);
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
        
        _transferProperty(property, propertyID, msg.sender, msg.value, PPTValue, 0);
        
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

        _transferProperty(property, propertyID, msg.sender, 0, property.salePrice, 0);
        
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
        
        _transferProperty(property, propertyID, msg.sender, msg.value, 0, 0);
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

    function makeBid(uint24 propertyID, uint256 bidAmount) public validPropertyID(propertyID) {
        require(bidAmount > 0);
        require(balances[msg.sender] >= 1 + bidAmount);
        Bid(propertyID, bidAmount, now);
        balances[msg.sender]--;
        totalSupply--;
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