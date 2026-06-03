package run

import (
	"slices"
	"time"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/shared/errors"
	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/shared/vo"
	"github.com/maurodesouza/calculation-pipeline/backend/go/api/utils"
)

type RunStatus string

const (
	RunStatusPending   RunStatus = "pending"
	RunStatusRunning   RunStatus = "running"
	RunStatusPaused    RunStatus = "paused"
	RunStatusCompleted RunStatus = "completed"
	RunStatusFailed    RunStatus = "failed"
)

var VALID_STATUS = []string{
	string(RunStatusPending),
	string(RunStatusRunning),
	string(RunStatusPaused),
	string(RunStatusCompleted),
	string(RunStatusFailed),
}

type Run struct {
	id         vo.UUID
	pipelineID vo.UUID
	payload    float64
	result     *float64
	status     RunStatus
	error      *string
	createdAt  time.Time
	updatedAt  time.Time
}

type NewRunPayload struct {
	PipelineId *string
	Payload    float64
}

func NewRun(payload NewRunPayload) (*Run, error) {
	if utils.IsStringNilOrEmpty(payload.PipelineId) {
		return nil, errors.RequiredPipelineIdError
	}

	pipelineID, err := vo.RestoreUUID(payload.PipelineId)
	if err != nil {
		return nil, err
	}

	var (
		now = time.Now()
		id  = vo.NewUUID()
	)

	return &Run{
		id:         id,
		pipelineID: pipelineID,
		payload:    payload.Payload,
		status:     RunStatusPending,
		createdAt:  now,
		updatedAt:  now,
	}, nil
}

type RestoreRunPayload struct {
	ID         string
	PipelineID string
	Payload    float64
	Result     *float64
	Status     string
	Error      *string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func RestoreRun(payload RestoreRunPayload) (Run, error) {
	id, err := vo.RestoreUUID(&payload.ID)
	if err != nil {
		return Run{}, err
	}

	pipelineID, err := vo.RestoreUUID(&payload.PipelineID)
	if err != nil {
		return Run{}, err
	}

	if !validateStatus(payload.Status) {
		return Run{}, errors.InvalidStatusError("run", payload.Status, VALID_STATUS)
	}

	createdAt, err := time.Parse(time.RFC3339, payload.CreatedAt.Format(time.RFC3339))
	if err != nil {
		return Run{}, err
	}

	updatedAt, err := time.Parse(time.RFC3339, payload.UpdatedAt.Format(time.RFC3339))
	if err != nil {
		return Run{}, err
	}

	return Run{
		id:         id,
		pipelineID: pipelineID,
		payload:    payload.Payload,
		result:     payload.Result,
		status:     RunStatus(payload.Status),
		error:      payload.Error,
		createdAt:  createdAt,
		updatedAt:  updatedAt,
	}, nil
}

func (entity *Run) Initialize() error {
	if entity.status != RunStatusPending {
		return errors.InvalidStateTransitionError("run", string(entity.status), string(RunStatusPending))
	}

	entity.status = RunStatusPending
	entity.updatedAt = time.Now()
	return nil
}

func (entity *Run) Complete(result float64) error {
	if entity.status != RunStatusRunning {
		return errors.InvalidStateTransitionError("run", string(entity.status), string(RunStatusRunning))
	}

	entity.status = RunStatusCompleted
	entity.result = &result
	entity.updatedAt = time.Now()

	return nil
}

func (entity *Run) Fail(error string) error {
	if entity.status != RunStatusRunning {
		return errors.InvalidStateTransitionError("run", string(entity.status), string(RunStatusRunning))
	}

	entity.status = RunStatusFailed
	entity.error = &error
	entity.updatedAt = time.Now()

	return nil
}

func (entity *Run) Pause() error {
	if entity.status != RunStatusRunning {
		return errors.InvalidStateTransitionError("run", string(entity.status), string(RunStatusRunning))
	}

	entity.status = RunStatusPaused
	entity.updatedAt = time.Now()

	return nil
}

func (entity *Run) Resume() error {
	if entity.status != RunStatusPaused {
		return errors.InvalidStateTransitionError("run", string(entity.status), string(RunStatusPaused))
	}

	entity.status = RunStatusRunning
	entity.updatedAt = time.Now()

	return nil
}

func (entity *Run) Finalize() error {
	if entity.status != RunStatusPaused && entity.status != RunStatusRunning {
		return errors.InvalidStateTransitionError("run", string(entity.status), "running or paused")
	}

	return nil
}

func (entity *Run) GetId() string {
	return entity.id.GetValue()
}

func (entity *Run) GetPipelineId() string {
	return entity.pipelineID.GetValue()
}

func (entity *Run) GetPayload() float64 {
	return entity.payload
}

func (entity *Run) GetResult() *float64 {
	return entity.result
}

func (entity *Run) GetStatus() string {
	return string(entity.status)
}

func (entity *Run) GetError() *string {
	return entity.error
}

func (entity *Run) GetCreatedAt() string {
	return entity.createdAt.Format(time.RFC3339)
}

func (entity *Run) GetUpdatedAt() string {
	return entity.updatedAt.Format(time.RFC3339)
}

func validateStatus(status string) bool {
	return slices.Contains(VALID_STATUS, status)
}
