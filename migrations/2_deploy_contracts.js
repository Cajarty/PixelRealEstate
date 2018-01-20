var __vre = artifacts.require("./VirtualRealEstate.sol");
var __tvre = artifacts.require("./TestVirtualRealEstate.sol");

module.exports = function(deployer) {
    deployer.deploy(__vre);
    deployer.deploy(__tvre);
};