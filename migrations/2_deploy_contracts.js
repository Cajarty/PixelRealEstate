var __vre = artifacts.require("./VirtualRealEstate.sol");
var __pxlpp = artifacts.require("./PXLProperty.sol");

module.exports = function(deployer) {
    deployer.deploy(__vre);
    deployer.deploy(__pxlpp);
};