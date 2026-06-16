package run

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RunRepository struct {
	pool *pgxpool.Pool
}

func NewRunRepository(pool *pgxpool.Pool) *RunRepository {
	return &RunRepository{
		pool,
	}
}

func (r *RunRepository) Save(ctx context.Context, run *Run) error {
	query := `
		INSERT INTO runs (id, pipeline_id, payload, result, status, error, source, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err := r.pool.Exec(
		ctx,
		query,
		run.GetId(),
		run.GetPipelineId(),
		run.GetPayload(),
		run.GetResult(),
		run.GetStatus(),
		run.GetError(),
		run.GetSource(),
		run.GetCreatedAt(),
		run.GetUpdatedAt(),
	)

	if err != nil {
		return err
	}

	return nil
}

func (r *RunRepository) GetById(ctx context.Context, id string) (*Run, error) {
	query := `
		SELECT id, pipeline_id, payload, result, status, error, source, created_at, updated_at
		FROM runs
		WHERE id = $1
	`

	var row struct {
		ID         string
		PipelineID string
		Payload    float64
		Result     *float64
		Status     string
		Error      *string
		Source     string
		CreatedAt  string
		UpdatedAt  string
	}

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&row.ID,
		&row.PipelineID,
		&row.Payload,
		&row.Result,
		&row.Status,
		&row.Error,
		&row.Source,
		&row.CreatedAt,
		&row.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}

		return nil, err
	}

	run, err := RestoreRun(RestoreRunPayload{
		ID:         row.ID,
		PipelineID: row.PipelineID,
		Payload:    row.Payload,
		Result:     row.Result,
		Status:     row.Status,
		Error:      row.Error,
		Source:     row.Source,
		CreatedAt:  row.CreatedAt,
		UpdatedAt:  row.UpdatedAt,
	})
	if err != nil {
		return nil, err
	}

	return &run, nil
}

func (r *RunRepository) GetByPipelineID(ctx context.Context, pipelineID string) ([]Run, error) {
	query := `
		SELECT id, pipeline_id, payload, result, status, error, source, created_at, updated_at
		FROM runs
		WHERE pipeline_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.pool.Query(ctx, query, pipelineID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var runs []Run
	for rows.Next() {
		var row struct {
			ID         string
			PipelineID string
			Payload    float64
			Result     *float64
			Status     string
			Error      *string
			Source     string
			CreatedAt  string
			UpdatedAt  string
		}

		err := rows.Scan(
			&row.ID,
			&row.PipelineID,
			&row.Payload,
			&row.Result,
			&row.Status,
			&row.Error,
			&row.Source,
			&row.CreatedAt,
			&row.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		run, err := RestoreRun(RestoreRunPayload{
			ID:         row.ID,
			PipelineID: row.PipelineID,
			Payload:    row.Payload,
			Result:     row.Result,
			Status:     row.Status,
			Error:      row.Error,
			Source:     row.Source,
			CreatedAt:  row.CreatedAt,
			UpdatedAt:  row.UpdatedAt,
		})
		if err != nil {
			return nil, err
		}

		runs = append(runs, run)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return runs, nil
}

func (r *RunRepository) Update(ctx context.Context, run *Run) error {
	query := `
		UPDATE runs
		SET result = $2, status = $3, error = $4, updated_at = $5
		WHERE id = $1
	`

	_, err := r.pool.Exec(
		ctx,
		query,
		run.GetId(),
		run.GetResult(),
		run.GetStatus(),
		run.GetError(),
		run.GetUpdatedAt(),
	)

	if err != nil {
		return err
	}

	return nil
}
