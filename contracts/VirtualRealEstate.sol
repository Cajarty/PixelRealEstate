pragma solidity ^0.4.2;

// ERC20 Token Interface
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

// ERC20 Token Implementation
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

// PixelProperty
contract VirtualRealEstate is StandardToken {
    /* ### Variables ### */
    // Contract owner
    address owner;
    // Amount of ETH the contract owner is entitled to withdraw
    uint256 ownerEth = 0;
    // Mapping of PropertyID to Property
    mapping (uint16 => Property) properties;
    // Property Owner's website
    mapping (address => uint256[2]) ownerWebsite;
    // Property Owner's hover text
    mapping (address => uint256[2]) ownerHoverText;
    // A users moderation level
    mapping (address => uint32) moderators; // 0 = Not, 1 = nsfw-power, 2 = ban-power, 3 = set-moderator-level-power
    // The current system prices of ETH and PXL, for which unsold Properties are listed for sale at
    uint256 priceETH;
    uint256 pricePXL;
    // The amount for with ETH and PXL system prices increase
    uint256 PRICE_ETH_MIN_INCREASE = 1000;//10000000000000000000000; //0.0001 ETH
    uint256 PRICE_PXL_MIN_INCREASE = 10;
    uint8 PRICE_ETH_MIN_PERCENT = 20; //0.0001 ETH
    uint8 PRICE_PXL_MIN_PERCENT = 20;
    // The amount in % for which a user is paid
    uint8 USER_BUY_CUT_PERCENT = 98;
    // Maximum amount of generated PXL a property can give away per minute
    uint8 PROPERTY_GENERATES_PER_MINUTE = 1;
    // The point in time when the initial grace period is over, and users get the default values based on coins burned
    uint256 GRACE_PERIOD_END_TIMESTAMP;
    // The amount of time required for a Property to generate tokens for payouts
    uint256 PROPERTY_GENERATION_PAYOUT_INTERVAL = (1 minutes); //Generation amount

    /* ### Events ### */
    event PropertyColorUpdate(uint16 indexed property, uint256[10] colors, uint256 lastUpdate, address indexed lastUpdaterPayee, uint256 becomePublic);
    event PropertyBought(uint16 indexed property, address indexed newOwner, uint256 ethAmount, uint256 PXLAmount, uint256 timestamp);
    event SetUserHoverText(address indexed user, uint256[2] newHoverText);
    event SetUserSetLink(address indexed user, uint256[2] newLink);
    event PropertySetForSale(uint16 indexed property, uint256 forSalePrice);
    event DelistProperty(uint16 indexed property);
    event SetPropertyPublic(uint16 indexed property);
    event SetPropertyPrivate(uint16 indexed property, uint32 numMinutesPrivate);
    event Bid(uint16 indexed property, uint256 bid, uint256 timestamp);
    
    /* ### Ownable Property Structure ### */
    struct Property {
        uint8 flag; //0 == none, 1 == nsfw, 2 == ban
        bool isInPrivateMode; //Whether in private mode for owner-only use or free-use mode to be shared
        address owner; //Who owns the Property. If its zero (0), then no owner and known as a "system-Property"
        address lastUpdater; //Who last changed the color of the Property
        uint256[10] colors; //10x10 rgb pixel colors per property. colors[0] is the top row, colors[9] is the bottom row
        uint256 salePrice; //PXL price the owner has the Property on sale for. If zero, then its not for sale.
        uint256 lastUpdate; //Timestamp of when it had its color last updated
        uint256 becomePublic; //Timestamp on when to become public
        uint256 earnUntil; //Timestamp on when Property token generation will stop
    }
    
    /* ### MODIFIERS ### */

    // Only the contract owner can call these methods
    modifier ownerOnly() {
        require(owner == msg.sender);
        _;
    }
    
    // Can only be called on Properties referecing a valid PropertyID
    modifier validPropertyID(uint16 propertyID) {
        if (propertyID < 10000) {
            _;
        }
    }
    
    /* ### PUBLICALLY INVOKABLE FUNCTIONS ### */
    
    /* CONSTRUCTOR */
    function VirtualRealEstate() public {
        owner = msg.sender; // Default the owner to be whichever Ethereum account created the contract
        pricePXL = 100; //Initial PXL system price
        priceETH = 10000;//1000000000000000000; //0.001 ETH //Initial ETH system price
        moderators[msg.sender] = 3; // Set us, as contract owner, to be a full admin for moderation
        GRACE_PERIOD_END_TIMESTAMP = now + 3 days; // Give all users extra functionality for the first three days
    }
    
    /* MODERATOR FUNCTIONS */
    
    // Moderators use setFlag to flag Properties which may contain NSFW or bannable content
    function setFlag(uint16 propertyID, uint8 flag) public validPropertyID(propertyID)  {
        Property storage property = properties[propertyID];

        require(flag < 3);
        
        require(moderators[msg.sender] >= ((flag == 2) ? 2 : 1)); // Invoking moderator must be level 1 for NSFW or 2+ for ban
    
        // If its a ban instead of a flag, clear the content
        if (flag == 2) {
            require(property.isInPrivateMode); //Can't ban an owner's property if a public user caused the NSFW content
            property.colors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        property.flag = flag;
    }
    
    // Admins (moderator level 3's) can modify the moderation powers of any user
    function setModeratorLevel(address user, uint32 level) public {
        require(moderators[msg.sender] == 3);
        require(level < 4);
        require(user != 0);
        moderators[user] = level;
    }
    
    /* USER FUNCTIONS */
    
    // Property owners can change their hoverText for when a user mouses over their Properties
    function setHoverText(uint256[2] text) public {
        ownerHoverText[msg.sender] = text;
        SetUserHoverText(msg.sender, text);
    }
    
    // Property owners can change the clickable link for when a user clicks on their Properties
    function setLink(uint256[2] link) public {
        ownerWebsite[msg.sender] = link;
        SetUserSetLink(msg.sender, link);
    }
    
    // If a Property is private which has expired, make it public
    function tryForcePublic(uint16 propertyID) public validPropertyID(propertyID) {
        Property storage property = properties[propertyID];
        if (property.isInPrivateMode && property.becomePublic < now) {
            property.isInPrivateMode = false;
        }
    }
    
    // Update the 10x10 image data for a Property, triggering potential payouts if it succeeds
    function setColors(uint16 propertyID, uint256[10] newColors, uint256 PXLToSpend) public validPropertyID(propertyID) returns(bool) {
        Property storage property = properties[propertyID];
        bool firstSet = property.lastUpdater == 0;
        if (_tryTriggerPayout(property, PXLToSpend)) {
            property.colors = newColors;
            PropertyColorUpdate(propertyID, newColors, now, property.lastUpdater, property.becomePublic);
            // The first user to set a Properties color ever is awarded extra PXL due to eating the extra GAS cost of creating the uint256[10]
            if (firstSet) {
                //totalSupply += 25;
                //balances[msg.sender] += 25;
            }
            return true;
        }
        return false;
    }
    // Update a row of image data for a Property, triggering potential payouts if it succeeds
    function setRowColors(uint16 propertyID, uint8 row, uint256 newColorData, uint256 PXLToSpend) public validPropertyID(propertyID) returns(bool) {
        require(row < 10);
        Property storage property = properties[propertyID];
        if (_tryTriggerPayout(property, PXLToSpend)) {
            property.colors[row] = newColorData;
            PropertyColorUpdate(propertyID, property.colors, now, property.lastUpdater, property.becomePublic);
            return true;
        }
        return false;
    }
    // Property owners can toggle their Properties between private mode and free-use mode
    function setPropertyMode(uint16 propertyID, bool setPrivateMode, uint32 numMinutesPrivate) public validPropertyID(propertyID) {
        Property storage property = properties[propertyID];
        require(msg.sender == property.owner);
        if (setPrivateMode) {
            //If inprivate, we can extend the duration, otherwise if becomePublic > now it means a free-use user locked it
            require(property.isInPrivateMode || property.becomePublic <= now); 
            require(numMinutesPrivate > 0);
            require(balances[msg.sender] >= numMinutesPrivate);
            balances[msg.sender] -= numMinutesPrivate;
            totalSupply -= numMinutesPrivate;
            // Determines when the Property becomes public, one payout interval per coin burned
            property.becomePublic = now + PROPERTY_GENERATION_PAYOUT_INTERVAL * numMinutesPrivate;
        } else {
            // If its in private mode and still has time left, reimburse them for N-1 minutes tokens back
            if (property.isInPrivateMode && property.becomePublic > now) {
                uint256 refundedAmount = (property.becomePublic - now) / PROPERTY_GENERATION_PAYOUT_INTERVAL;
                balances[msg.sender] += refundedAmount - 1;
                totalSupply += refundedAmount - 1;
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
    // Transfer Property ownership between accounts. This has no cost, no cut and does not change flag status
    function transferProperty(uint16 propertyID, address newOwner) public validPropertyID(propertyID) returns(bool) {
        Property storage property = properties[propertyID];
        require(property.owner == msg.sender);
        _transferProperty(property, propertyID, newOwner, 0, 0, property.flag);
        return true;
    }
    // Purchase a unowned system-Property in a combination of PXL and ETH
    function buyProperty(uint16 propertyID, uint256 pxlValue) public validPropertyID(propertyID) payable returns(bool) {
        Property storage property = properties[propertyID];
        
        //Must be the first purchase, otherwise do it with PXL from another user
        require(property.owner == 0);
        // Must be able to afford the given PXL
        require(balances[msg.sender] >= pxlValue);
        require(pxlValue != 0);
        
        // Protect against underflow
        require(pxlValue <= pricePXL);
        uint256 pxlLeft = pricePXL - pxlValue;
        uint256 ethLeft = priceETH / pricePXL * pxlLeft;
        
        // Must have spent enough ETH to cover the ETH left after PXL price was subtracted
        require(msg.value >= ethLeft);
    
        balances[owner] += pxlValue;
        balances[msg.sender] -= pxlValue;

        uint256 minPercent = pricePXL * PRICE_PXL_MIN_PERCENT / 100;
        pricePXL += ((minPercent < PRICE_PXL_MIN_INCREASE) ? minPercent : PRICE_PXL_MIN_INCREASE) * pxlValue / pricePXL;

        ownerEth += msg.value;
        minPercent = priceETH * PRICE_ETH_MIN_PERCENT / 100;
        priceETH += ((minPercent < PRICE_ETH_MIN_INCREASE) ? minPercent : PRICE_ETH_MIN_INCREASE) * pxlLeft / pricePXL;
        
        _transferProperty(property, propertyID, msg.sender, msg.value, pxlValue, 0);
        
        return true;
    }
    // Purchase a listed user-owner Property in PXL
    function buyPropertyInPXL(uint16 propertyID, uint256 PXLValue) public validPropertyID(propertyID) returns(bool) {
        Property storage property = properties[propertyID];
        
        // If Property is system-owned
        if (property.owner == 0) {
            // Turn it into a user-owned at system price with contract owner as owner
            property.salePrice = pricePXL;
            property.owner = owner;
            // Increase system PXL price
            uint256 minPercent = pricePXL * PRICE_PXL_MIN_PERCENT / 100;
            pricePXL += (minPercent < PRICE_PXL_MIN_INCREASE) ? minPercent : PRICE_PXL_MIN_INCREASE;
        }
        
        require(property.salePrice <= PXLValue);
        require(balances[msg.sender] >= property.salePrice);
        
        uint256 amountTransfered = 0;
        amountTransfered = property.salePrice * USER_BUY_CUT_PERCENT / 100;
        
        balances[msg.sender] -= amountTransfered;
        balances[property.owner] += amountTransfered;
        balances[owner] += PXLValue - amountTransfered;

        _transferProperty(property, propertyID, msg.sender, 0, property.salePrice, 0);
        
        return true;
    }
    // Purchase a system-Property in pure ETH
    function buyPropertyInETH(uint16 propertyID) public validPropertyID(propertyID) payable returns(bool) {
        Property storage property = properties[propertyID];
        
        require(property.owner == 0);
        require(msg.value >= priceETH);
        
        ownerEth += msg.value;
    
        uint256 minPercent = priceETH * PRICE_ETH_MIN_PERCENT / 100;
        priceETH += (minPercent < PRICE_ETH_MIN_INCREASE) ? minPercent : PRICE_ETH_MIN_INCREASE;
        
        _transferProperty(property, propertyID, msg.sender, msg.value, 0, 0);
        return true;
    }
    
    // Property owner lists their Property for sale at their preferred price
    function listForSale(uint16 propertyID, uint256 price ) public validPropertyID(propertyID) returns(bool) {
        Property storage property = properties[propertyID];
      
        require(price != 0);
        require(msg.sender == property.owner);
        
        property.salePrice = price;
        
        PropertySetForSale(propertyID, property.salePrice);
        
        return true;
    }
    
    // Property owner delists their Property from being for sale
    function delist(uint16 propertyID) public validPropertyID(propertyID) returns(bool) {
        Property storage property = properties[propertyID];
        
        require(msg.sender == property.owner); //Must be the owner

        property.salePrice = 0;
        
        DelistProperty(propertyID);
        
        return true;
    }

    // Make a public bid and notify a Property owner of your bid. Burn 1 coin
    function makeBid(uint16 propertyID, uint256 bidAmount) public validPropertyID(propertyID) {
        require(bidAmount > 0);
        require(balances[msg.sender] >= 1 + bidAmount);
        Bid(propertyID, bidAmount, now);
        balances[msg.sender]--;
        totalSupply--;
    }
    
    /* CONTRACT OWNER FUNCTIONS */
    
    // Contract owner can withdraw up to ownerEth amount
    function withdraw(uint256 amount) public ownerOnly() {
        if (amount <= ownerEth) {
            owner.transfer(amount);
        }
    }
    
    // Contract owner can withdraw ownerEth amount
    function withdrawAll() public ownerOnly() {
        owner.transfer(ownerEth);
    }
    
    // Contract owner can change who is the contract owner
    function changeOwners(address newOwner) public ownerOnly() {
        owner = newOwner;
    }
    
    /* ## PRIVATE FUNCTIONS ## */
    
    // Function which wraps payouts for setColors
    function _tryTriggerPayout(Property storage property, uint256 pxlToSpend) private returns(bool) {
        //If the Property is in private mode and expired, make it public
        if (property.isInPrivateMode && property.becomePublic < now) {
            property.isInPrivateMode = false;
        }
        //If its in public mode, only the owner can interact with it
        if (property.isInPrivateMode) {
            require(msg.sender == property.owner);
            require(property.flag != 2);
        //If if its in free-use mode
        } else if (property.becomePublic < now) {
            uint256 pxlSpent = pxlToSpend + 1; //All pxlSpent math uses N+1, so built in for convenience
            if (pxlToSpend < 2 && isInGracePeriod()) { //If first 3 days and we spent <2 coins, treat it as if we spent 2
                pxlSpent = 3; //We're treating it like 2, but it's N+1 in the math using this
            }
            require(balances[msg.sender] >= pxlToSpend);
            balances[msg.sender] -= pxlToSpend;
            totalSupply -= pxlToSpend;
            //Get the amount of generated PXL for this trigger
            uint256 payoutEach = _getProjectedPayout(property);
            if (payoutEach > 0) {
                if (property.lastUpdater != 0) {
                    //Payout lastUpdater
                    balances[property.lastUpdater] += payoutEach;
                    totalSupply += payoutEach;
                }
                if (property.owner != 0) {
                    //Payout the owner of the Property
                    balances[property.owner] += payoutEach;
                    totalSupply += payoutEach;
                }
            }
            property.becomePublic = now + (pxlSpent * PROPERTY_GENERATION_PAYOUT_INTERVAL / 2); //(N+1)/2 minutes of user-private mode
            property.earnUntil = now + (pxlSpent) * (pxlSpent) * PROPERTY_GENERATION_PAYOUT_INTERVAL; //(N+1)^2 coins earned max/minutes we can earn from
        } else {
            return false;
        }
        property.lastUpdater = msg.sender;
        property.lastUpdate = now;
        return true;
    }
    // Transfer ownership of a Property and reset their info
    function _transferProperty(Property storage property, uint16 propertyID, address newOwner, uint256 ethAmount, uint256 PXLAmount, uint8 flag) private {
        require(newOwner != 0);
        property.owner = newOwner;
        property.salePrice = 0;
        property.isInPrivateMode = false;
        property.flag = flag;
        PropertyBought(propertyID, newOwner, ethAmount, PXLAmount, now);
    }
    
    /* ## VIEWS ## */
    // Gets an owners hover text when a user hovers over their Property
    function getHoverText(address user) public view returns(uint256[2]) {
        return ownerHoverText[user];
    }
    
    // Gets an owners website for when a user clicks on their Property
    function getLink(address user) public view returns(uint256[2]) {
        return ownerWebsite[user];
    }
    
    // Gets the current RGB colors of a Property
    function getPropertyColors(uint16 propertyID) public validPropertyID(propertyID) view returns(uint256[10]) {
        return properties[propertyID].colors;
    }
    
    // Gets the (owners address, Ethereum sale price, PXL sale price, last update timestamp, whether its in private mode or not, when it becomes public timestamp, flag) for a Property
    function getPropertyData(uint16 propertyID) public validPropertyID(propertyID) view returns(address, uint256, uint256, uint256, bool, uint256, uint32) {
        Property memory property = properties[propertyID];
        bool isInPrivateMode = property.isInPrivateMode;
        //If it's in private, but it has expired and should be public, set our bool to be public
        if (isInPrivateMode && property.becomePublic <= now) { 
            isInPrivateMode = false;
        }
        if (property.owner == 0) {
            return (property.owner, priceETH, pricePXL, property.lastUpdate, isInPrivateMode, property.becomePublic, property.flag);
        } else {
            return (property.owner, 0, property.salePrice, property.lastUpdate, isInPrivateMode, property.becomePublic, property.flag);
        }
    }
    
    // Gets the system ETH and PXL prices
    function getSystemSalePrices() public view returns(uint256, uint256) {
        return (priceETH, pricePXL);
    }
    
    // Gets the sale prices of any Property in ETH and PXL
    function getForSalePrices(uint16 propertyID) public validPropertyID(propertyID) view returns(uint256, uint256) {
        Property storage property = properties[propertyID];
        if (property.owner == 0) {
            return getSystemSalePrices();
        } else {
            return (0, property.salePrice);
        }
    }
    
    // Gets the projected sale price for a property should it be triggered at this very moment
    function getProjectedPayout(uint16 propertyID) public view returns(uint256) {
        Property memory property = properties[propertyID];
        return _getProjectedPayout(property);
    }
    
    // Gets the projected sale price for a property should it be triggered at this very moment
    function _getProjectedPayout(Property memory property) private view returns(uint256) {
        if (!property.isInPrivateMode && property.lastUpdate != 0) {
            uint256 earnedUntil = (now < property.earnUntil) ? now : property.earnUntil;
            uint256 minutesSinceLastColourChange = (earnedUntil - property.lastUpdate) / PROPERTY_GENERATION_PAYOUT_INTERVAL;
            return minutesSinceLastColourChange * PROPERTY_GENERATES_PER_MINUTE;
        }
        return 0;
    }
    
    // Gets whether the contract is still in the intial grace period where we give extra features to color setters
    function isInGracePeriod() public view returns(bool) {
        return now <= GRACE_PERIOD_END_TIMESTAMP;
    }
    
    ////////////////////////////////////////////////
    ///TODO: TESTING ONLY: REMOVE BEFORE RELEASE:///
    ////////////////////////////////////////////////
    function addCoin(address user, uint256 amount) public ownerOnly() {
        require(msg.sender == owner);
        balances[user] += amount;
    }
}