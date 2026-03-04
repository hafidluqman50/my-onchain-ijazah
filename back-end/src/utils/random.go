package utils

import (
	"crypto/rand"
	"math/big"
)

const readableChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"

func RandomReadablePassword(length int) string {
	out := make([]byte, length)
	max := big.NewInt(int64(len(readableChars)))
	for i := 0; i < length; i++ {
		n, err := rand.Int(rand.Reader, max)
		if err != nil {
			out[i] = readableChars[0]
			continue
		}
		out[i] = readableChars[n.Int64()]
	}
	return string(out)
}
