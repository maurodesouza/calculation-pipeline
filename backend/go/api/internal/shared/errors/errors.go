package errors

import (
	"errors"
)

var (
	DOMAIN_ERROR    = errors.New("domain error")
	CONFLICT_ERROR  = errors.New("conflict error")
	NOT_FOUND_ERROR = errors.New("not found error")
)
