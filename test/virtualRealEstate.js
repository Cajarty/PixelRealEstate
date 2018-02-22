var VirtualRealEstate = artifacts.require("./VirtualRealEstate.sol");
 
var utf8 = require("utf8");

/**
 * Should be called to get hex representation (prefixed by 0x) of utf8 string
 *
 * @method utf8ToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
var utf8ToHex = function(str) {
    str = utf8.encode(str);
    var hex = "";

    // remove \u0000 padding from either side
    str = str.replace(/^(?:\u0000)*/,'');
    str = str.split("").reverse().join("");
    str = str.replace(/^(?:\u0000)*/,'');
    str = str.split("").reverse().join("");

    for(var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        // if (code !== 0) {
        var n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
        // }
    }

    return "0x" + hex;
};



/**
 * Should be called to get utf8 from it's hex representation
 *
 * @method hexToUtf8
 * @param {String} hex
 * @returns {String} ascii string representation of hex value
 */
var hexToUtf8 = function(hex) {
    //if (!isHexStrict(hex))
    //    throw new Error('The parameter "'+ hex +'" must be a valid HEX string.');

    var str = "";
    var code = 0;
    hex = hex.replace(/^0x/i,'');

    // remove 00 padding from either side
    hex = hex.replace(/^(?:00)*/,'');
    hex = hex.split("").reverse().join("");
    hex = hex.replace(/^(?:00)*/,'');
    hex = hex.split("").reverse().join("");

    var l = hex.length;

    for (var i=0; i < l; i+=2) {
        code = parseInt(hex.substr(i, 2), 16);
        // if (code !== 0) {
        str += String.fromCharCode(code);
        // }
    }

    return utf8.decode(str);
};

contract('VirtualRealEstate', function(accounts) {
  //####PURCHASE, SELLING & TRANSFERING####
  it("User0 can purchase a property at default price in ETH", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      
      return pixelPropertyInstance.buyPropertyInETH(0, { from: accounts[0], value: 10000 }); 
    }).then(function(result) {
      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[0], accounts[0], "Should be owned by account 1" );
    });
  });
  it("User0 can purchase multiple default properties (1-3) in ETH",  function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.buyPropertyInETH(1, { from: accounts[0], value: 11000 });
    }).then(function(result) {
      return pixelPropertyInstance.getPropertyData(1, { from: accounts[0] });
    }).then(function(propertyData){
      assert.equal(propertyData[0], accounts[0], "Should be owned by account 1" );
      return pixelPropertyInstance.buyPropertyInETH(2, { from: accounts[0], value: 13000 });
    }).then(function(result) {
      return pixelPropertyInstance.getPropertyData(2, { from: accounts[0] });
    }).then(function(propertyData){
      assert.equal(propertyData[0], accounts[0], "Should be owned by account 1" );
      return pixelPropertyInstance.buyPropertyInETH(3, { from: accounts[0], value: 15000 });
    }).then(function(result) {
      return pixelPropertyInstance.getPropertyData(3, { from: accounts[0] });
    }).then(function(propertyData){
      assert.equal(propertyData[0], accounts[0], "Should be owned by account 1" );
    });
  });
  //??#Can't purchase someone elses owned one
  it("After a sale, ownership changes", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.addCoin(accounts[1], 10000);
    }).then(function() {
      return pixelPropertyInstance.listForSale(0, 10000, { from: accounts[0] }); 
    }).then(function(result) {
      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
      return pixelPropertyInstance.buyPropertyInPPC(0, 10000, {from: accounts[1] });
    }).then(function() {
      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[0], accounts[1], "Should now be owned by account1"); //Ownership changed
    });
  });
  //?#Money from initial property sale goes to contract owner
  it("After a sale occurs, money goes to the old owner of a property", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.addCoin(accounts[1], 10000);
    }).then(function() {
      return pixelPropertyInstance.listForSale(1, 10000, { from: accounts[0] }); 
    }).then(function(result) {
      return pixelPropertyInstance.getPropertyData(1, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
      return pixelPropertyInstance.buyPropertyInPPC(1, 10000, {from: accounts[1] });
    }).then(function() {
      return pixelPropertyInstance.getPropertyData(1, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[0], accounts[1], "Should now be owned by account1"); //Ownership change
      return pixelPropertyInstance.balanceOf(accounts[0], {from: accounts[0]});
    }).then(function(amount) {
      assert.equal(amount, 20000, "This should be the second test with a sale so 20k"); //Coin change
    });
  });
  //#Can delist sales that are still open
  it("After a property is listed, it can be delisted and set back to 0 price", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.listForSale(2, 10000, { from: accounts[0] }); 
    }).then(function(result) {
      return pixelPropertyInstance.getPropertyData(2, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[0], accounts[0], "Should be owned by account0 (to delist)")
      assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
      return pixelPropertyInstance.delist(2, { from: accounts[0] });
    }).then(function() {
      return pixelPropertyInstance.getPropertyData(2, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[1], 0, "Should be delisted and back to 0 wei" ); //For sale
    });
  });
  it("After delisting, it can be listed again and sold", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.listForSale(3, 10000, { from: accounts[0] }); 
    }).then(function(result) {
      return pixelPropertyInstance.getPropertyData(3, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[0], accounts[0], "Should be owned by account0 (to delist)")
      assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
      return pixelPropertyInstance.delist(3, { from: accounts[0] });
    }).then(function() {
      return pixelPropertyInstance.getPropertyData(3, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[2], 0, "Should be delisted and back to 0 wei" ); //For sale
      return pixelPropertyInstance.listForSale(3, 10000, { from: accounts[0] }); 
    }).then(function(result) {
      return pixelPropertyInstance.addCoin(accounts[1], 10000, {from: accounts[0]});
    }).then(function(result) {
      return pixelPropertyInstance.getPropertyData(3, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
      return pixelPropertyInstance.buyPropertyInPPC(3, 10000, {from: accounts[1] });
    }).then(function() {
      return pixelPropertyInstance.getPropertyData(3, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[0], accounts[1], "Should now be owned by account1"); //Ownership change
      return pixelPropertyInstance.balanceOf(accounts[0], {from: accounts[0]});
    }).then(function(amount) {
      assert.equal(amount, 30000, "This should be the third test with a sale so 20k"); //Coin change
    });
  });
  it("User1 can transfer property 0 to User0 as a gift", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.transferProperty(0, accounts[0], { from: accounts[1] }); 
    }).then(function(result) {
      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[0], accounts[0], "Should be owned by account 0" );
    });
  });
  it("User5 can buy a property with some PPC and some ETH", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.balanceOf(accounts[5]);
    }).then(function(balance) {
      user5InitialBalance = balance;
      return pixelPropertyInstance.getForSalePrices(75, {from: accounts[5]});
    }).then(function(prices) {
      assert.equal(prices[0] > 0, true, "ETH price should be set for default property purchase");
      assert.equal(prices[1] > 0, true, "PPC price should be set for default property purchase");
      initialPricesForPPCETHBuy = prices;
      return pixelPropertyInstance.addCoin(accounts[5], prices[1] / 2);
    }).then(function() {
      return pixelPropertyInstance.buyProperty(75, initialPricesForPPCETHBuy[1] / 2, { from: accounts[5], value: initialPricesForPPCETHBuy[0]})
    }).then(function() {
      return pixelPropertyInstance.balanceOf(accounts[5]);
    }).then(function(balance) {
      assert.equal(balance - user5InitialBalance, 0, "Should have spent the same amount earned");
    });
  });
  it("Purchasing with ETH increases ETH price, PPC increases PPC, and partial buy (30% PPC 70% ETH) raises price appropriately (30% for PPC, 70% for ETH)", function() {
    
  });
  
  //####SETTING COLOR & COIN DISTRIBUTION####
  //#Changing the colour pays out 2 coins per hour to the last person who changed the colour for unpurchased properties
  it("You can change the colours", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.addCoin(accounts[2], 2);
    }).then(function(s) {
      return pixelPropertyInstance.setColors(10, [5, 7234, 5, 5, 5, 5, 2341, 5, 5, 11234], 0, { from: accounts[2] });
    }).then(function(setColors) {
      return pixelPropertyInstance.getPropertyColors(10, { from: accounts[0] });
    }).then(function(coloursReturned) {
      assert.equal(coloursReturned[0], 5, "Should return 5 from the array of 5's" );
      assert.equal(coloursReturned[1], 7234, "Should return 5 from the array of 5's" );
      assert.equal(coloursReturned[6], 2341, "Should return 5 from the array of 5's" );
      assert.equal(coloursReturned[9], 11234, "Should return 5 from the array of 5's" );
    });
  });
  it("Changing the colour pays out 1 coins per second since last change to the last colour changer and 1 to the owner of the property", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.addCoin(accounts[4], 1); //Fund setColors of owned property
    }).then(function(s) {
      return pixelPropertyInstance.setColors(0, [0, 0, 0, 0, 0, 0, 0, 0 ,0 ,0], { from: accounts[4] });
    }).then(function(setColors) {
      return pixelPropertyInstance.getPropertyColors(0, { from: accounts[0] });
    }).then(function(coloursReturned) {
      assert.equal(coloursReturned[0], 0, "Should return 0 from the array of 0's" );
      return new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
          resolve("Delay Finished");
        }, 5000);
      });
    }).then(function(s) {
      return pixelPropertyInstance.addCoin(accounts[6], 1); //Fund setColors
    }).then(function(s) {
      return pixelPropertyInstance.setColors(0, [5, 5, 5, 5, 5, 5, 5, 5 ,5 ,5], { from: accounts[6] });
    }).then(function(setColors) {
      return pixelPropertyInstance.getPropertyColors(0, { from: accounts[0] });
    }).then(function(coloursReturned) {
      assert.equal(coloursReturned[0], 5, "Should return 5 from the array of 5's" );
      return pixelPropertyInstance.balanceOf(accounts[4], { from: accounts[0] });
    }).then(function(balance) {
      assert.equal(balance, 1, "Should have earned two coins from setting it and having it set for 1 second");
    });
  });
  it("Changing the colour of a non-owned property costs 2 PPC", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.addCoin(accounts[5], 2); //Fund setColors
    }).then(function(s) {
      return pixelPropertyInstance.setColors(9999, [0, 0, 0, 0, 0, 0, 0, 0 ,0 ,0], { from: accounts[5] });
    }).then(function(setColors) {
      return pixelPropertyInstance.getPropertyColors(9999, { from: accounts[0] });
    }).then(function(coloursReturned) {
      assert.equal(coloursReturned[0], 0, "Should return 0 from the array of 0's" );
      return new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
          resolve("Delay Finished");
        }, 5000);
      });
    }).then(function(s) {
      return pixelPropertyInstance.addCoin(accounts[6], 2); //Fund setColors
    }).then(function(s) {
      return pixelPropertyInstance.setColors(9999, [5, 5, 5, 5, 5, 5, 5, 5 ,5 ,5], { from: accounts[6] });
    }).then(function(setColors) {
      return pixelPropertyInstance.getPropertyColors(9999, { from: accounts[0] });
    }).then(function(coloursReturned) {
      assert.equal(coloursReturned[0], 5, "Should return 5 from the array of 5's" );
      return pixelPropertyInstance.balanceOf(accounts[5], { from: accounts[0] });
    }).then(function(balance) {
      console.log(balance);
      assert.equal(balance, 2, "Should have earned two coins from setting it and having it set for 1 second");
    });
  });
  it("Changing the colour of a owned property costs 1 PPC", function () {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.addCoin(accounts[5], 2); //Fund setColors
    }).then(function(s) {
      return pixelPropertyInstance.balanceOf(accounts[5], { from: accounts[0] });
    }).then(function(balance) {
      changeColorCosts1Goal = balance - 1;
      return pixelPropertyInstance.setColors(0, [2, 2, 2, 2, 2, 5, 5, 5 ,5 ,5], { from: accounts[5] });
    }).then(function(sc) {
      return pixelPropertyInstance.balanceOf(accounts[5], { from: accounts[0] });
    }).then(function(balance) {
      console.log("THIS ONE");
      console.log(balance);
      assert.equal(balance, changeColorCosts1Goal, "Should be one less than balance");
    });
  });

  //#Changing the colour costs 1 coin for owned properties (burnt)
  //DO IN SEPERATE ITERATION//#Changing the colour is free on the first day

  //####SETTING TEST & HOVER LINKS####
  it("A user can set their hover text", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.setHoverText([0x5,0x6], { from: accounts[0] });
    }).then(function() {
      return pixelPropertyInstance.setColors(0, [1,2,3,4,5,6,7,8,9,10], {  from: accounts[0] })
    }).then(function(setText) {
      return pixelPropertyInstance.getHoverText(accounts[0], { from: accounts[0] });
    }).then(function(hoverText) {
      assert.equal(hoverText[0], 0x5000000000000000000000000000000000000000000000000000000000000000, "Should say 0x500.. since user updated it to 0x5");
      assert.equal(hoverText[1], 0x6000000000000000000000000000000000000000000000000000000000000000, "Should say 0x600.. since user updated it to 0x6");
    });
  });

  it("A user can set their link", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.setLink([0x1,0x2], { from: accounts[0] });
    }).then(function(setText) {
      return pixelPropertyInstance.getLink(accounts[0], { from: accounts[0] });
    }).then(function(link) {
      assert.equal(link[0], 0x1000000000000000000000000000000000000000000000000000000000000000, "Should say 0x100.. since user updated it to 0x1");
      assert.equal(link[1], 0x2000000000000000000000000000000000000000000000000000000000000000, "Should say 0x200.. since user updated it to 0x2");
    });
  });
  it("A user can change their hover text", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.getHoverText(accounts[0], { from: accounts[0] });
    }).then(function(hoverText) {
      assert.equal(hoverText[0], 0x5000000000000000000000000000000000000000000000000000000000000000, "Should say 0x500 from last test");
      assert.equal(hoverText[1], 0x6000000000000000000000000000000000000000000000000000000000000000, "Should say 0x600 from last test");
      return pixelPropertyInstance.setHoverText([0x7,0x8], { from: accounts[0] });
    }).then(function(setText) {
      return pixelPropertyInstance.getHoverText(accounts[0], { from: accounts[0] });
    }).then(function(hoverText) {
      assert.equal(hoverText[0], 0x7000000000000000000000000000000000000000000000000000000000000000, "Should say 0x700.. since user updated it to 0x7");
      assert.equal(hoverText[1], 0x8000000000000000000000000000000000000000000000000000000000000000, "Should say 0x800.. since user updated it to 0x8");
    });
  });
  it("A user can change their link text", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.getLink(accounts[0], { from: accounts[0] });
    }).then(function(link) {
      assert.equal(link[0], 0x1000000000000000000000000000000000000000000000000000000000000000, "Should say 0x100 from last test");
      assert.equal(link[1], 0x2000000000000000000000000000000000000000000000000000000000000000, "Should say 0x200 from last test");
      return pixelPropertyInstance.setLink([0x2,0x3], { from: accounts[0] });
    }).then(function(setLink) {
      return pixelPropertyInstance.getLink(accounts[0], { from: accounts[0] });
    }).then(function(link) {
      assert.equal(link[0], 0x2000000000000000000000000000000000000000000000000000000000000000, "Should say 0x200.. since user updated it to 0x2");
      assert.equal(link[1], 0x3000000000000000000000000000000000000000000000000000000000000000, "Should say 0x300.. since user updated it to 0x3");
    });
  });
  it("A user can change their hover text with strings (Version2 1)", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      hexToText = utf8ToHex("12345678901234567890123456789012");
      return pixelPropertyInstance.setHoverText([hexToText,hexToText], { from: accounts[0] });
    }).then(function(setText) {
      return pixelPropertyInstance.getHoverText(accounts[0], { from: accounts[0] });
    }).then(function(hoverText) {
      assert.equal(hexToUtf8(hoverText[0]), "12345678901234567890123456789012", "Should say 0x700.. since user updated it to 0x7");
      assert.equal(hexToUtf8(hoverText[1]), "12345678901234567890123456789012", "Should say 0x800.. since user updated it to 0x8");
    });
  });

  it("A user can change their hover text with strings (Version 2)", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      hexToText = utf8ToHex("This string is short");
      return pixelPropertyInstance.setHoverText([hexToText,hexToText], { from: accounts[0] });
    }).then(function(setText) {
      return pixelPropertyInstance.getHoverText(accounts[0], { from: accounts[0] });
    }).then(function(hoverText) {
      assert.equal(hexToUtf8(hoverText[0]), "This string is short", "Should say 0x700.. since user updated it to 0x7");
      assert.equal(hexToUtf8(hoverText[1]), "This string is short", "Should say 0x800.. since user updated it to 0x8");
    });
  });

  //####PROPERTY MODES####
  it("Owners of properties can change the property mode", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.setPropertyMode(0, true, 1, { from: accounts[0] }); //Set to private
    }).then(function(s) {
      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[4], true, "Should be in private mode");
      return pixelPropertyInstance.setPropertyMode(0, false, 0, { from: accounts[0] }); //Set to public
    }).then(function(s) {
      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[4], false, "Should be in public mode");
    });
  });
  //?#Private-Mode makes it private for a short amount of time
  it("SetColor on PrivateMode property that's expired changes it to Free-use mode", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.setPropertyMode(0, true, 1, { from: accounts[0] }); //Set to private, but for zero time
    }).then(function(s) {
      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[4], true, "Should be in private mode");
      return new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
          resolve("Delay Finished");
        }, 5000);
      });
    }).then(function() {
      return pixelPropertyInstance.setColors(0, [9,8,7,6,5,4,3,2,1,0], { from: accounts[1] }); //Change the colour
    }).then(function(s) {
      return pixelPropertyInstance.getPropertyColors(0, { from: accounts[0] });
    }).then(function(propertyColors) {
      assert.equal(propertyColors[0], 9, "Colour should have been set despite being in private as it expired");
    });
  });

  //###MODERATION FUNCTIONS####

  //####OWNER FUNCTIONS####
  //#Can withdraw a set amount that is only up to owners justified amount
  //#Can withdrawAll which pays to the owner everything
  //#Can change owners to transfer contract ownership
  //#Can't change owners to the void
  //#Can change the default price if we're an owner
  //#Non-owners can't call ANY of the listed above functions
});
