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
		INSERT INTO runs (id, pipeline_id, payload, result, status, error, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
		SELECT id, pipeline_id, payload, result, status, error, created_at, updated_at
		FROM runs
		WHERE id = $1
	`

	var run Run
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&run.id,
		&run.pipelineID,
		&run.payload,
		&run.result,
		&run.status,
		&run.error,
		&run.createdAt,
		&run.updatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}

		return nil, err
	}

	return &run, nil
}

func (r *RunRepository) GetByPipelineID(ctx context.Context, pipelineID string) ([]Run, error) {
	query := `
		SELECT id, pipeline_id, payload, result, status, error, created_at, updated_at
		FROM runs
		WHERE pipeline_id = $1
		ORDER BY created_at DESC
	`

	var runs []Run
	rows, err := r.pool.Query(ctx, query, pipelineID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var run Run
		err := rows.Scan(
			&run.id,
			&run.pipelineID,
			&run.payload,
			&run.result,
			&run.status,
			&run.error,
			&run.createdAt,
			&run.updatedAt,
		)

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
