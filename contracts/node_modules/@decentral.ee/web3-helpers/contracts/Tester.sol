pragma solidity >=0.4.21 <0.6.0;

contract Tester {

    uint32 private value;

    event TesterCreated(address indexed setter);
    event ValueSet(address indexed setter, uint32 value);

    constructor() public {
        emit TesterCreated(msg.sender);
    }

    function setValue(uint32 value_) external {
        value = value_;
        emit ValueSet(msg.sender, value);
    }

    function getValue() public view returns (uint32) {
        return value;
    }

}
