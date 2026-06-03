package vo

import (
	"fmt"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/shared/errors"
)

var (
	RequiredUUIDError = fmt.Errorf("%w: uuid is required", errors.DOMAIN_ERROR)
	InvalidUUIDError  = fmt.Errorf("%w: uuid is invalid", errors.DOMAIN_ERROR)
)
