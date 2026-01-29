package verify

import (
	"net/http"

	verifysvc "my-onchain-ijazah/backend/internal/services/verify"

	"github.com/gin-gonic/gin"
)

type VerifyHandler struct {
	Service verifysvc.VerifyService
}

func (h VerifyHandler) Verify(c *gin.Context) {
	code := c.Query("code")
	tokenID := c.Query("tokenId")
	contract := c.Query("contract")
	hash := c.Query("hash")

	cert, err := h.Service.Verify(verifysvc.VerifyInput{
		Code:     code,
		TokenID:  tokenID,
		Contract: contract,
		Hash:     hash,
	})
	if err != nil {
		if err.Error() == "provide code or token/hash" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"document_hash":     cert.DocumentHash,
		"encrypted_cid":     cert.EncryptedCID,
		"issuer_did":        cert.IssuerDID,
		"status":            cert.Status,
		"issued_at":         cert.IssuedAt,
		"revoked_at":        cert.RevokedAt,
		"token_id":          cert.TokenID,
		"contract_address":  cert.ContractAddress,
		"verification_code": cert.VerificationCode,
	})
}
