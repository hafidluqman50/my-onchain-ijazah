// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC5192 {
    /// @notice Emitted when a token is locked.
    event Locked(uint256 tokenId);

    /// @notice Emitted when a token is unlocked.
    event Unlocked(uint256 tokenId);

    /// @notice Returns true if the token is locked (non-transferable).
    function locked(uint256 tokenId) external view returns (bool);
}
