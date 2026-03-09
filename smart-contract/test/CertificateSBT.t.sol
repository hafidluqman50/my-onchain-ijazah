// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {CertificateSBT} from "src/CertificateSBT.sol";
import {IERC5192} from "src/interfaces/IERC5192.sol";

contract CertificateSBTTest is Test {
    CertificateSBT internal sbt;

    address internal owner = address(0xABCD);
    address internal student = address(0xBEEF);
    address internal other = address(0xCAFE);

    function setUp() public {
        sbt = new CertificateSBT(owner);
    }

    function testMintByOwnerSetsLockedAndMetadata() public {
        string memory uri = "ipfs://cid-1";

        vm.prank(owner);
        uint256 tokenId = sbt.mint(student, uri);

        assertEq(tokenId, 0);
        assertEq(sbt.ownerOf(tokenId), student);
        assertEq(sbt.tokenURI(tokenId), uri);
        assertTrue(sbt.locked(tokenId));
    }

    function testMintEmitsLockedEvent() public {
        vm.expectEmit(true, false, false, true, address(sbt));
        emit IERC5192.Locked(0);

        vm.prank(owner);
        sbt.mint(student, "ipfs://cid-2");
    }

    function testMintRevertsWhenCallerNotOwner() public {
        vm.prank(other);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, other));
        sbt.mint(student, "ipfs://cid-3");
    }

    function testTransferRevertsBecauseSoulbound() public {
        vm.prank(owner);
        uint256 tokenId = sbt.mint(student, "ipfs://cid-4");

        vm.prank(student);
        vm.expectRevert(bytes("SBT: non-transferable"));
        sbt.transferFrom(student, other, tokenId);
    }

    function testRevokeOnlyOwnerAndMarksRevoked() public {
        vm.prank(owner);
        uint256 tokenId = sbt.mint(student, "ipfs://cid-5");

        vm.prank(other);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, other));
        sbt.revoke(tokenId);

        vm.prank(owner);
        sbt.revoke(tokenId);
        assertTrue(sbt.revoked(tokenId));
    }

    function testSupportsIERC5192Interface() public view {
        assertTrue(sbt.supportsInterface(type(IERC5192).interfaceId));
    }
}
