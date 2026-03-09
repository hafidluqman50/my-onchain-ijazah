// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {IERC5192} from "src/interfaces/IERC5192.sol";

contract CertificateSBT is ERC721, Ownable, IERC5192 {
    uint256 private _nextTokenId;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => bool) private _locked;
    mapping(uint256 => bool) public revoked;

    event Minted(uint256 indexed tokenId, address indexed to);
    event Revoked(uint256 indexed tokenId);

    constructor(address owner) ERC721("Graduation Certificate", "SBT") Ownable(owner) {}

    function mint(address to, string calldata tokenURI_) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = tokenURI_;
        _locked[tokenId] = true;

        emit Minted(tokenId, to);
        emit Locked(tokenId);
        return tokenId;
    }

    function revoke(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "token not found");
        revoked[tokenId] = true;
        emit Revoked(tokenId);
    }

    function locked(uint256 tokenId) external view override returns (bool) {
        require(_ownerOf(tokenId) != address(0), "token not found");
        return _locked[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "token not found");
        return _tokenURIs[tokenId];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC5192).interfaceId || super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) {
            revert("SBT: non-transferable");
        }
        return from;
    }
}
