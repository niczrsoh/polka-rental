// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    constructor() ERC20("Mock USD Coin", "mUSDC") Ownable(msg.sender) {}

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
    
    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}
