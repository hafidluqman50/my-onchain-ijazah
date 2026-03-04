package system

import (
	"my-onchain-ijazah/backend/src/handlers"

	"github.com/gin-gonic/gin"
)

func Register(group *gin.RouterGroup) {
	group.GET("/health", handlers.Health)
}
