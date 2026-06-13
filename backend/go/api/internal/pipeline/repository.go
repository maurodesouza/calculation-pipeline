package pipeline

import (
	"context"
	"errors"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SyncResult struct {
	Created int
	Updated int
	Deleted int
}

type ListFilters struct {
	Limit  int
	Offset int
	Name   string
	ID     string
	SortBy string
}

type CountFilters struct {
	Name string
	ID   string
}

type PipelineRepository struct {
	pool *pgxpool.Pool
}

func NewPipelineRepository(pool *pgxpool.Pool) *PipelineRepository {
	return &PipelineRepository{pool: pool}
}

func (r *PipelineRepository) Save(ctx context.Context, pipeline *Pipeline) error {
	query := `
		INSERT INTO cp.pipelines (id, name, description, initial_step_id, canvas, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := r.pool.Exec(
		ctx,
		query,
		pipeline.GetId(),
		pipeline.GetName(),
		pipeline.GetDescription(),
		pipeline.GetInitialStepId(),
		pipeline.GetCanvas(),
		pipeline.GetCreatedAt(),
		pipeline.GetUpdatedAt(),
	)

	if err != nil {
		return err
	}

	return nil
}

func (r *PipelineRepository) GetByID(ctx context.Context, id string) (*Pipeline, error) {
	query := `SELECT id, name, description, initial_step_id, canvas, created_at, updated_at FROM cp.pipelines WHERE id = $1`

	var row struct {
		ID            string
		Name          *string
		Description   *string
		InitialStepID *string `db:"initial_step_id"`
		Canvas        string
		CreatedAt     string `db:"created_at"`
		UpdatedAt     string `db:"updated_at"`
	}

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&row.ID,
		&row.Name,
		&row.Description,
		&row.InitialStepID,
		&row.Canvas,
		&row.CreatedAt,
		&row.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	steps, err := r.getSteps(ctx, id)
	if err != nil {
		return nil, err
	}

	pipeline, err := RestorePipeline(RestorePipelinePayload{
		ID:            row.ID,
		Name:          row.Name,
		Description:   row.Description,
		InitialStepId: row.InitialStepID,
		Steps:         steps,
		Canvas:        &row.Canvas,
		CreatedAt:     row.CreatedAt,
		UpdatedAt:     row.UpdatedAt,
	})

	if err != nil {
		return nil, err
	}

	return pipeline, nil
}

func (r *PipelineRepository) Update(ctx context.Context, pipeline *Pipeline) error {
	query := `
		UPDATE cp.pipelines
		SET name = $1, description = $2, initial_step_id = $3, canvas = $4, updated_at = $5
		WHERE id = $6
	`

	_, err := r.pool.Exec(
		ctx,
		query,
		pipeline.GetName(),
		pipeline.GetDescription(),
		pipeline.GetInitialStepId(),
		pipeline.GetCanvas(),
		pipeline.GetUpdatedAt(),
		pipeline.GetId(),
	)

	if err != nil {
		return err
	}

	return nil
}

func (r *PipelineRepository) Sync(ctx context.Context, pipeline *Pipeline) (SyncResult, error) {
	existingSteps, err := r.getSteps(ctx, pipeline.GetId())
	if err != nil {
		return SyncResult{}, err
	}

	newSteps := pipeline.GetSteps()
	existingStepIds := make(map[string]bool)
	newStepIds := make(map[string]bool)

	for _, s := range existingSteps {
		existingStepIds[s.GetId()] = true
	}
	for _, s := range newSteps {
		newStepIds[s.GetId()] = true
	}

	var toCreate, toUpdate, toDelete []Step

	for _, step := range newSteps {
		if existingStepIds[step.GetId()] {
			toUpdate = append(toUpdate, step)
		} else {
			toCreate = append(toCreate, step)
		}
	}

	for _, step := range existingSteps {
		if !newStepIds[step.GetId()] {
			toDelete = append(toDelete, step)
		}
	}

	result := SyncResult{}

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return SyncResult{}, err
	}
	defer tx.Rollback(ctx)

	for _, step := range toCreate {
		if err := r.saveStepWithTx(ctx, tx, step); err != nil {
			return SyncResult{}, err
		}
		result.Created++
	}

	for _, step := range toUpdate {
		if err := r.updateStepWithTx(ctx, tx, step); err != nil {
			return SyncResult{}, err
		}
		result.Updated++
	}

	for _, step := range toDelete {
		_, err := tx.Exec(ctx, "UPDATE cp.pipelines SET initial_step_id = NULL WHERE initial_step_id = $1", step.GetId())
		if err != nil {
			return SyncResult{}, err
		}

		if err := r.deleteStepWithTx(ctx, tx, step.GetId()); err != nil {
			return SyncResult{}, err
		}
		result.Deleted++
	}

	if err := r.updateWithTx(ctx, tx, pipeline); err != nil {
		return SyncResult{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return SyncResult{}, err
	}

	return result, nil
}

func (r *PipelineRepository) List(ctx context.Context, filters ListFilters) ([]Pipeline, error) {
	allowedSortColumns := map[string]bool{
		"created_at": true,
		"updated_at": true,
	}
	sortBy := filters.SortBy
	if !allowedSortColumns[sortBy] {
		sortBy = "created_at"
	}

	query := "SELECT id, name, description, initial_step_id, canvas, created_at, updated_at FROM cp.pipelines"
	var conditions []string
	var params []interface{}
	paramIndex := 1

	if filters.Name != "" {
		conditions = append(conditions, "name ILIKE $"+strconv.Itoa(paramIndex))
		params = append(params, "%"+filters.Name+"%")
		paramIndex++
	}

	if filters.ID != "" {
		conditions = append(conditions, "id ILIKE $"+strconv.Itoa(paramIndex))
		params = append(params, "%"+filters.ID+"%")
		paramIndex++
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	query += " ORDER BY " + sortBy + " DESC LIMIT $" + strconv.Itoa(paramIndex) + " OFFSET $" + strconv.Itoa(paramIndex+1)
	params = append(params, filters.Limit, filters.Offset)

	rows, err := r.pool.Query(ctx, query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pipelineRows []struct {
		ID            string
		Name          *string
		Description   *string
		InitialStepID *string
		Canvas        string
		CreatedAt     string
		UpdatedAt     string
	}
	var pipelineIDs []string

	for rows.Next() {
		var row struct {
			ID            string
			Name          *string
			Description   *string
			InitialStepID *string
			Canvas        string
			CreatedAt     string
			UpdatedAt     string
		}

		err := rows.Scan(&row.ID, &row.Name, &row.Description, &row.InitialStepID, &row.Canvas, &row.CreatedAt, &row.UpdatedAt)
		if err != nil {
			return nil, err
		}

		pipelineRows = append(pipelineRows, row)
		pipelineIDs = append(pipelineIDs, row.ID)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	stepsByPipelineID, err := r.getStepsByPipelineIDs(ctx, pipelineIDs)
	if err != nil {
		return nil, err
	}

	var pipelines []Pipeline
	for _, row := range pipelineRows {
		steps := stepsByPipelineID[row.ID]

		pipeline, err := RestorePipeline(RestorePipelinePayload{
			ID:            row.ID,
			Name:          row.Name,
			Description:   row.Description,
			InitialStepId: row.InitialStepID,
			Steps:         steps,
			Canvas:        &row.Canvas,
			CreatedAt:     row.CreatedAt,
			UpdatedAt:     row.UpdatedAt,
		})
		if err != nil {
			return nil, err
		}

		pipelines = append(pipelines, *pipeline)
	}

	return pipelines, nil
}

func (r *PipelineRepository) Count(ctx context.Context, filters CountFilters) (int, error) {
	query := "SELECT COUNT(*) as total FROM cp.pipelines"
	var conditions []string
	var params []interface{}
	paramIndex := 1

	if filters.Name != "" {
		conditions = append(conditions, "name ILIKE $"+strconv.Itoa(paramIndex))
		params = append(params, "%"+filters.Name+"%")
		paramIndex++
	}

	if filters.ID != "" {
		conditions = append(conditions, "id ILIKE $"+strconv.Itoa(paramIndex))
		params = append(params, "%"+filters.ID+"%")
		paramIndex++
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	var total int
	err := r.pool.QueryRow(ctx, query, params...).Scan(&total)
	if err != nil {
		return 0, err
	}

	return total, nil
}

func (r *PipelineRepository) getSteps(ctx context.Context, pipelineID string) ([]Step, error) {
	query := `SELECT id, pipeline_id, name, description, operation, by, next_step_id, created_at, updated_at FROM cp.steps WHERE pipeline_id = $1 ORDER BY created_at`

	rows, err := r.pool.Query(ctx, query, pipelineID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var steps []Step
	for rows.Next() {
		var row struct {
			ID          string
			PipelineID  string `db:"pipeline_id"`
			Name        *string
			Description *string
			Operation   string
			By          int
			NextStepID  *string `db:"next_step_id"`
			CreatedAt   string  `db:"created_at"`
			UpdatedAt   string  `db:"updated_at"`
		}

		err := rows.Scan(&row.ID, &row.PipelineID, &row.Name, &row.Description, &row.Operation, &row.By, &row.NextStepID, &row.CreatedAt, &row.UpdatedAt)
		if err != nil {
			return nil, err
		}

		step, err := RestoreStep(RestoreStepPayload{
			ID:          row.ID,
			PipelineID:  row.PipelineID,
			Name:        row.Name,
			Description: row.Description,
			Operation:   row.Operation,
			By:          row.By,
			NextStepID:  row.NextStepID,
			CreatedAt:   row.CreatedAt,
			UpdatedAt:   row.UpdatedAt,
		})
		if err != nil {
			return nil, err
		}

		steps = append(steps, *step)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return steps, nil
}

func (r *PipelineRepository) getStepsByPipelineIDs(ctx context.Context, pipelineIDs []string) (map[string][]Step, error) {
	if len(pipelineIDs) == 0 {
		return map[string][]Step{}, nil
	}

	placeholders := make([]string, len(pipelineIDs))
	params := make([]interface{}, len(pipelineIDs))
	for i, id := range pipelineIDs {
		placeholders[i] = "$" + strconv.Itoa(i+1)
		params[i] = id
	}

	query := "SELECT id, pipeline_id, name, description, operation, by, next_step_id, created_at, updated_at FROM cp.steps WHERE pipeline_id IN (" + strings.Join(placeholders, ", ") + ") ORDER BY created_at"

	rows, err := r.pool.Query(ctx, query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	stepsByPipelineID := make(map[string][]Step)

	for rows.Next() {
		var row struct {
			ID          string
			PipelineID  string
			Name        *string
			Description *string
			Operation   string
			By          int
			NextStepID  *string
			CreatedAt   string
			UpdatedAt   string
		}

		err := rows.Scan(&row.ID, &row.PipelineID, &row.Name, &row.Description, &row.Operation, &row.By, &row.NextStepID, &row.CreatedAt, &row.UpdatedAt)
		if err != nil {
			return nil, err
		}

		step, err := RestoreStep(RestoreStepPayload{
			ID:          row.ID,
			PipelineID:  row.PipelineID,
			Name:        row.Name,
			Description: row.Description,
			Operation:   row.Operation,
			By:          row.By,
			NextStepID:  row.NextStepID,
			CreatedAt:   row.CreatedAt,
			UpdatedAt:   row.UpdatedAt,
		})
		if err != nil {
			return nil, err
		}

		stepsByPipelineID[row.PipelineID] = append(stepsByPipelineID[row.PipelineID], *step)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return stepsByPipelineID, nil
}

func (r *PipelineRepository) saveStepWithTx(ctx context.Context, tx pgx.Tx, step Step) error {
	query := `
		INSERT INTO cp.steps (id, pipeline_id, name, description, operation, by, next_step_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err := tx.Exec(
		ctx,
		query,
		step.GetId(),
		step.GetPipelineId(),
		step.GetName(),
		step.GetDescription(),
		step.GetOperation(),
		step.GetBy(),
		step.GetNextStepId(),
		step.GetCreatedAt(),
		step.GetUpdatedAt(),
	)

	return err
}

func (r *PipelineRepository) updateStepWithTx(ctx context.Context, tx pgx.Tx, step Step) error {
	query := `
		UPDATE cp.steps
		SET name = $1, description = $2, operation = $3, by = $4, next_step_id = $5, updated_at = $6
		WHERE id = $7
	`

	_, err := tx.Exec(
		ctx,
		query,
		step.GetName(),
		step.GetDescription(),
		step.GetOperation(),
		step.GetBy(),
		step.GetNextStepId(),
		step.GetUpdatedAt(),
		step.GetId(),
	)

	return err
}

func (r *PipelineRepository) deleteStepWithTx(ctx context.Context, tx pgx.Tx, id string) error {
	_, err := tx.Exec(ctx, "DELETE FROM cp.steps WHERE id = $1", id)
	return err
}

func (r *PipelineRepository) updateWithTx(ctx context.Context, tx pgx.Tx, pipeline *Pipeline) error {
	query := `
		UPDATE cp.pipelines
		SET name = $1, description = $2, initial_step_id = $3, canvas = $4, updated_at = $5
		WHERE id = $6
	`

	initialStepID := pipeline.GetInitialStepId()

	_, err := tx.Exec(
		ctx,
		query,
		pipeline.GetName(),
		pipeline.GetDescription(),
		initialStepID,
		pipeline.GetCanvas(),
		pipeline.GetUpdatedAt(),
		pipeline.GetId(),
	)

	return err
}
