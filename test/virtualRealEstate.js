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
  //####PURCHASE####
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

  //####SET COLOR####
  //#For Unpurchased
  it("...should set the color on a unpurchased property", function() {
    return VirtualRealEstate.deployed().then(function(instance) {
      pixelPropertyInstance = instance;

      pixelPropertyInstance.setColors(0, [5, 5, 5, 5, 5, 5, 5, 5, 5, 5], { from: accounts[1] });

      return pixelPropertyInstance.getPropertyColors(0, { from: accounts[0] });
    }).then(function(coloursReturned) {
      assert.equal(coloursReturned[0], 5, "Should return 5 from the array of 5's" );
    });
  });
});
