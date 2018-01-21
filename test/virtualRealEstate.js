var VirtualRealEstate = artifacts.require("./VirtualRealEstate.sol");

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
  //#All 10000 can be purchased
  it("After a sale, ownership changes", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.addCoin(accounts[1], 10000);
    }).then(function() {
      return pixelPropertyInstance.listForSale(0, 10000, { from: accounts[0] }); 
    }).then(function(result) {
      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[1], 10000, "Should be listed for sale for 10000 wei" ); //For sale
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
      assert.equal(propertyData[1], 10000, "Should be listed for sale for 10000 wei" ); //For sale
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
      assert.equal(propertyData[1], 10000, "Should be listed for sale for 10000 wei" ); //For sale
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
      assert.equal(propertyData[1], 10000, "Should be listed for sale for 10000 wei" ); //For sale
      return pixelPropertyInstance.delist(3, { from: accounts[0] });
    }).then(function() {
      return pixelPropertyInstance.getPropertyData(3, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[1], 0, "Should be delisted and back to 0 wei" ); //For sale
      return pixelPropertyInstance.listForSale(3, 10000, { from: accounts[0] }); 
    }).then(function(result) {
      return pixelPropertyInstance.getPropertyData(3, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[1], 10000, "Should be listed for sale for 10000 wei" ); //For sale
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
  it("User1 can transfer property 0 to User0 as a fift", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.transferProperty(0, accounts[0], { from: accounts[1] }); 
    }).then(function(result) {
      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
    }).then(function(propertyData) {
      assert.equal(propertyData[0], accounts[0], "Should be owned by account 0" );
    });
  });
  
  //####SETTING COLOR & COIN DISTRIBUTION####
  //#Changing the colour pays out 2 coins per hour to the last person who changed the colour for unpurchased properties
  it("You can change the colours", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.setColors(10, [5, 7234, 5, 5, 5, 5, 2341, 5, 5, 11234], { from: accounts[2] });
    }).then(function(setColors) {
      return pixelPropertyInstance.getPropertyColors(10, { from: accounts[0] });
    }).then(function(coloursReturned) {
      assert.equal(coloursReturned[0], 5, "Should return 5 from the array of 5's" );
      assert.equal(coloursReturned[1], 7234, "Should return 5 from the array of 5's" );
      assert.equal(coloursReturned[6], 2341, "Should return 5 from the array of 5's" );
      assert.equal(coloursReturned[9], 11234, "Should return 5 from the array of 5's" );
    });
  });
  //#Changing the colour pays out 1 coins per hour since last change to the last colour changer and 1 to the owner of the property
  //#Changing the colour costs 2 coins for non-owned properties (burnt)
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
      return pixelPropertyInstance.getHoverText(0, { from: accounts[0] });
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
      return pixelPropertyInstance.getLink(0, { from: accounts[0] });
    }).then(function(link) {
      assert.equal(link[0], 0x1000000000000000000000000000000000000000000000000000000000000000, "Should say 0x100.. since user updated it to 0x1");
      assert.equal(link[1], 0x2000000000000000000000000000000000000000000000000000000000000000, "Should say 0x200.. since user updated it to 0x2");
    });
  });
  it("A user can change their hover text", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.getHoverText(0, { from: accounts[0] });
    }).then(function(hoverText) {
      assert.equal(hoverText[0], 0x5000000000000000000000000000000000000000000000000000000000000000, "Should say 0x500 from last test");
      assert.equal(hoverText[1], 0x6000000000000000000000000000000000000000000000000000000000000000, "Should say 0x600 from last test");
      return pixelPropertyInstance.setHoverText([0x7,0x8], { from: accounts[0] });
    }).then(function(setText) {
      return pixelPropertyInstance.getHoverText(0, { from: accounts[0] });
    }).then(function(hoverText) {
      assert.equal(hoverText[0], 0x7000000000000000000000000000000000000000000000000000000000000000, "Should say 0x700.. since user updated it to 0x7");
      assert.equal(hoverText[1], 0x8000000000000000000000000000000000000000000000000000000000000000, "Should say 0x800.. since user updated it to 0x8");
    });
  });
  it("A user can change their link text", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.getLink(0, { from: accounts[0] });
    }).then(function(link) {
      assert.equal(link[0], 0x1000000000000000000000000000000000000000000000000000000000000000, "Should say 0x100 from last test");
      assert.equal(link[1], 0x2000000000000000000000000000000000000000000000000000000000000000, "Should say 0x200 from last test");
      return pixelPropertyInstance.setLink([0x2,0x3], { from: accounts[0] });
    }).then(function(setLink) {
      return pixelPropertyInstance.getLink(0, { from: accounts[0] });
    }).then(function(link) {
      assert.equal(link[0], 0x2000000000000000000000000000000000000000000000000000000000000000, "Should say 0x200.. since user updated it to 0x2");
      assert.equal(link[1], 0x3000000000000000000000000000000000000000000000000000000000000000, "Should say 0x300.. since user updated it to 0x3");
    });
  });
  it("A property's hover text is the owners if in private mode", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.addCoin(accounts[1], 10000);
    }).then(function(s) {
      return pixelPropertyInstance.setColors(0, [1,2,3,4,5,6,7,8,9,10], {  from: accounts[1] }) //Make the last updater not the owner
    }).then(function(s) {
      return pixelPropertyInstance.setPropertyMode(0, true, 1, { from: accounts[0] }); //Put it in private mode
    }).then(function(hoverText) {
      return pixelPropertyInstance.setHoverText([0x7,0x8], { from: accounts[0] });
    }).then(function(setText) {
      return pixelPropertyInstance.getHoverText(0, { from: accounts[0] });
    }).then(function(hoverText) {
      assert.equal(hoverText[0], 0x7000000000000000000000000000000000000000000000000000000000000000, "Should say 0x700.. since user updated it to 0x7");
      assert.equal(hoverText[1], 0x8000000000000000000000000000000000000000000000000000000000000000, "Should say 0x800.. since user updated it to 0x8");
    });
  });
  it("A property's link is the owners if in private mode", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.setPropertyMode(0, true, 1, { from: accounts[0] }); //Put it in private mode
    }).then(function(link) {
      return pixelPropertyInstance.setLink([0x7,0x8], { from: accounts[0] });
    }).then(function(link) {
      return pixelPropertyInstance.getLink(0, { from: accounts[0] });
    }).then(function(link) {
      assert.equal(link[0], 0x7000000000000000000000000000000000000000000000000000000000000000, "Should say 0x700.. since user updated it to 0x7");
      assert.equal(link[1], 0x8000000000000000000000000000000000000000000000000000000000000000, "Should say 0x800.. since user updated it to 0x8");
    });
  });
  it("A property's hover text is the last-updater if in free use mode", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.addCoin(accounts[1], 10000);
    }).then(function(s) {
      return pixelPropertyInstance.setPropertyMode(0, false, 0, { from: accounts[0] }); //Put it in private mode
    }).then(function(s) {
      return pixelPropertyInstance.setColors(0, [1,2,3,4,5,6,7,8,9,10], {  from: accounts[1] }) //Make the last updater not the owner
    }).then(function(hoverText) {
      return pixelPropertyInstance.setHoverText([0x9,0x2], { from: accounts[1] });
    }).then(function(setText) {
      return pixelPropertyInstance.getHoverText(0, { from: accounts[0] });
    }).then(function(hoverText) {
      assert.equal(hoverText[0], 0x9000000000000000000000000000000000000000000000000000000000000000, "Should say 0x900.. since user updated it to 0x9");
      assert.equal(hoverText[1], 0x2000000000000000000000000000000000000000000000000000000000000000, "Should say 0x200.. since user updated it to 0x2");
    });
  });

  //####PROPERTY MODES####
  it("Owners of properties can change the property mode", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.setPropertyMode(0, true, 1, { from: accounts[0] }); //Set to private
    }).then(function(s) {
      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
    }).then(function(s) {
      //Assert that its in private mode
      return pixelPropertyInstance.setPropertyMode(0, false, 0, { from: accounts[0] }); //Set to public
    }).then(function(s) {
      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
    });
  });
  //#Non-owners can not change it
  //#Private-Mode makes it private for a short amount of time
  //#SetColor on PrivateMode property that's expired changes it to Free-iuse mode

  //####PPC VS. ETH MARKET####
  //#Can offer to buy PPC for ETH
  //#Buy PPC with ETH offering can fail if you dont pay as much as you offer
  //#Can offer to buy ETH for PPC
  //#Buy ETH with PPC offering can fail if you dont have the funds to cover your offer
  //#Can accept "Buy PPC with ETH" offering if you have sufficient PPC
  //#Can accept "Buy ETH with PPC" offering if you have sufficient ETH
  //#Can cancel offeres you have up

  //####OWNER FUNCTIONS####
  //#Can withdraw a set amount that is only up to owners justified amount
  //#Can withdrawAll which pays to the owner everything
  //#Can change owners to transfer contract ownership
  //#Can't change owners to the void
  //#Can change the default price if we're an owner
  //#Non-owners can't call ANY of the listed above functions

});
