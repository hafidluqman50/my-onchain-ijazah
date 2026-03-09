package utils

import (
	"crypto/rand"
	"math/big"
)

const codeChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

func GenerateVerificationCode(length int) string {
	out := make([]byte, length)
	max := big.NewInt(int64(len(codeChars)))
	for i := 0; i < length; i++ {
		n, err := rand.Int(rand.Reader, max)
		if err != nil {
			out[i] = codeChars[0]
			continue
		}
		out[i] = codeChars[n.Int64()]
	}
	return string(out)
}
