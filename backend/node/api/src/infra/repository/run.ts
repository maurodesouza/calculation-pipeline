import { Run } from "../../domain/entities/run";
import { SQLDatabaseConnection } from "../../application/database/sql-database-connection";
import { inject } from "../DI/container";

export interface RunRepository {
	save(run: Run): Promise<[undefined, undefined] | [undefined, Error]>;
	getById(id: string): Promise<[Run | undefined, undefined] | [undefined, Error]>;
	getByPipelineId(pipelineId: string): Promise<[Run[], undefined] | [undefined, Error]>;
	update(run: Run): Promise<[undefined, undefined] | [undefined, Error]>;
}

export class RunRepositoryDAO implements RunRepository {
	@inject("sql-connection")
	declare private readonly connection: SQLDatabaseConnection;

	async save(run: Run): Promise<[undefined, undefined] | [undefined, Error]> {
		const query = `
			INSERT INTO cp.runs (id, pipeline_id, payload, result, status, error, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		`;

		const values = [
			run.getId(),
			run.getPipelineId(),
			run.getPayload(),
			run.getResult() || null,
			run.getStatus(),
			run.getError() || null,
			run.getCreatedAt(),
			run.getUpdatedAt(),
		];

		const [, error] = await this.connection.query(query, values);
		if (error) return [undefined, error];

		return [undefined, undefined];
	}

	async getById(id: string): Promise<[Run | undefined, undefined] | [undefined, Error]> {
		const query = `
			SELECT id, pipeline_id, payload, result, status, error, created_at, updated_at
			FROM cp.runs
			WHERE id = $1
		`;

		const [rows, error] = await this.connection.query(query, [id]);
		if (error) return [undefined, error];

		if (!rows || rows.length === 0) return [undefined, undefined];

		const row = rows[0];
		const [run, restoreError] = Run.restore({
			id: row.id,
			pipelineId: row.pipeline_id,
			payload: Number(row.payload),
			result: row.result ? Number(row.result) : undefined,
			status: row.status,
			error: row.error,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});

		if (restoreError) return [undefined, restoreError];

		return [run, undefined];
	}

	async getByPipelineId(pipelineId: string): Promise<[Run[], undefined] | [undefined, Error]> {
		const query = `
			SELECT id, pipeline_id, payload, result, status, error, created_at, updated_at
			FROM cp.runs
			WHERE pipeline_id = $1
			ORDER BY created_at DESC
		`;

		const [rows, error] = await this.connection.query(query, [pipelineId]);
		if (error) return [undefined, error];

		if (!rows || rows.length === 0) return [[], undefined];

		const runs: Run[] = [];
		for (const row of rows) {
			const [run, restoreError] = Run.restore({
				id: row.id,
				pipelineId: row.pipeline_id,
				payload: Number(row.payload),
				result: row.result ? Number(row.result) : undefined,
				status: row.status,
				error: row.error,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
			});

			if (restoreError) return [undefined, restoreError];
			runs.push(run!);
		}

		return [runs, undefined];
	}

	async update(run: Run): Promise<[undefined, undefined] | [undefined, Error]> {
		const query = `
			UPDATE cp.runs
			SET result = $1, status = $2, error = $3, updated_at = $4
			WHERE id = $5
		`;

		const values = [
			run.getResult() || null,
			run.getStatus(),
			run.getError() || null,
			run.getUpdatedAt(),
			run.getId(),
		];

		const [, error] = await this.connection.query(query, values);
		if (error) return [undefined, error];

		return [undefined, undefined];
	}
}
