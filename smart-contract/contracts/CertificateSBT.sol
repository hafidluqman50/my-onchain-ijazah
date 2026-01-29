// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateSBT is ERC721, Ownable {
    uint256 private _nextTokenId;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => bool) public revoked;

    event Minted(uint256 indexed tokenId, address indexed to);
    event Revoked(uint256 indexed tokenId);

    constructor(address owner) ERC721("Graduation Certificate", "SBT") Ownable(owner) {}

    function mint(address to, string calldata tokenURI) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = tokenURI;
        emit Minted(tokenId, to);
        return tokenId;
    }

    function revoke(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "token not found");
        revoked[tokenId] = true;
        emit Revoked(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "token not found");
        return _tokenURIs[tokenId];
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) {
            revert("SBT: non-transferable");
        }
        return from;
    }
}
