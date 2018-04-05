pragma solidity ^0.4.2;
import "./StandardToken.sol";

/*
    PXLProperty is the ERC20 Cryptocurrency & Cryptocollectable
    * It is a StandardToken ERC20 token and inherits all of that
    * It has the Property structure and holds the Properties
    * It governs the regulators (moderators, admins, root, Property DApps and PixelProperty)
    * It has getters and setts for all data storage
    * It selectively allows access to PXL and Properties based on caller access
    
    Moderation is handled inside PXLProperty, not by external DApps. It's up to other apps to respect the flags, however
*/
contract PXLProperty is StandardToken {
    /* Access Level Constants */
    uint8 constant LEVEL_1_MODERATOR = 1;    // 1: Level 1 Moderator - nsfw-flagging power
    uint8 constant LEVEL_2_MODERATOR = 2;    // 2: Level 2 Moderator - ban power + [1]
    uint8 constant LEVEL_1_ADMIN = 3;        // 3: Level 1 Admin - Can manage moderator levels + [1,2]
    uint8 constant LEVEL_2_ADMIN = 4;        // 4: Level 2 Admin - Can manage admin level 1 levels + [1-3]
    uint8 constant LEVEL_1_ROOT = 5;         // 5: Level 1 Root - Can set property DApps level [1-4]
    uint8 constant LEVEL_2_ROOT = 6;         // 6: Level 2 Root - Can set pixelPropertyContract level [1-5]
    uint8 constant LEVEL_3_ROOT = 7;         // 7: Level 3 Root - Can demote/remove root, transfer root, [1-6]
    uint8 constant LEVEL_PROPERTY_DAPPS = 8; // 8: Property DApps - Power over manipulating Property data
    uint8 constant LEVEL_PIXEL_PROPERTY = 9; // 9: PixelProperty - Power over PXL generation & Property ownership
    /* Flags Constants */
    uint8 constant FLAG_NSFW = 1;
    uint8 constant FLAG_BAN = 2;
    
    /* Accesser Addresses & Levels */
    address pixelPropertyContract;          // Only contract that has control over PXL creation and Property ownership
    mapping (address => uint8) regulators;  // Mapping of users/contracts to their control levels
    
    // Mapping of PropertyID to Property
    mapping (uint16 => Property) properties;
    // Property Owner's website
    mapping (address => uint256[2]) ownerWebsite;
    // Property Owner's hover text
    mapping (address => uint256[2]) ownerHoverText;
    
    /* ### Ownable Property Structure ### */
    struct Property {
        uint8 flag;
        bool isInPrivateMode; //Whether in private mode for owner-only use or free-use mode to be shared
        address owner; //Who owns the Property. If its zero (0), then no owner and known as a "system-Property"
        address lastUpdater; //Who last changed the color of the Property
        uint256[10] colors; //10x10 rgb pixel colors per property. colors[0] is the top row, colors[9] is the bottom row
        uint256 salePrice; //PXL price the owner has the Property on sale for. If zero, then its not for sale.
        uint256 lastUpdate; //Timestamp of when it had its color last updated
        uint256 becomePublic; //Timestamp on when to become public
        uint256 earnUntil; //Timestamp on when Property token generation will stop
    }
    
    /* ### Regulation Access Modifiers ### */
    modifier regulatorAccess(uint8 accessLevel) {
        require(accessLevel <= LEVEL_3_ROOT); // Only request moderator, admin or root levels forr regulatorAccess
        require(regulators[msg.sender] >= accessLevel); // Users must meet requirement
        if (accessLevel >= LEVEL_1_ADMIN) { //
            require(regulators[msg.sender] <= LEVEL_3_ROOT); //DApps can't do Admin/Root stuff, but can set nsfw/ban flags
        }
        _;
    }
    
    modifier propertyDAppAccess() {
        require(regulators[msg.sender] == LEVEL_PROPERTY_DAPPS || regulators[msg.sender] == LEVEL_PIXEL_PROPERTY );
        _;
    }
    
    modifier pixelPropertyAccess() {
        require(regulators[msg.sender] == LEVEL_PIXEL_PROPERTY);
        _;
    }
    
    /* ### Constructor ### */
    function PXLProperty() public {
        regulators[msg.sender] = LEVEL_3_ROOT; // Creator set to Level 3 Root
    }
    
    /* ### Moderator, Admin & Root Functions ### */
    // Moderator Flags
    function setPropertyFlag(uint16 propertyID, uint8 flag) public regulatorAccess(flag == FLAG_NSFW ? LEVEL_1_MODERATOR : LEVEL_2_MODERATOR) {
        Property storage property = properties[propertyID];
    
        property.flag = flag;
        if (flag == FLAG_BAN) {
            require(property.isInPrivateMode); //Can't ban an owner's property if a public user caused the NSFW content
            property.colors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
    }
    
    // Setting moderator/admin/root access
    function setRegulatorAccessLevel(address user, uint8 accessLevel) public regulatorAccess(LEVEL_1_ADMIN) {
        if (msg.sender != user) {
            require(regulators[msg.sender] > regulators[user]); // You have to be a higher rank than the user you are changing
        }
        require(regulators[msg.sender] > accessLevel); // You have to be a higher rank than the role you are setting
        regulators[user] = accessLevel;
    }
    
    function setPixelPropertyContract(address newPixelPropertyContract) public regulatorAccess(LEVEL_2_ROOT) {
        if (pixelPropertyContract != 0) {
            regulators[pixelPropertyContract] = 0; //If we already have a pixelPropertyContract, revoke its ownership
        }
        
        pixelPropertyContract = newPixelPropertyContract;
        regulators[newPixelPropertyContract] = LEVEL_PIXEL_PROPERTY;
    }
    
    function setPropertyDAppContract(address propertyDApp, bool giveAccess) public regulatorAccess(LEVEL_1_ROOT) {
        regulators[propertyDApp] = giveAccess ? LEVEL_PIXEL_PROPERTY : 0;
    }
    
    /* ### PropertyDapp Functions ### */
    function setPropertyColors(uint16 propertyID, uint256[10] colors) public propertyDAppAccess() {
        Property storage property = properties[propertyID];
        property.colors = colors;
    }
    
    function setPropertyRowColor(uint16 propertyID, uint8 row, uint256 rowColor) public propertyDAppAccess() {
        Property storage property = properties[propertyID];
        property.colors[row] = rowColor;
    }
    
    function setOwnerHoverText(address textOwner, uint256[2] hoverText) public propertyDAppAccess() {
        require (msg.sender == pixelPropertyContract);
        require (textOwner != 0);
        ownerHoverText[textOwner] = hoverText;
    }
    
    function setOwnerLink(address websiteOwner, uint256[2] website) public propertyDAppAccess() {
        require (msg.sender == pixelPropertyContract);
        require (websiteOwner != 0);
        ownerWebsite[websiteOwner] = website;
    }
    
    /* ### PixelProperty Property Functions ### */
    function setPropertyPrivateMode(uint16 propertyID, bool isInPrivateMode) public pixelPropertyAccess() {
        properties[propertyID].isInPrivateMode = isInPrivateMode;
    }
    
    function setPropertyOwner(uint16 propertyID, address propertyOwner) public pixelPropertyAccess() {
        properties[propertyID].owner = propertyOwner;
    }
    
    function setPropertyLastUpdater(uint16 propertyID, address lastUpdater) public pixelPropertyAccess() {
        properties[propertyID].lastUpdater = lastUpdater;
    }
    
    function setPropertySalePrice(uint16 propertyID, uint256 salePrice) public pixelPropertyAccess() {
        properties[propertyID].salePrice = salePrice;
    }
    
    function setPropertyLastUpdate(uint16 propertyID, uint256 lastUpdate) public pixelPropertyAccess() {
        properties[propertyID].lastUpdate = lastUpdate;
    }
    
    function setPropertyBecomePublic(uint16 propertyID, uint256 becomePublic) public pixelPropertyAccess() {
        properties[propertyID].becomePublic = becomePublic;
    }
    
    function setPropertyEarnUntil(uint16 propertyID, uint256 earnUntil) public pixelPropertyAccess() {
        properties[propertyID].earnUntil = earnUntil;
    }
    
    /* ### PixelProperty PXL Functions ### */
    function rewardPXL(address rewardedUser, uint256 amount) public pixelPropertyAccess() {
        require(rewardedUser != 0);
        balances[rewardedUser] += amount;
        totalSupply += amount;
    }
    
    function burnPXL(address burningUser, uint256 amount) public pixelPropertyAccess() {
        require(burningUser != 0);
        require(balances[burningUser] >= amount);
        balances[burningUser] -= amount;
        totalSupply -= amount;
    }
    
    /* ### All Getters/Views ### */
    function getPropertyFlag(uint16 propertyID) public view returns(uint8) {
        return properties[propertyID].flag;
    }
    
    function getPropertyPrivateMode(uint16 propertyID) public view returns(bool) {
        return properties[propertyID].isInPrivateMode;
    }
    
    function getPropertyOwner(uint16 propertyID) public view returns(address) {
        return properties[propertyID].owner;
    }
    
    function getPropertyLastUpdater(uint16 propertyID) public view returns(address) {
        return properties[propertyID].lastUpdater;
    }
    
    function getPropertyColors(uint16 propertyID) public view returns(uint256[10]) {
        return properties[propertyID].colors;
    }
    
    function getPropertyRowColor(uint16 propertyID, uint8 row) public view returns(uint256) {
        return properties[propertyID].colors[row];
    }
    
    function getPropertySalePrice(uint16 propertyID) public view returns(uint256) {
        return properties[propertyID].salePrice;
    }
    
    function getPropertyLastUpdate(uint16 propertyID) public view returns(uint256) {
        return properties[propertyID].lastUpdate;
    }
    
    function getPropertyBecomePublic(uint16 propertyID) public view returns(uint256) {
        return properties[propertyID].becomePublic;
    }
    
    function getPropertyEarnUntil(uint16 propertyID) public view returns(uint256) {
        return properties[propertyID].earnUntil;
    }
    
    function getOwnerHoverText(address textOwner) public view returns(uint256[2]) {
        return ownerHoverText[textOwner];
    }
    
    function getOwnerLink(address websiteOwner) public view returns(uint256[2]) {
        return ownerWebsite[websiteOwner];
    }
    
    function getRegulatorLevel(address user) public view returns(uint8) {
        return regulators[user];
    }
    
    // Gets the (owners address, Ethereum sale price, PXL sale price, last update timestamp, whether its in private mode or not, when it becomes public timestamp, flag) for a Property
    function getPropertyData(uint16 propertyID, uint256 systemSalePriceETH, uint256 systemSalePricePXL) public view returns(address, uint256, uint256, uint256, bool, uint256, uint8) {
        Property storage property = properties[propertyID];
        bool isInPrivateMode = property.isInPrivateMode;
        //If it's in private, but it has expired and should be public, set our bool to be public
        if (isInPrivateMode && property.becomePublic <= now) { 
            isInPrivateMode = false;
        }
        if (properties[propertyID].owner == 0) {
            return (0, systemSalePriceETH, systemSalePricePXL, property.lastUpdate, isInPrivateMode, property.becomePublic, property.flag);
        } else {
            return (property.owner, 0, property.salePrice, property.lastUpdate, isInPrivateMode, property.becomePublic, property.flag);
        }
    }
}
