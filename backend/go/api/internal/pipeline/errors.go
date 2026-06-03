package pipeline

import (
	"fmt"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/shared/errors"
)

var (
	RequiredPipelineIdError = fmt.Errorf("%w: pipelineId is required", errors.DOMAIN_ERROR)
	InvalidOperationError   = fmt.Errorf("%w: operation is invalid", errors.DOMAIN_ERROR)
	RequiredOperationError  = fmt.Errorf("%w: operation is required", errors.DOMAIN_ERROR)
)

func InvalidStateTransitionError(entity string, currentStatus string, expectedStatus string) error {
	return fmt.Errorf("[%s]: invalid state transition, current status is \"%s\", expected \"%s\"", entity, currentStatus, expectedStatus)
}
