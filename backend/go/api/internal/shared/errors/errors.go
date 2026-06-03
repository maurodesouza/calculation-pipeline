package errors

import (
	"errors"
	"fmt"
)

var (
	DOMAIN_ERROR    = errors.New("domain error")
	CONFLICT_ERROR  = errors.New("conflict error")
	NOT_FOUND_ERROR = errors.New("not found error")
)

var (
	RequiredPipelineIdError = fmt.Errorf("%w: pipelineId is required", DOMAIN_ERROR)
	InvalidOperationError   = fmt.Errorf("%w: operation is invalid", DOMAIN_ERROR)
	RequiredOperationError  = fmt.Errorf("%w: operation is required", DOMAIN_ERROR)
)

func InvalidStatusError(entity string, currentStatus string, validStatus []string) error {
	return fmt.Errorf("[%s]: invalid status, current status is \"%s\", expected one of: %v", entity, currentStatus, validStatus)
}

func InvalidStateTransitionError(entity string, currentStatus string, expectedStatus string) error {
	return fmt.Errorf("[%s]: invalid state transition, current status is \"%s\", expected \"%s\"", entity, currentStatus, expectedStatus)
}
