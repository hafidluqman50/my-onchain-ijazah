# Smart Contract

Contract SBT untuk ijazah on-chain berbasis ERC-721 + ERC-5192.

## Prerequisite
- Foundry terinstall (`forge --version`)
- RPC URL jaringan target
- Private key deployer

## Install dependency
```bash
forge install OpenZeppelin/openzeppelin-contracts --no-git
```

## Build & test
```bash
forge build
forge test -vv
```

## Deploy
Set environment variable:
```bash
export RPC_URL="https://..."
export PRIVATE_KEY="0x..."
# Optional, default-nya owner = address dari PRIVATE_KEY
export OWNER_ADDRESS="0x..."
```

Dry run:
```bash
forge script script/DeployCertificateSBT.s.sol:DeployCertificateSBT
```

Broadcast ke network:
```bash
forge script script/DeployCertificateSBT.s.sol:DeployCertificateSBT \
  --rpc-url "$RPC_URL" \
  --broadcast
```
