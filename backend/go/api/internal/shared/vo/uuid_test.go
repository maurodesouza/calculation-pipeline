package vo

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestUUID_Create(t *testing.T) {
	uuid := NewUUID()

	assert.NotEmpty(t, uuid.GetValue())
	assert.Regexp(t, "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", uuid.GetValue())
}

func TestUUID_Create_DifferentUUIDs(t *testing.T) {
	uuid1 := NewUUID()
	uuid2 := NewUUID()

	assert.NotEmpty(t, uuid1.GetValue())
	assert.NotEmpty(t, uuid2.GetValue())
	assert.NotEqual(t, uuid1.GetValue(), uuid2.GetValue())
}

func TestUUID_Restore(t *testing.T) {
	validUuid := uuid.New().String()
	uuid, err := RestoreUUID(&validUuid)

	assert.NoError(t, err)
	assert.Equal(t, validUuid, uuid.GetValue())
}

func TestUUID_Restore_InvalidUUID(t *testing.T) {

	{
		var invalidUuid *string
		_, err := RestoreUUID(invalidUuid)
		assert.Equal(t, RequiredUUIDError, err)
	}

	{
		invalidUuid := ""
		_, err := RestoreUUID(&invalidUuid)
		assert.Equal(t, InvalidUUIDError, err)
	}

	{
		invalidUuid := "invalid-uuid"
		_, err := RestoreUUID(&invalidUuid)
		assert.Equal(t, InvalidUUIDError, err)
	}

	{
		invalidUuid := "550e8400-e29b-41d4-a716"
		_, err := RestoreUUID(&invalidUuid)
		assert.Equal(t, InvalidUUIDError, err)
	}
}
