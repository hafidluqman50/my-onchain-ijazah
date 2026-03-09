// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {CertificateSBT} from "src/CertificateSBT.sol";

contract DeployCertificateSBT is Script {
    function run() external returns (CertificateSBT deployed) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        // Optional override. If not set, owner = broadcaster address.
        address owner;
        try vm.envAddress("OWNER_ADDRESS") returns (address configuredOwner) {
            owner = configuredOwner;
        } catch {
            owner = vm.addr(deployerKey);
        }

        vm.startBroadcast(deployerKey);
        deployed = new CertificateSBT(owner);
        vm.stopBroadcast();

        console2.log("CertificateSBT deployed at:", address(deployed));
        console2.log("Owner:", owner);
    }
}
