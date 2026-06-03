package pipeline

import (
	"encoding/json"
	"slices"
	"time"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/shared/vo"
	"github.com/maurodesouza/calculation-pipeline/backend/go/api/utils"
)

type Pipeline struct {
	id            vo.UUID
	name          *string
	description   *string
	initialStepId *vo.UUID
	steps         []Step
	canvas        string
	createdAt     time.Time
	updatedAt     time.Time
}

type NewPipelinePayload struct {
	ID            *string
	Name          *string
	Description   *string
	InitialStepId *string
	Canvas        *string
}

func NewPipeline(payload NewPipelinePayload) (*Pipeline, error) {
	initialStepId, err := getInitialStepID(payload.InitialStepId)
	if err != nil {
		return nil, err
	}
	canvas := getCanvas(payload.Canvas)
	if err := validateCanvas(canvas); err != nil {
		return nil, err
	}

	id := vo.NewUUID()
	now := time.Now()

	return &Pipeline{
		id:            id,
		name:          payload.Name,
		description:   payload.Description,
		initialStepId: initialStepId,
		steps:         []Step{},
		canvas:        canvas,
		createdAt:     now,
		updatedAt:     now,
	}, nil
}

type RestorePipelinePayload struct {
	ID            string
	Name          *string
	Description   *string
	InitialStepId *string
	Steps         []Step
	Canvas        *string
	CreatedAt     string
	UpdatedAt     string
}

func RestorePipeline(payload RestorePipelinePayload) (*Pipeline, error) {
	id, err := vo.RestoreUUID(&payload.ID)
	if err != nil {
		return nil, err
	}

	initialStepId, err := getInitialStepID(payload.InitialStepId)
	if err != nil {
		return nil, err
	}
	canvas := getCanvas(payload.Canvas)
	if err := validateCanvas(canvas); err != nil {
		return nil, err
	}

	createdAt, err := time.Parse(time.RFC3339, payload.CreatedAt)
	if err != nil {
		return nil, err
	}

	updatedAt, err := time.Parse(time.RFC3339, payload.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &Pipeline{
		id:            id,
		name:          payload.Name,
		description:   payload.Description,
		initialStepId: initialStepId,
		steps:         payload.Steps,
		canvas:        canvas,
		createdAt:     createdAt,
		updatedAt:     updatedAt,
	}, nil
}

type StepInput struct {
	ID          string
	Name        *string
	Description *string
	Operation   string
	By          int
	NextStepId  *string
}

func RestoreSteps(pipeline *Pipeline, stepInputs []StepInput) ([]Step, error) {
	var (
		pipelineId       = pipeline.GetId()
		existingStepsIds []string
		chain            []Step
	)

	existingSteps := pipeline.GetSteps()

	for _, step := range existingSteps {
		existingStepsIds = append(existingStepsIds, step.GetId())
	}

	for _, stepInput := range stepInputs {
		if slices.Contains(existingStepsIds, stepInput.ID) {
			existingStep := existingSteps[slices.IndexFunc(existingSteps, func(step Step) bool {
				return step.GetId() == stepInput.ID
			})]

			step, err := RestoreStep(RestoreStepPayload{
				ID:          stepInput.ID,
				Name:        stepInput.Name,
				Description: stepInput.Description,
				Operation:   stepInput.Operation,
				By:          stepInput.By,
				NextStepID:  stepInput.NextStepId,
				PipelineID:  pipelineId,
				CreatedAt:   existingStep.GetCreatedAt(),
				UpdatedAt:   time.Now().Format(time.RFC3339),
			})

			if err != nil {
				return nil, err
			}

			chain = append(chain, *step)
		} else {
			step, err := NewStep(NewStepPayload{
				ID:          &stepInput.ID,
				Name:        stepInput.Name,
				Description: stepInput.Description,
				Operation:   stepInput.Operation,
				By:          stepInput.By,
				NextStepID:  stepInput.NextStepId,
				PipelineID:  &pipelineId,
			})

			if err != nil {
				return nil, err
			}

			chain = append(chain, *step)
		}
	}

	return chain, nil
}

func (entity *Pipeline) SetName(value *string) {
	entity.name = value
	entity.updatedAt = time.Now()
}

func (entity *Pipeline) SetDescription(value *string) {
	entity.description = value
	entity.updatedAt = time.Now()
}

func (entity *Pipeline) SetCanvas(value *string) error {
	err := validateCanvas(*value)

	if err != nil {
		return err
	}

	entity.canvas = *value
	entity.updatedAt = time.Now()

	return nil
}

func (entity *Pipeline) SetSteps(steps []Step) error {
	err := validateStepChain(steps)
	if err != nil {
		return err
	}

	initialStepId, err := getInitialStepIDFromSteps(steps)
	if err != nil {
		return err
	}

	entity.steps = steps
	entity.initialStepId = initialStepId
	entity.updatedAt = time.Now()

	return nil
}

func (entity *Pipeline) GetId() string {
	return entity.id.GetValue()
}

func (entity *Pipeline) GetName() *string {
	return entity.name
}

func (entity *Pipeline) GetDescription() *string {
	return entity.description
}

func (entity *Pipeline) GetInitialStepId() *string {
	if entity.initialStepId == nil {
		return nil
	}
	value := entity.initialStepId.GetValue()
	return &value
}

func (entity *Pipeline) GetCreatedAt() string {
	return entity.createdAt.Format(time.RFC3339)
}

func (entity *Pipeline) GetUpdatedAt() string {
	return entity.updatedAt.Format(time.RFC3339)
}

func (entity *Pipeline) GetSteps() []Step {
	return entity.steps
}

func (entity *Pipeline) GetCanvas() string {
	return entity.canvas
}

func validateStepChain(steps []Step) error {
	for index, step := range steps {
		isLast := index == len(steps)-1

		if isLast {
			nextStepId := step.GetNextStepId()

			if !utils.IsStringNilOrEmpty(&nextStepId) {
				return InvalidStateTransitionError("step", nextStepId, "last step should not have nextStepId")
			}
		}

		nextStep := steps[index+1]
		nextStepId := step.GetNextStepId()

		if nextStepId != nextStep.GetId() {
			return InvalidStateTransitionError("step", nextStepId, nextStep.GetId())
		}
	}

	return nil
}

func validateCanvas(value string) error {
	var v any

	if err := json.Unmarshal([]byte(value), &v); err != nil {
		return err
	}

	return nil
}

func getInitialStepID(value *string) (*vo.UUID, error) {
	if value == nil {
		return nil, nil
	}

	uuid, err := vo.RestoreUUID(value)
	if err != nil {
		return nil, err
	}

	return &uuid, nil
}

func getInitialStepIDFromSteps(steps []Step) (*vo.UUID, error) {
	if len(steps) == 0 {
		return nil, nil
	}

	id := steps[0].GetId()
	uuid, err := vo.RestoreUUID(&id)

	if err != nil {
		return nil, err
	}

	return &uuid, nil
}

func getCanvas(value *string) string {
	if utils.IsStringNilOrEmpty(value) {
		return "{}"
	}

	return *value
}
