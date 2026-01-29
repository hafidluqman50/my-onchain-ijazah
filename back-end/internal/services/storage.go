package services

import (
	"fmt"
	"os"
	"path/filepath"
)

type Storage struct {
	Dir string
}

func (s Storage) SaveEncrypted(id uint, data []byte) (string, error) {
	if err := os.MkdirAll(s.Dir, 0o755); err != nil {
		return "", err
	}
	filename := fmt.Sprintf("cert_%d.enc", id)
	path := filepath.Join(s.Dir, filename)
	if err := os.WriteFile(path, data, 0o600); err != nil {
		return "", err
	}
	return path, nil
}

func (s Storage) ReadEncrypted(id uint) ([]byte, error) {
	filename := fmt.Sprintf("cert_%d.enc", id)
	path := filepath.Join(s.Dir, filename)
	return os.ReadFile(path)
}
