/*var Authentication = artifacts.require("./Authentication.sol");

contract('Authentication', function(accounts) {

  it("...should sign up and log in a user.", function() {
    return Authentication.deployed().then(function(instance) {
      authenticationInstance = instance;

      return authenticationInstance.signup('testuser', {from: accounts[0]});
    }).then(function() {
      return authenticationInstance.login.call();
    }).then(function(userName) {
      assert.equal(web3.toUtf8(userName), 'testuser', "The user was not signed up.");
    });
  });

});*/

/*


contract TestStandardToken {
    function testInitialSupply() {
        StandardToken token = new StandardToken();
        uint expected = 0;

        Assert.equal(meta.balanceOf(0), expected, "Address 0 should have 0 coins");
    }
}


*/

var VirtualRealEstate = artifacts.require("./VirtualRealEstate.sol");

contract('VirtualRealEstate', function(accounts) {
  //####PURCHASE & SELLING####
  //#Purchase unpurchased @ default price
  it("Default properties can be purchased", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;
      return pixelPropertyInstance.buyProperty(0, { from: accounts[1], value: 1000000000000000000 }); 
    }).then(function(result) {
      console.log(result);
      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
    }).then(function(propertyData) {
      console.log(propertyData);
      assert.equal(propertyData[0], accounts[1], "Should be owned by account 1" );
    });
  });
  //#Can't purchase the same one twice
  //#Can't purchase someone elses owned one
  //#All 10000 can be purchased
  //#Properties listed for-sale can be purchased
  //#Money from initial property sale goes to contract owner
  //#Money from non-initial sales goes to old-owner
  //#Once a property is sold, the ownership changes
  //#You can't trade the property to owner "0"

  //####SETTING COLOR & COIN DISTRIBUTION####
  //#Changing the colour pays out 2 coins per hour to the last person who changed the colour for unpurchased properties
  it("...should set the color on a unpurchased property", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;

      pixelPropertyInstance.setColors(0, [5, 5, 5, 5, 5, 5, 5, 5, 5, 5], { from: accounts[1] });
      wait(50);
      pixelPropertyInstance.setColors(0, [5, 5, 5, 5, 5, 5, 5, 5, 5, 5], { from: accounts[2] });

      return pixelPropertyInstance.getPropertyColors(0, { from: accounts[0] });
    }).then(function(coloursReturned) {
      assert.equal(coloursReturned[0], 5, "Should return 5 from the array of 5's" );
    });
  });
  //#Changing the colour pays out 1 coins per hour since last change to the last colour changer and 1 to the owner of the property
  //#Changing the colour costs 2 coins for non-owned properties (burnt)
  //#Changing the colour costs 1 coin for owned properties (burnt)
  //DO IN SEPERATE ITERATION//#Changing the colour is free on the first day
});
