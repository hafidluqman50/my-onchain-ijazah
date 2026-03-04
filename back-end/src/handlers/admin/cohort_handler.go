package admin

import (
	"net/http"
	"strings"

	adminsvc "my-onchain-ijazah/backend/src/services/admin"

	"github.com/gin-gonic/gin"
)

type CohortHandler struct {
	Service adminsvc.CohortService
}

type createCohortRequest struct {
	Label string `json:"label"`
}

func (h CohortHandler) List(c *gin.Context) {
	items, err := h.Service.ListCohorts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load cohorts"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"cohorts": items})
}

func (h CohortHandler) Create(c *gin.Context) {
	var req createCohortRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	label := strings.TrimSpace(req.Label)
	if label == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "label required"})
		return
	}

	cohort, created, err := h.Service.FindOrCreate(label)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status := http.StatusOK
	if created {
		status = http.StatusCreated
	}
	c.JSON(status, gin.H{
		"cohort": gin.H{
			"id":    cohort.ID,
			"label": cohort.Label,
		},
		"created": created,
	})
}
