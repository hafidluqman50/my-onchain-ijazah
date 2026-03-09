package verify

import (
	verifyhandlers "my-onchain-ijazah/backend/src/handlers/verify"

	"github.com/gin-gonic/gin"
)

func Register(group *gin.RouterGroup, handler verifyhandlers.VerifyHandler) {
	group.GET("/verify", handler.Verify)
}
