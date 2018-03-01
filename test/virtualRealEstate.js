var VirtualRealEstate = artifacts.require("./VirtualRealEstate.sol");

let byteArrayOnes = [0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1,0x1];
let byteArrayTwos = [0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2,0x2];
let byteArrayLong = [0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3,0x3];
let byteArrayShort = [0x4, 0x4, 0x4];

let stringToBytes = function(string) {
  let result = [];
  let len = string.length;
  let padChar = '\u0000'.charCodeAt(0);
  for(let i = 0; i < string.length; i++) {
    result.push(string.charCodeAt(i));
  }
  while(len < 64) {
    result.push(padChar);
    len++;
  }
  return result;
};

let bytesToString = function(bytes) {
  let result = "";
  for(let i = 0; i < bytes.length; i++) {
    let char = String.fromCharCode(bytes[i]);
    if (char == '\u0000') {
      break;
    }
    result += char;
  }
  return result;
}

contract('VirtualRealEstate', function(accounts) {
 //####PURCHASE, SELLING & TRANSFERING####
 it("User0 can purchase a property at default price in ETH", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     
     return pixelPropertyInstance.buyPropertyInETH(0, { from: accounts[1], value: 10000 }); 
   }).then(function(result) {
     return pixelPropertyInstance.getPropertyData(0, { from: accounts[1] });
   }).then(function(propertyData) {
     assert.equal(propertyData[0], accounts[1], "Should be owned by account 1" );
   });
   //User1 owns property [0] with 0 PPT
 });
 it("User0 can purchase multiple default properties (1-3) in ETH",  function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.buyPropertyInETH(1, { from: accounts[1], value: 11000 });
   }).then(function(result) {
     return pixelPropertyInstance.getPropertyData(1, { from: accounts[1] });
   }).then(function(propertyData){
     assert.equal(propertyData[0], accounts[1], "Should be owned by account 1" );
     return pixelPropertyInstance.buyPropertyInETH(2, { from: accounts[1], value: 13000 });
   }).then(function(result) {
     return pixelPropertyInstance.getPropertyData(2, { from: accounts[1] });
   }).then(function(propertyData){
     assert.equal(propertyData[0], accounts[1], "Should be owned by account 1" );
     return pixelPropertyInstance.buyPropertyInETH(3, { from: accounts[1], value: 15000 });
   }).then(function(result) {
     return pixelPropertyInstance.getPropertyData(3, { from: accounts[1] });
   }).then(function(propertyData){
     assert.equal(propertyData[0], accounts[1], "Should be owned by account 1" );
   });
   //User1 owns property [0,1,2,3] with 0 PPT
 });
 it("After a sale, ownership changes", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.addCoin(accounts[2], 10000), { from: accounts[0]};
   }).then(function() {
     return pixelPropertyInstance.listForSale(0, 10000, { from: accounts[1] }); 
   }).then(function(result) {
     return pixelPropertyInstance.getPropertyData(0, { from: accounts[1] });
   }).then(function(propertyData) {
     assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
     return pixelPropertyInstance.buyPropertyInPPT(0, 10000, {from: accounts[2] });
   }).then(function() {
     return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
   }).then(function(propertyData) {
     assert.equal(propertyData[0], accounts[2], "Should now be owned by account1"); //Ownership changed
     return pixelPropertyInstance.balanceOf(accounts[1], {from: accounts[1]})
   }).then(function(balance) {
     assert.equal(balance, 9800, "Owner should be paid 98% of 10000"); //Ownership changed
     return pixelPropertyInstance.balanceOf(accounts[0], {from: accounts[0]})
   }).then(function(balance) {
     assert.equal(balance, 200, "Contract owner gets a 2% cut of 10000 PPT"); //Ownership changed
   });
   //User0 has 200 PPT
   //User1 owns property [1,2,3] with 9800 PPT
   //User2 owns property [0] with 0 PPT
 });
 //?#Money from initial property sale goes to contract owner
 it("After a sale occurs, money goes to the old owner of a property", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.addCoin(accounts[2], 10000, { from: accounts[0] });
   }).then(function() {
     return pixelPropertyInstance.listForSale(1, 10000, { from: accounts[1] }); 
   }).then(function(result) {
     return pixelPropertyInstance.getPropertyData(1, { from: accounts[1] });
   }).then(function(propertyData) {
     assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
     return pixelPropertyInstance.buyPropertyInPPT(1, 10000, {from: accounts[2] });
   }).then(function() {
     return pixelPropertyInstance.getPropertyData(1, { from: accounts[1] });
   }).then(function(propertyData) {
     assert.equal(propertyData[0], accounts[2], "Should now be owned by account2"); //Ownership change
     return pixelPropertyInstance.balanceOf(accounts[1], {from: accounts[1]});
   }).then(function(amount) {
     assert.equal(amount, 19600, "This should be the second test with a sale of 10k at 2% fee"); //Coin change
     return pixelPropertyInstance.balanceOf(accounts[0], {from: accounts[0]})
   }).then(function(balance) {
     assert.equal(balance, 400, "Contract owner gets a second 2% cut of 10000 PPT"); //Ownership changed
   });
   //User0 has 400 PPT
   //User1 owns property [2,3] with 19600 PPT
   //User2 owns property [0,1] with 0 PPT
 });
 //#Can delist sales that are still open
 it("After a property is listed, it can be delisted and set back to 0 price", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.listForSale(2, 10000, { from: accounts[1] }); 
   }).then(function(result) {
     return pixelPropertyInstance.getPropertyData(2, { from: accounts[1] });
   }).then(function(propertyData) {
     assert.equal(propertyData[0], accounts[1], "Should be owned by account0 (to delist)")
     assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
     return pixelPropertyInstance.delist(2, { from: accounts[1] });
   }).then(function() {
     return pixelPropertyInstance.getPropertyData(2, { from: accounts[1] });
   }).then(function(propertyData) {
     assert.equal(propertyData[1], 0, "Should be delisted and back to 0 wei" ); //For sale
   });
   //NO-CHANGE
 });
 it("After delisting, it can be listed again and sold", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.listForSale(3, 10000, { from: accounts[1] }); 
   }).then(function(result) {
     return pixelPropertyInstance.getPropertyData(3, { from: accounts[1] });
   }).then(function(propertyData) {
     assert.equal(propertyData[0], accounts[1], "Should be owned by account1 (to delist)")
     assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
     return pixelPropertyInstance.delist(3, { from: accounts[1] });
   }).then(function() {
     return pixelPropertyInstance.getPropertyData(3, { from: accounts[1] });
   }).then(function(propertyData) {
     assert.equal(propertyData[2], 0, "Should be delisted and back to 0 wei" ); //For sale
     return pixelPropertyInstance.listForSale(3, 10000, { from: accounts[1] }); 
   }).then(function(result) {
     return pixelPropertyInstance.addCoin(accounts[2], 10000, {from: accounts[0]});
   }).then(function(result) {
     return pixelPropertyInstance.getPropertyData(3, { from: accounts[1] });
   }).then(function(propertyData) {
     assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
     return pixelPropertyInstance.buyPropertyInPPT(3, 10000, {from: accounts[2] });
   }).then(function() {
     return pixelPropertyInstance.getPropertyData(3, { from: accounts[1] });
   }).then(function(propertyData) {
     assert.equal(propertyData[0], accounts[2], "Should now be owned by account2"); //Ownership change
     return pixelPropertyInstance.balanceOf(accounts[1], {from: accounts[1]});
   }).then(function(amount) {
     assert.equal(amount, 29400, "This should be the third 10k test with a sale at 2% fee so 29400"); //Coin change
   });
   //User0 has 600 PPT
   //User1 owns property [2] with 29400 PPT
   //User2 owns property [0,1,3] with 0 PPT
 });
 it("User2 can transfer property 0 to User0 as a gift", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.transferProperty(0, accounts[0], { from: accounts[2] }); 
   }).then(function(result) {
     return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
   }).then(function(propertyData) {
     assert.equal(propertyData[0], accounts[0], "Should be owned by account 0" );
   });
   //User0 owns property [0] with 600 PPT
   //User1 owns property [2] with 29400 PPT
   //User2 owns property [1,3] with 0 PPT
 });
 it("User3 can buy a property with some PPT and some ETH", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.balanceOf(accounts[3]);
   }).then(function(balance) {
     user5InitialBalance = balance;
     return pixelPropertyInstance.getForSalePrices(75, {from: accounts[3]});
   }).then(function(prices) {
     assert.equal(prices[0] > 0, true, "ETH price should be set for default property purchase");
     assert.equal(prices[1] > 0, true, "PPT price should be set for default property purchase");
     initialPricesForPPTETHBuy = prices;
     return pixelPropertyInstance.addCoin(accounts[3], prices[1] / 2);
   }).then(function() {
     return pixelPropertyInstance.buyProperty(75, initialPricesForPPTETHBuy[1] / 2, { from: accounts[3], value: initialPricesForPPTETHBuy[0] / 2})
   }).then(function() {
     return pixelPropertyInstance.balanceOf(accounts[3]);
   }).then(function(balance) {
     assert.equal(balance - user5InitialBalance, 0, "Should have spent the same amount earned");
   });
   //User0 owns property [0] with 600 PPT
   //User1 owns property [2] with 29400 PPT
   //User2 owns property [1,3] with 0 PPT
   //User3 owns property [75] with 0 PPT
 });
 //it("Purchasing with ETH increases ETH price, PPT increases PPT, and partial buy (30% PPT 70% ETH) raises price appropriately (30% for PPT, 70% for ETH)", function() {
   
 //});
 
 //####SETTING COLOR & COIN DISTRIBUTION####
 //#Changing the colour pays out 2 coins per hour to the last person who changed the colour for unpurchased properties
 it("You can change the colours for free", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.setColors(10, [5, 7234, 5, 5, 5, 5, 2341, 5, 5, 11234], 0, { from: accounts[2] });
   }).then(function(setColors) {
     return pixelPropertyInstance.getPropertyColors(10, { from: accounts[0] });
   }).then(function(coloursReturned) {
     assert.equal(coloursReturned[0], 5, "Should return 5 from the array of 5's" );
     assert.equal(coloursReturned[1], 7234, "Should return 5 from the array of 5's" );
     assert.equal(coloursReturned[6], 2341, "Should return 5 from the array of 5's" );
     assert.equal(coloursReturned[9], 11234, "Should return 5 from the array of 5's" );
   });
   //NO-CHANGE
 });
 it("Changing the colour pays out 1 coins per second since last change to the last colour changer and 1 to the owner of the property", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.setColors(75, [0, 0, 0, 0, 0, 0, 0, 0 ,0 ,0], 0, { from: accounts[4] });
   }).then(function(setColors) {
     return pixelPropertyInstance.getPropertyColors(75, { from: accounts[3] });
   }).then(function(coloursReturned) {
     assert.equal(coloursReturned[0], 0, "Should return 0 from the array of 0's" );
     return new Promise((resolve, reject) => {
       let wait = setTimeout(() => {
         resolve("Delay Finished");
       }, 4001);
     });
   }).then(function(s) {
     return pixelPropertyInstance.setColors(75, [5, 5, 5, 5, 5, 5, 5, 5 ,5 ,5], 0, { from: accounts[6] });
   }).then(function(setColors) {
     return pixelPropertyInstance.getPropertyColors(75, { from: accounts[0] });
   }).then(function(coloursReturned) {
     assert.equal(coloursReturned[0], 5, "Should return 5 from the array of 5's" );
     return pixelPropertyInstance.balanceOf(accounts[4], { from: accounts[0] });
   }).then(function(balance) {
     assert.equal(balance, 4, "Should have earned four coins from setting it and having it set for four seconds");
     return pixelPropertyInstance.balanceOf(accounts[3], { from: accounts[0] });
   }).then(function(balance) {
     assert.equal(balance, 4, "User3 should have earned the same amount if coins as owner that the setter got");
   });
   //User0 owns property [0] with 600 PPT
   //User1 owns property [2] with 29400 PPT
   //User2 owns property [1,3] with 0 PPT
   //User3 owns property [75] with 4 PPT
   //User4 owns property [] with 4 PPT
 });
 it("Users can choose to pay more more should they desire, which burns the coin and locks for longer/awards more", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.balanceOf(accounts[0], {from: accounts[0]});
   }).then(function(balance) {
     user0Balance = balance;
     return pixelPropertyInstance.setColors(25, [1,2,3,4,5,6,7,8,9,10], 10, {from: accounts[0]});
   }).then(function(s) {
     return pixelPropertyInstance.balanceOf(accounts[0], {from: accounts[0]});
   }).then(function(balance) {
     assert.equal(user0Balance - balance, 10, "Burnt 10 coins");
   });
 });

 //#Changing the colour costs 1 coin for owned properties (burnt)
 //DO IN SEPERATE ITERATION//#Changing the colour is free on the first day

 //####SETTING TEST & HOVER LINKS####
 it("A user can set their hover text", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.setHoverText(byteArrayOnes, { from: accounts[0] });
   }).then(function() {
     return pixelPropertyInstance.setColors(0, [1,2,3,4,5,6,7,8,9,10], 0, {  from: accounts[0] })
   }).then(function(setText) {
     return pixelPropertyInstance.getHoverText(accounts[0], { from: accounts[0] });
   }).then(function(hoverText) {
     assert.equal( hoverText[3], 0x10, "Should match byteArrayOnes");
   });
 });

 it("A user can set their link", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.setLink(byteArrayTwos, { from: accounts[0] });
   }).then(function(setText) {
     return pixelPropertyInstance.getLink(accounts[0], { from: accounts[0] });
   }).then(function(link) {
     assert.equal(link[3], 0x20, "Should match byteArrayTwos");
   });
 });
 it("A user can change their hover text", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.getHoverText(accounts[0], { from: accounts[0] });
   }).then(function(hoverText) {
     assert.equal(hoverText[3], 0x10, "Should still match byteArrayOnes");
     return pixelPropertyInstance.setHoverText(byteArrayTwos, { from: accounts[0] });
   }).then(function(setText) {
     return pixelPropertyInstance.getHoverText(accounts[0], { from: accounts[0] });
   }).then(function(hoverText) {
     assert.equal(hoverText[3], 0x20, "Should now match byteArrayTwos");
   });
 });
 it("A user can change their link text", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.getLink(accounts[0], { from: accounts[0] });
   }).then(function(link) {
     assert.equal(link[3], 0x20, "Should still match byteArrayTwos");
     return pixelPropertyInstance.setLink(byteArrayLong, { from: accounts[0] });
   }).then(function(setLink) {
     return pixelPropertyInstance.getLink(accounts[0], { from: accounts[0] });
   }).then(function(link) {
     assert.equal(link[4], 0x30, "Should now match byteArrayLong");
   });
 });
 it("A user can change their hover text with strings (Version 1)", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.setHoverText(stringToBytes("This goes really long and has 1"), { from: accounts[0] });
   }).then(function(setText) {
     return pixelPropertyInstance.getHoverText(accounts[0], { from: accounts[0] });
   }).then(function(hoverText) {
     assert.equal(bytesToString(hoverText), "This goes really long and has 1", "Should say 123...");
   });
 });

 it("A user can change their hover text with strings (Version 2)", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return pixelPropertyInstance.setHoverText(stringToBytes("This string is short"), { from: accounts[0] });
   }).then(function(setText) {
     return pixelPropertyInstance.getHoverText(accounts[0], { from: accounts[0] });
   }).then(function(hoverText) {
     assert.equal(bytesToString(hoverText), "This string is short", "Should match the short string");
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
     return pixelPropertyInstance.setColors(0, [9,8,7,6,5,4,3,2,1,0], 0, { from: accounts[1] }); //Change the colour
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
