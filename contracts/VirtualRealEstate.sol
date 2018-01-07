pragma solidity ^0.4.2;
contract VirtualRealEstate {
    address owner;
    uint256 ownerEth = 0;
    
    //Mapping of pixelID to pixel
    mapping (uint24 => Pixel) map;
    //PixelOwner to link
    mapping (address => bytes32[2]) ownerLink;
    //PixelRenter to link
    mapping (address => bytes32[2]) ownerHoverText;
    
    uint128 DEFAULT_PRICE = 10000000000000000;
    
    uint128 USER_BUY_CUT_PERCENT = 98; //%
    uint128 USER_RENT_CUT_PERCENT = 98; //%;
    
    event PixelColorUpdate(uint24 indexed pixel, uint24 color);
    
    struct Pixel {
        address owner;
        uint24 color;
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
    
    modifier validPixelID(uint24 pixelID) {
        if (pixelID < 1000000) {
            _;
        }
    }
    
    function VirtualRealEstate() public {
        owner = msg.sender;
    }
    function setHoverText(bytes32[2] text) public {
        ownerHoverText[msg.sender] = text;
    }
    function setLinkShort(bytes32[2] link) public {
        ownerLink[msg.sender] = link;
    }
    
    //256bits = 32 bytes or 32 uint8's
    function getNext100PixelsInRowColors(uint16 row, uint16 startColumn) public view returns(uint256[10]) {
        uint256[10] results;
        uint24 startPoint = uint24(row * 1000 + startColumn);
        
        for(uint24 j = 0; j < 10; j++) {
            uint256 result = 0;
            for(uint24 i = 0; i < 10; i++) {
                result = (result * (2 ^ 24));
                result = (result | uint256(map[startPoint + i + j * 10].color));
            }
            results[j] = result;
        }
        
        return results;
    }
    
    function getForSalePrice(uint24 pixelID) public view returns(uint128) {
        Pixel pixel = map[pixelID];
        require(pixel.salePrice != 0);
        return pixel.salePrice;
    }
    
    function getForRentPrice(uint24 pixelID) public view returns(uint128) {
        Pixel pixel = map[pixelID];
        require(pixel.rentPrice != 0);
        return pixel.rentPrice;
    }
    function getHoverText(uint24 pixelID) public view returns(bytes32[2]) {
        Pixel pixel = map[pixelID];
        
        if (pixel.rentPrice != 0 && pixel.renter != 0 && pixel.rentedUntil < now) {
            map[pixelID].renter = 0;
        }
        //Must have a owner or renter, and that owner/renter must have a short or long hover text
        require(pixel.renter != 0 || pixel.owner != 0);
        address pixelResident;
        if (pixel.renter == 0) {
            pixelResident = pixel.owner;
        } else {
            pixelResident = pixel.renter;
        }
        return ownerHoverText[pixelResident];
    }
    function getLink(uint24 pixelID) public view returns(bytes32[2]) {
        Pixel pixel = map[pixelID];
        
        if (pixel.rentPrice != 0 && pixel.renter != 0 && pixel.rentedUntil < now) {
            map[pixelID].renter = 0;
        }
        //Must have a owner or renter, and that owner/renter must have a short or long hover text
        require(pixel.renter != 0 || pixel.owner != 0);
        address pixelResident;
        if (pixel.renter == 0) {
            pixelResident = pixel.owner;
        } else {
            pixelResident = pixel.renter;
        }
        return ownerLink[pixelResident];
    }
    
    function getColor(uint24 pixelID) public validPixelID(pixelID) view returns(uint24) {
        return map[pixelID].color;
    }
    
    function getPixelData(uint24 pixelID) public validPixelID(pixelID) view returns(address, uint24, uint128, address, uint256, uint256, uint128) {
        Pixel pixel = map[pixelID];
        return (pixel.owner, pixel.color, pixel.salePrice, pixel.renter, pixel.rentAvailableUntil, pixel.rentedUntil, pixel.rentPrice);
    }
    
    function setColor(uint24 pixelID, uint24 newColor) public validPixelID(pixelID) returns(bool) {
        Pixel pixel = map[pixelID];
        
        if (pixel.rentPrice != 0 && pixel.renter != 0 && pixel.rentedUntil < now) {
            map[pixelID].renter = 0;
        }
        
        require((msg.sender == pixel.owner && pixel.renter == 0) || (msg.sender == pixel.renter));
        
        pixel.color = newColor;
        
        PixelColorUpdate(pixelID, newColor);
        
        return true;
    }
    
    //Use Case: Buyer wants to buy a pixel
    function buy(uint24 pixelID) public validPixelID(pixelID) payable returns(bool) {
        Pixel pixel = map[pixelID];
        
        //If this is the first ever purchase, the pixel hasn't been made yet, pixel.owner is just default
        if (pixel.owner == 0) {
            map[pixelID] = Pixel(msg.sender, 0, DEFAULT_PRICE, 0, 0, 0, 0);
            pixel = map[pixelID];
        }
      
        if (pixel.rentPrice != 0 && pixel.renter != 0 && pixel.rentedUntil < now) {
            map[pixelID].renter = 0;
        }
      
        require(pixel.salePrice != 0);//Pixel must be for sale
        require(pixel.renter == 0);//Pixel cannot be being rented
        require(msg.value >= pixel.salePrice);//Amount paid must be at least the price
      
        //User gets the majority of the listed price's sale
        uint128 amountTransfered = 0;
        
        if (pixel.owner != 0) {
            amountTransfered = pixel.salePrice * USER_BUY_CUT_PERCENT / 100;
            pixel.owner.transfer(amountTransfered);
        }
        
        map[pixelID].rentPrice = 0;
        map[pixelID].renter = 0;
        map[pixelID].salePrice = 0;
        map[pixelID].owner = msg.sender;
        
        ownerEth += msg.value - amountTransfered;
        
        return true;
    }
    
    //Use Case: Renter wants to rent a pixel
    function rent(uint24 pixelID) public validPixelID(pixelID) payable returns(bool) {
        Pixel pixel = map[pixelID];
        
        //How many units they paid to rent
        uint256 timeToRent = msg.value / pixel.rentPrice;
        
        if (pixel.rentPrice != 0 && pixel.renter != 0 && pixel.rentedUntil < now) {
            map[pixelID].renter = 0;
        }
      
        require(pixel.owner != 0); //Must have been owned
        require(pixel.rentPrice != 0);//Pixel must be for sale
        require(timeToRent >= 1);//The renting must be for at least one unit
        require(pixel.renter == 0);//Pixel cannot be being rented already
      
        //User gets the majority of the listed price's sale
        uint256 amountTransfered = msg.value * USER_RENT_CUT_PERCENT / 100;
        
        pixel.owner.transfer(amountTransfered);
        
        map[pixelID].renter = msg.sender;
      
        if (map[pixelID].rentAvailableUntil < now + timeToRent) {
            map[pixelID].rentedUntil = map[pixelID].rentAvailableUntil;
        } else {
            map[pixelID].rentedUntil = now + timeToRent;
        }
        
        ownerEth += msg.value - amountTransfered;
        
        return true;
    }
    
    //Use Case: Renter wants to stop renting the pixel
    function cancelRent(uint24 pixelID) public validPixelID(pixelID) returns(bool) {
        Pixel pixel = map[pixelID];
        
        require(msg.sender == pixel.renter);
        
        pixel.renter = 0;
        
        return true;
    }
    
    //Use Case: Owner of a pixel lists for sale at a given price
    function listForSale(uint24 pixelID, uint128 price ) public validPixelID(pixelID) returns(bool) {
        Pixel pixel = map[pixelID];
      
        if (pixel.rentPrice != 0 && pixel.renter != 0 && pixel.rentedUntil < now) {
            map[pixelID].renter = 0;
        }
      
        require(msg.sender == pixel.owner); //Must be the owner
        require(pixel.renter == 0); //Must not currently be already rented out
        //You can listForSale an already listed item to update the listing
        map[pixelID].salePrice = price;
        
        return true;
    }
    //Use Case: Owner of a pixel lists for rent at a given price
    function listForRent(uint24 pixelID, uint128 rentPrice, uint128 rentDuration) public validPixelID(pixelID) returns(bool)  {
        Pixel pixel = map[pixelID];
      
        if (pixel.rentPrice != 0 && pixel.renter != 0 && pixel.rentedUntil < now) {
            map[pixelID].renter = 0;
        }
      
        require(msg.sender == pixel.owner); //Must be the owner
        require(pixel.renter == 0); //Must not currently be already rented out
        require(rentDuration > 0); //Must be renting for a proper duration
        //You can listForRent an already listed item to update the listing
      
        map[pixelID].rentPrice = rentPrice;
        map[pixelID].rentAvailableUntil = now + rentDuration;
        
        return true;
    }
    //Use Case: Owner of a pixel delists from both renting offer and sale offer
    function delistEntirely(uint24 pixelID, bool delistFromSale, bool delistFromRent) public validPixelID(pixelID) returns(bool) {
        Pixel pixel = map[pixelID];
      
        if (pixel.rentPrice != 0 && pixel.renter != 0 && pixel.rentedUntil < now) {
            map[pixelID].renter = 0;
        }
        
        require(msg.sender == pixel.owner); //Must be the owner
        require(pixel.renter == 0); //Must have no current renter
        
        if (delistFromRent) {
            map[pixelID].rentPrice = 0;
            map[pixelID].renter = 0;
        }
        if (delistFromSale) {
            map[pixelID].salePrice = 0;
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
}