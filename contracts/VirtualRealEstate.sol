pragma solidity ^0.4.2;
import "./PXLProperty.sol";

// PixelProperty
contract VirtualRealEstate {
    /* ### Variables ### */
    // Contract owner
    address owner;
    PXLProperty pxlProperty;
    
    mapping (uint16 => bool) hasBeenSet;
    
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
    uint256 PROPERTY_GENERATION_PAYOUT_INTERVAL = (1 seconds); //Generation amount
    
    uint256 ownerEth = 0; // Amount of ETH the contract owner is entitled to withdraw (only Root account can do withdraws)
    
    // The current system prices of ETH and PXL, for which unsold Properties are listed for sale at
    uint256 systemSalePriceETH;
    uint256 systemSalePricePXL;

    /* ### Events ### */
    event PropertyColorUpdate(uint16 indexed property, uint256[10] colors, uint256 lastUpdate, address indexed lastUpdaterPayee, uint256 becomePublic, uint256 indexed rewardedCoins);
    event PropertyBought(uint16 indexed property, address indexed newOwner, uint256 ethAmount, uint256 PXLAmount, uint256 timestamp, address indexed oldOwner);
    event SetUserHoverText(address indexed user, uint256[2] newHoverText);
    event SetUserSetLink(address indexed user, uint256[2] newLink);
    event PropertySetForSale(uint16 indexed property, uint256 forSalePrice);
    event DelistProperty(uint16 indexed property);
    event SetPropertyPublic(uint16 indexed property);
    event SetPropertyPrivate(uint16 indexed property, uint32 numMinutesPrivate, address indexed rewardedUser, uint256 indexed rewardedCoins);
    event Bid(uint16 indexed property, uint256 bid, uint256 timestamp);
    
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
        systemSalePricePXL = 100; //Initial PXL system price
        systemSalePriceETH = 10000;//1000000000000000000; //0.001 ETH //Initial ETH system price
        GRACE_PERIOD_END_TIMESTAMP = now + 3 days; // Give all users extra functionality for the first three days
    }
    
    function setPXLPropertyContract(address pxlPropertyContract) public ownerOnly() {
        pxlProperty = PXLProperty(pxlPropertyContract);
    }
    
    /* USER FUNCTIONS */
    
    // Property owners can change their hoverText for when a user mouses over their Properties
    function setHoverText(uint256[2] text) public {
        pxlProperty.setOwnerHoverText(msg.sender, text);
        SetUserHoverText(msg.sender, text);
    }
    
    // Property owners can change the clickable link for when a user clicks on their Properties
    function setLink(uint256[2] website) public {
        pxlProperty.setOwnerLink(msg.sender, website);
        SetUserSetLink(msg.sender, website);
    }
    
    // If a Property is private which has expired, make it public
    function tryForcePublic(uint16 propertyID) public validPropertyID(propertyID) {
        var (isInPrivateMode, becomePublic) = pxlProperty.getPropertyPrivateModeBecomePublic(propertyID);
        if (isInPrivateMode && becomePublic < now) {
            pxlProperty.setPropertyPrivateMode(propertyID, false);
        }
    }
    
    // Update the 10x10 image data for a Property, triggering potential payouts if it succeeds
    function setColors(uint16 propertyID, uint256[10] newColors, uint256 PXLToSpend) public validPropertyID(propertyID) returns(bool) {
        uint256 projectedPayout = getProjectedPayout(propertyID);
        if (_tryTriggerPayout(propertyID, PXLToSpend)) {
            pxlProperty.setPropertyColors(propertyID, newColors);
            var (lastUpdater, becomePublic) = pxlProperty.getPropertyLastUpdaterBecomePublic(propertyID);
            PropertyColorUpdate(propertyID, newColors, now, lastUpdater, becomePublic, projectedPayout);
            // The first user to set a Properties color ever is awarded extra PXL due to eating the extra GAS cost of creating the uint256[10]
            if (!hasBeenSet[propertyID]) {
                pxlProperty.rewardPXL(msg.sender, 25);
                hasBeenSet[propertyID] = true;
            }
            return true;
        }
        return false;
    }
    
    // Update a row of image data for a Property, triggering potential payouts if it succeeds
    function setRowColors(uint16 propertyID, uint8 row, uint256 newColorData, uint256 PXLToSpend) public validPropertyID(propertyID) returns(bool) {
        require(row < 10);
        uint256 projectedPayout = getProjectedPayout(propertyID);
        if (_tryTriggerPayout(propertyID, PXLToSpend)) {
            pxlProperty.setPropertyRowColor(propertyID, row, newColorData);
            var (lastUpdater, becomePublic) = pxlProperty.getPropertyLastUpdaterBecomePublic(propertyID);
            PropertyColorUpdate(propertyID, pxlProperty.getPropertyColors(propertyID), now, lastUpdater, becomePublic, projectedPayout);
            return true;
        }
        return false;
    }
    // Property owners can toggle their Properties between private mode and free-use mode
    function setPropertyMode(uint16 propertyID, bool setPrivateMode, uint32 numMinutesPrivate) public validPropertyID(propertyID) {
        var (propertyFlag, propertyIsInPrivateMode, propertyOwner, propertyLastUpdater, propertySalePrice, propertyLastUpdate, propertyBecomePublic, propertyEarnUntil) = pxlProperty.properties(propertyID);
        
        require(msg.sender == propertyOwner);
        uint256 whenToBecomePublic = 0;
        uint256 rewardedAmount = 0;
        
        if (setPrivateMode) {
            //If inprivate, we can extend the duration, otherwise if becomePublic > now it means a free-use user locked it
            require(propertyIsInPrivateMode || propertyBecomePublic <= now || propertyLastUpdater == msg.sender ); 
            require(numMinutesPrivate > 0);
            require(pxlProperty.balanceOf(msg.sender) >= numMinutesPrivate);
            pxlProperty.burnPXL(msg.sender, numMinutesPrivate);
            // Determines when the Property becomes public, one payout interval per coin burned
            whenToBecomePublic = now + PROPERTY_GENERATION_PAYOUT_INTERVAL * numMinutesPrivate;

            rewardedAmount = getProjectedPayout(propertyIsInPrivateMode, propertyLastUpdate, propertyEarnUntil);
            if (rewardedAmount > 0 && propertyLastUpdater != 0) {
                pxlProperty.rewardPXL(propertyLastUpdater, rewardedAmount);
                pxlProperty.rewardPXL(msg.sender, rewardedAmount);
            }

        } else {
            // If its in private mode and still has time left, reimburse them for N-1 minutes tokens back
            if (propertyIsInPrivateMode && propertyBecomePublic > now) {
                pxlProperty.rewardPXL(msg.sender, ((propertyBecomePublic - now) / PROPERTY_GENERATION_PAYOUT_INTERVAL) - 1);
            }
        }
        
        pxlProperty.setPropertyPrivateModeEarnUntilLastUpdateBecomePublic(propertyID, setPrivateMode, 0, 0, whenToBecomePublic);
        
        if (setPrivateMode) {
            SetPropertyPrivate(propertyID, numMinutesPrivate, propertyLastUpdater, rewardedAmount);
        } else {
            SetPropertyPublic(propertyID);
        }
    }
    // Transfer Property ownership between accounts. This has no cost, no cut and does not change flag status
    function transferProperty(uint16 propertyID, address newOwner) public validPropertyID(propertyID) returns(bool) {
        require(pxlProperty.getPropertyOwner(propertyID) == msg.sender);
        _transferProperty(propertyID, newOwner, 0, 0, pxlProperty.getPropertyFlag(propertyID), msg.sender);
        return true;
    }
    // Purchase a unowned system-Property in a combination of PXL and ETH
    function buyProperty(uint16 propertyID, uint256 pxlValue) public validPropertyID(propertyID) payable returns(bool) {
        //Must be the first purchase, otherwise do it with PXL from another user
        require(pxlProperty.getPropertyOwner(propertyID) == 0);
        // Must be able to afford the given PXL
        require(pxlProperty.balanceOf(msg.sender) >= pxlValue);
        require(pxlValue != 0);
        
        // Protect against underflow
        require(pxlValue <= systemSalePricePXL);
        uint256 pxlLeft = systemSalePricePXL - pxlValue;
        uint256 ethLeft = systemSalePriceETH / systemSalePricePXL * pxlLeft;
        
        // Must have spent enough ETH to cover the ETH left after PXL price was subtracted
        require(msg.value >= ethLeft);
        
        pxlProperty.rewardPXL(owner, pxlValue);
        pxlProperty.burnPXL(msg.sender, pxlValue);
        
        uint256 minPercent = systemSalePricePXL * PRICE_PXL_MIN_PERCENT / 100;
        systemSalePricePXL += ((minPercent < PRICE_PXL_MIN_INCREASE) ? minPercent : PRICE_PXL_MIN_INCREASE) * pxlValue / systemSalePricePXL;

        ownerEth += msg.value;
        minPercent = systemSalePriceETH * PRICE_ETH_MIN_PERCENT / 100;
        systemSalePriceETH += ((minPercent < PRICE_ETH_MIN_INCREASE) ? minPercent : PRICE_ETH_MIN_INCREASE) * pxlLeft / systemSalePricePXL;
        
        _transferProperty(propertyID, msg.sender, msg.value, pxlValue, 0, 0);
        
        return true;
    }
    // Purchase a listed user-owner Property in PXL
    function buyPropertyInPXL(uint16 propertyID, uint256 PXLValue) public validPropertyID(propertyID) {
        // If Property is system-owned
        var (propertyOwner, propertySalePrice) = pxlProperty.getPropertyOwnerSalePrice(propertyID);
        address originalOwner = propertyOwner;
        if (propertyOwner == 0) {
            // Turn it into a user-owned at system price with contract owner as owner
            pxlProperty.setPropertySalePrice(propertyID, systemSalePricePXL);
            pxlProperty.setPropertyOwner(propertyID, owner);
            propertyOwner = owner;
            propertySalePrice = systemSalePricePXL;
            // Increase system PXL price
            uint256 minPercent = systemSalePricePXL * PRICE_PXL_MIN_PERCENT / 100;
            systemSalePricePXL += (minPercent < PRICE_PXL_MIN_INCREASE) ? minPercent : PRICE_PXL_MIN_INCREASE;
        }
        require(pxlProperty.getPropertySalePrice(propertyID) <= PXLValue);
        require(pxlProperty.balanceOf(msg.sender) >= propertySalePrice);
        uint256 amountTransfered = 0;
        amountTransfered = propertySalePrice * USER_BUY_CUT_PERCENT / 100;
        pxlProperty.burnPXL(msg.sender, propertySalePrice);
        pxlProperty.rewardPXL(propertyOwner, amountTransfered);
        pxlProperty.rewardPXL(owner, propertySalePrice - amountTransfered);
        _transferProperty(propertyID, msg.sender, 0, propertySalePrice, 0, originalOwner);
    }

    // Purchase a system-Property in pure ETH
    function buyPropertyInETH(uint16 propertyID) public validPropertyID(propertyID) payable returns(bool) {
        require(pxlProperty.getPropertyOwner(propertyID) == 0);
        require(msg.value >= systemSalePriceETH);
        
        ownerEth += msg.value;
    
        uint256 minPercent = systemSalePriceETH * PRICE_ETH_MIN_PERCENT / 100;
        systemSalePriceETH += (minPercent < PRICE_ETH_MIN_INCREASE) ? minPercent : PRICE_ETH_MIN_INCREASE;
        _transferProperty(propertyID, msg.sender, msg.value, 0, 0, 0);
        return true;
    }
    
    // Property owner lists their Property for sale at their preferred price
    function listForSale(uint16 propertyID, uint256 price) public validPropertyID(propertyID) returns(bool) {
        require(price != 0);
        require(msg.sender == pxlProperty.getPropertyOwner(propertyID));
        pxlProperty.setPropertySalePrice(propertyID, price);
        PropertySetForSale(propertyID, price);
        return true;
    }
    
    // Property owner delists their Property from being for sale
    function delist(uint16 propertyID) public validPropertyID(propertyID) returns(bool) {
        require(msg.sender == pxlProperty.getPropertyOwner(propertyID));
        pxlProperty.setPropertySalePrice(propertyID, 0);
        DelistProperty(propertyID);
        return true;
    }

    // Make a public bid and notify a Property owner of your bid. Burn 1 coin
    function makeBid(uint16 propertyID, uint256 bidAmount) public validPropertyID(propertyID) {
        require(bidAmount > 0);
        require(pxlProperty.balanceOf(msg.sender) >= 1 + bidAmount);
        Bid(propertyID, bidAmount, now);
        pxlProperty.burnPXL(msg.sender, 1);
    }
    
    /* CONTRACT OWNER FUNCTIONS */
    
    // Contract owner can withdraw up to ownerEth amount
    function withdraw(uint256 amount) public ownerOnly() {
        if (amount <= ownerEth) {
            owner.transfer(amount);
            ownerEth -= amount;
        }
    }
    
    // Contract owner can withdraw ownerEth amount
    function withdrawAll() public ownerOnly() {
        owner.transfer(ownerEth);
        ownerEth = 0;
    }
    
    // Contract owner can change who is the contract owner
    function changeOwners(address newOwner) public ownerOnly() {
        owner = newOwner;
    }
    
    /* ## PRIVATE FUNCTIONS ## */
    
    // Function which wraps payouts for setColors
    function _tryTriggerPayout(uint16 propertyID, uint256 pxlToSpend) private returns(bool) {
        var (propertyFlag, propertyIsInPrivateMode, propertyOwner, propertyLastUpdater, propertySalePrice, propertyLastUpdate, propertyBecomePublic, propertyEarnUntil) = pxlProperty.properties(propertyID);
        //If the Property is in private mode and expired, make it public
        if (propertyIsInPrivateMode && propertyBecomePublic <= now) {
            pxlProperty.setPropertyPrivateMode(propertyID, false);
            propertyIsInPrivateMode = false;
        }
        //If its in private mode, only the owner can interact with it
        if (propertyIsInPrivateMode) {
            require(msg.sender == propertyOwner);
            require(propertyFlag != 2);
        //If if its in free-use mode
        } else if (propertyBecomePublic <= now || propertyLastUpdater == msg.sender) {
            uint256 pxlSpent = pxlToSpend + 1; //All pxlSpent math uses N+1, so built in for convenience
            if (pxlToSpend < 2 && isInGracePeriod()) { //If first 3 days and we spent <2 coins, treat it as if we spent 2
                pxlSpent = 3; //We're treating it like 2, but it's N+1 in the math using this
            }
            
            pxlProperty.triggerPXLPayout(msg.sender, pxlToSpend, propertyLastUpdater, propertyOwner, getProjectedPayout(propertyIsInPrivateMode, propertyLastUpdate, propertyEarnUntil ));
            
            //BecomePublic = (N+1)/2 minutes of user-private mode
            //EarnUntil = (N+1)^2 coins earned max/minutes we can earn from
            pxlProperty.setPropertyBecomePublicEarnUntil(propertyID, now + (pxlSpent * PROPERTY_GENERATION_PAYOUT_INTERVAL / 2), now + (pxlSpent) * (pxlSpent) * PROPERTY_GENERATION_PAYOUT_INTERVAL);
        } else {
            return false;
        }
        pxlProperty.setPropertyLastUpdaterLastUpdate(propertyID, msg.sender, now);
        return true;
    }
    // Transfer ownership of a Property and reset their info
    function _transferProperty(uint16 propertyID, address newOwner, uint256 ethAmount, uint256 PXLAmount, uint8 flag, address oldOwner) private {
        require(newOwner != 0);
        pxlProperty.setPropertyOwnerSalePricePrivateModeFlag(propertyID, newOwner, 0, false, flag);
        PropertyBought(propertyID, newOwner, ethAmount, PXLAmount, now, oldOwner);
    }
    
    // Gets the (owners address, Ethereum sale price, PXL sale price, last update timestamp, whether its in private mode or not, when it becomes public timestamp, flag) for a Property
    function getPropertyData(uint16 propertyID) public validPropertyID(propertyID) view returns(address, uint256, uint256, uint256, bool, uint256, uint32) {
        return pxlProperty.getPropertyData(propertyID, systemSalePriceETH, systemSalePricePXL);
    }
    
    // Gets the system ETH and PXL prices
    function getSystemSalePrices() public view returns(uint256, uint256) {
        return (systemSalePriceETH, systemSalePricePXL);
    }
    
    // Gets the sale prices of any Property in ETH and PXL
    function getForSalePrices(uint16 propertyID) public validPropertyID(propertyID) view returns(uint256, uint256) {
        if (pxlProperty.getPropertyOwner(propertyID) == 0) {
            return getSystemSalePrices();
        } else {
            return (0, pxlProperty.getPropertySalePrice(propertyID));
        }
    }
    
    // Gets the projected sale price for a property should it be triggered at this very moment
    function getProjectedPayout(uint16 propertyID) public view returns(uint256) {
        var (propertyIsInPrivateMode, propertyLastUpdate, propertyEarnUntil) = pxlProperty.getPropertyPrivateModeLastUpdateEarnUntil(propertyID);
        return getProjectedPayout(propertyIsInPrivateMode, propertyLastUpdate, propertyEarnUntil);
    }
    
    function getProjectedPayout(bool propertyIsInPrivateMode, uint256 propertyLastUpdate, uint256 propertyEarnUntil) public view returns(uint256) {
        if (!propertyIsInPrivateMode && propertyLastUpdate != 0) {
            uint256 earnedUntil = (now < propertyEarnUntil) ? now : propertyEarnUntil;
            uint256 minutesSinceLastColourChange = (earnedUntil - propertyLastUpdate) / PROPERTY_GENERATION_PAYOUT_INTERVAL;
            return minutesSinceLastColourChange * PROPERTY_GENERATES_PER_MINUTE;
            //return (((now < propertyEarnUntil) ? now : propertyEarnUntil - propertyLastUpdate) / PROPERTY_GENERATION_PAYOUT_INTERVAL) * PROPERTY_GENERATES_PER_MINUTE; //Gave too high number wtf?
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
        pxlProperty.rewardPXL(user, amount);
    }
}
