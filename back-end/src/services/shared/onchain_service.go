package shared

import (
	"context"
	"errors"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

const certificateSBTABI = `[
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"string","name":"tokenURI_","type":"string"}],"name":"mint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"revoke","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Minted","type":"event"}
]`

type OnchainService struct {
	enabled         bool
	rpcURL          string
	contractAddress common.Address
	chainID         *big.Int
	privateKeyHex   string
}

type MintResult struct {
	TokenID         string
	ContractAddress string
	TxHash          string
}

func NewOnchainService(rpcURL string, privateKey string, contractAddress string, chainID string) (*OnchainService, error) {
	rpcURL = strings.TrimSpace(rpcURL)
	privateKey = strings.TrimSpace(privateKey)
	contractAddress = strings.TrimSpace(contractAddress)
	chainID = strings.TrimSpace(chainID)

	service := &OnchainService{}
	if rpcURL == "" || privateKey == "" || contractAddress == "" {
		return service, nil
	}

	if !common.IsHexAddress(contractAddress) {
		return nil, fmt.Errorf("invalid onchain contract address")
	}
	service.enabled = true
	service.rpcURL = rpcURL
	service.contractAddress = common.HexToAddress(contractAddress)
	service.privateKeyHex = privateKey

	if chainID != "" {
		parsed, ok := new(big.Int).SetString(chainID, 10)
		if !ok {
			return nil, fmt.Errorf("invalid CHAIN_ID")
		}
		service.chainID = parsed
	}

	return service, nil
}

func (s OnchainService) Mint(to string, tokenURI string) (*MintResult, error) {
	if !s.enabled {
		return nil, errors.New("onchain service is not configured")
	}
	if !common.IsHexAddress(strings.TrimSpace(to)) {
		return nil, errors.New("invalid wallet address")
	}

	client, err := ethclient.Dial(s.rpcURL)
	if err != nil {
		return nil, err
	}
	defer client.Close()

	chainID := s.chainID
	if chainID == nil {
		chainID, err = client.NetworkID(context.Background())
		if err != nil {
			return nil, err
		}
	}

	privateKeyHex := strings.TrimPrefix(s.privateKeyHex, "0x")
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return nil, err
	}
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		return nil, err
	}
	auth.Context = context.Background()

	parsedABI, err := abi.JSON(strings.NewReader(certificateSBTABI))
	if err != nil {
		return nil, err
	}
	contract := bind.NewBoundContract(s.contractAddress, parsedABI, client, client, client)

	tx, err := contract.Transact(auth, "mint", common.HexToAddress(strings.TrimSpace(to)), tokenURI)
	if err != nil {
		return nil, err
	}

	receipt, err := bind.WaitMined(context.Background(), client, tx)
	if err != nil {
		return nil, err
	}
	if receipt.Status != types.ReceiptStatusSuccessful {
		return nil, fmt.Errorf("mint transaction failed")
	}

	tokenID, err := parseMintedTokenID(parsedABI, receipt)
	if err != nil {
		return nil, err
	}

	return &MintResult{
		TokenID:         tokenID.String(),
		ContractAddress: s.contractAddress.Hex(),
		TxHash:          tx.Hash().Hex(),
	}, nil
}

func (s OnchainService) Revoke(tokenID string) (string, error) {
	if !s.enabled {
		return "", errors.New("onchain service is not configured")
	}
	id := new(big.Int)
	if _, ok := id.SetString(strings.TrimSpace(tokenID), 10); !ok {
		return "", errors.New("invalid token id")
	}

	client, err := ethclient.Dial(s.rpcURL)
	if err != nil {
		return "", err
	}
	defer client.Close()

	chainID := s.chainID
	if chainID == nil {
		chainID, err = client.NetworkID(context.Background())
		if err != nil {
			return "", err
		}
	}

	privateKeyHex := strings.TrimPrefix(s.privateKeyHex, "0x")
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return "", err
	}
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		return "", err
	}
	auth.Context = context.Background()

	parsedABI, err := abi.JSON(strings.NewReader(certificateSBTABI))
	if err != nil {
		return "", err
	}
	contract := bind.NewBoundContract(s.contractAddress, parsedABI, client, client, client)

	tx, err := contract.Transact(auth, "revoke", id)
	if err != nil {
		return "", err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()
	receipt, err := bind.WaitMined(ctx, client, tx)
	if err != nil {
		return "", err
	}
	if receipt.Status != types.ReceiptStatusSuccessful {
		return "", fmt.Errorf("revoke transaction failed")
	}

	return tx.Hash().Hex(), nil
}

func parseMintedTokenID(parsedABI abi.ABI, receipt *types.Receipt) (*big.Int, error) {
	event := parsedABI.Events["Minted"]
	for _, log := range receipt.Logs {
		if len(log.Topics) == 0 || log.Topics[0] != event.ID {
			continue
		}
		if len(log.Topics) < 2 {
			continue
		}
		return log.Topics[1].Big(), nil
	}
	return nil, errors.New("minted event not found in receipt")
}
