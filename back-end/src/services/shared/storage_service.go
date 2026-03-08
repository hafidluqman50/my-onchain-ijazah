package shared

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const (
	StorageProviderLocal  = "local"
	StorageProviderPinata = "pinata"
)

type StorageService struct {
	provider      string
	localDir      string
	pinataJWT     string
	pinataGateway string
}

func NewStorageService(provider string, localDir string, pinataJWT string, pinataGateway string) (*StorageService, error) {
	provider = strings.TrimSpace(strings.ToLower(provider))
	if provider == "" {
		provider = StorageProviderLocal
	}

	service := &StorageService{
		provider:      provider,
		localDir:      localDir,
		pinataJWT:     pinataJWT,
		pinataGateway: strings.TrimSuffix(pinataGateway, "/"),
	}
	if service.pinataGateway == "" {
		service.pinataGateway = "https://gateway.pinata.cloud/ipfs"
	}

	if provider == StorageProviderPinata && strings.TrimSpace(pinataJWT) == "" {
		return nil, fmt.Errorf("pinata jwt is required for pinata storage provider")
	}
	return service, nil
}

func (s StorageService) SaveEncrypted(id uint, data []byte) (string, error) {
	if s.provider == StorageProviderPinata {
		return s.saveToPinata(id, data)
	}

	if err := os.MkdirAll(s.localDir, 0o755); err != nil {
		return "", err
	}
	path := filepath.Join(s.localDir, fmt.Sprintf("cert_%d.enc", id))
	if err := os.WriteFile(path, data, 0o600); err != nil {
		return "", err
	}
	return path, nil
}

func (s StorageService) ReadEncrypted(encryptedCID string, id uint) ([]byte, error) {
	if s.provider == StorageProviderPinata {
		cid := s.resolveIPFSCID(encryptedCID)
		if cid == "" {
			return nil, fmt.Errorf("missing ipfs cid")
		}
		res, err := http.Get(fmt.Sprintf("%s/%s", s.pinataGateway, cid))
		if err != nil {
			return nil, err
		}
		defer res.Body.Close()
		if res.StatusCode >= 400 {
			body, _ := io.ReadAll(res.Body)
			return nil, fmt.Errorf("failed reading ipfs file: %s", strings.TrimSpace(string(body)))
		}
		return io.ReadAll(res.Body)
	}

	path := encryptedCID
	if strings.TrimSpace(path) == "" || strings.HasPrefix(path, "ipfs://") {
		path = filepath.Join(s.localDir, fmt.Sprintf("cert_%d.enc", id))
	}
	return os.ReadFile(path)
}

func (s StorageService) saveToPinata(id uint, data []byte) (string, error) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	fileName := fmt.Sprintf("cert_%d.enc", id)
	part, err := writer.CreateFormFile("file", fileName)
	if err != nil {
		return "", err
	}
	if _, err := part.Write(data); err != nil {
		return "", err
	}
	metadata := fmt.Sprintf(`{"name":"%s"}`, fileName)
	if err := writer.WriteField("pinataMetadata", metadata); err != nil {
		return "", err
	}
	if err := writer.Close(); err != nil {
		return "", err
	}

	req, err := http.NewRequest(http.MethodPost, "https://api.pinata.cloud/pinning/pinFileToIPFS", &body)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+s.pinataJWT)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	resBody, err := io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}
	if res.StatusCode >= 400 {
		return "", fmt.Errorf("pinata upload failed: %s", strings.TrimSpace(string(resBody)))
	}

	var payload struct {
		IPFSHash string `json:"IpfsHash"`
	}
	if err := json.Unmarshal(resBody, &payload); err != nil {
		return "", err
	}
	if strings.TrimSpace(payload.IPFSHash) == "" {
		return "", fmt.Errorf("pinata upload response missing cid")
	}
	return "ipfs://" + payload.IPFSHash, nil
}

func (s StorageService) resolveIPFSCID(encryptedCID string) string {
	encryptedCID = strings.TrimSpace(encryptedCID)
	if strings.HasPrefix(encryptedCID, "ipfs://") {
		return strings.TrimPrefix(encryptedCID, "ipfs://")
	}
	return encryptedCID
}
