package vo

import "github.com/google/uuid"

type UUID struct {
	value string
}

func NewUUID() UUID {
	return UUID{
		value: uuid.New().String(),
	}
}

func RestoreUUID(value *string) (UUID, error) {
	err := validateUUID(value)

	if err != nil {
		return UUID{}, err
	}

	return UUID{*value}, nil
}

func (entity UUID) GetValue() string {
	return entity.value
}

func validateUUID(value *string) error {
	if value == nil {
		return RequiredUUIDError
	}

	_, err := uuid.Parse(*value)

	if err != nil {
		return InvalidUUIDError
	}

	return nil
}
