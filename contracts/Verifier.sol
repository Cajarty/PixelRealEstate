pragma solidity ^0.4.8;
contract Verifier {
    function recoverAddr(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
        return ecrecover(msgHash, v, r, s);
    }
    
    function isSigned(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public view returns (bool) {
        return ecrecover(msgHash, v, r, s) == msg.sender;
    }
}