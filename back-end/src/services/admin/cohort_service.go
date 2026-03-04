package admin

import (
	"errors"
	"strings"

	"my-onchain-ijazah/backend/src/models"
	"my-onchain-ijazah/backend/src/repositories"

	"gorm.io/gorm"
)

type CohortService struct {
	Cohorts repositories.CohortRepository
}

func (s CohortService) ListCohorts() ([]models.Cohort, error) {
	return s.Cohorts.List()
}

func (s CohortService) FindOrCreate(label string) (*models.Cohort, bool, error) {
	normalized := normalizeLabel(label)
	if normalized == "" {
		return nil, false, errors.New("cohort_label required")
	}

	key := strings.ToLower(normalized)
	cohort, err := s.Cohorts.FindByLabelKey(key)
	if err == nil {
		return cohort, false, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, false, err
	}

	cohort = &models.Cohort{Label: normalized, LabelKey: key}
	if err := s.Cohorts.Create(cohort); err != nil {
		if existing, e2 := s.Cohorts.FindByLabelKey(key); e2 == nil {
			return existing, false, nil
		}
		return nil, false, err
	}
	return cohort, true, nil
}

func normalizeLabel(label string) string {
	parts := strings.Fields(strings.TrimSpace(label))
	return strings.Join(parts, " ")
}
