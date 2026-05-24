import { SQLDatabaseConnection } from "../../application/database/sql-database-connection";
import { Step } from "../../domain/entities/step";
import { inject } from "../DI/container";

export interface StepRepository {
	getByPipelineId(pipelineId: string): Promise<[Step[], undefined] | [undefined, Error]>
	save(step: Step): Promise<[undefined, undefined] | [undefined, Error]>
	update(step: Step): Promise<[undefined, undefined] | [undefined, Error]>
	delete(id: string): Promise<[undefined, undefined] | [undefined, Error]>
	sync(toCreate: Step[], toUpdate: Step[], toDelete: Step[]): Promise<[{ created: number; updated: number; deleted: number }, undefined] | [undefined, Error]>
}

export class StepRepositoryDAO implements StepRepository {
	@inject("sql-connection")
	declare private readonly sql: SQLDatabaseConnection;

	async getByPipelineId(pipelineId: string): Promise<[Step[], undefined] | [undefined, Error]> {
		const [result, error] = await this.sql.query(
			"SELECT * FROM cp.steps WHERE pipeline_id = $1 ORDER BY created_at",
			[pipelineId]
		);

		if (error) return [undefined, error];

		if (!result || result.length === 0) {
			return [[], undefined];
		}

		const steps: Step[] = [];
		for (const row of result) {
			const [step, restoreError] = Step.restore({
				id: row.id,
				pipelineId: row.pipeline_id,
				name: row.name,
				description: row.description,
				nextStepId: row.next_step_id,
				operation: row.operation,
				by: Number(row.by),
				createdAt: row.created_at,
				updatedAt: row.updated_at,
			});

			if (restoreError) return [undefined, restoreError];
			steps.push(step);
		}

		return [steps, undefined];
	}

	async save(step: Step): Promise<[undefined, undefined] | [undefined, Error]> {
		const [, error] = await this.sql.query(
			"INSERT INTO cp.steps (id, pipeline_id, name, description, operation, by, next_step_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
			[
				step.getId(),
				step.getPipelineId(),
				step.getName(),
				step.getDescription(),
				step.getOperation(),
				step.getBy(),
				step.getNextStepId(),
				step.getCreatedAt(),
				step.getUpdatedAt(),
			]
		);
		if (error) return [undefined, error];
		return [undefined, undefined];
	}

	async update(step: Step): Promise<[undefined, undefined] | [undefined, Error]> {
		const [, error] = await this.sql.query(
			"UPDATE cp.steps SET name = $1, description = $2, operation = $3, by = $4, next_step_id = $5, updated_at = $6 WHERE id = $7",
			[
				step.getName(),
				step.getDescription(),
				step.getOperation(),
				step.getBy(),
				step.getNextStepId(),
				step.getUpdatedAt(),
				step.getId(),
			]
		);
		if (error) return [undefined, error];
		return [undefined, undefined];
	}

	async delete(id: string): Promise<[undefined, undefined] | [undefined, Error]> {
		const [, error] = await this.sql.query(
			"DELETE FROM cp.steps WHERE id = $1",
			[id]
		);
		if (error) return [undefined, error];
		return [undefined, undefined];
	}

	async sync(toCreate: Step[], toUpdate: Step[], toDelete: Step[]): Promise<[{ created: number; updated: number; deleted: number }, undefined] | [undefined, Error]> {
		const output = { created: 0, updated: 0, deleted: 0 };

		const [, error] = await this.sql.transaction(async () => {
			for (const step of toCreate) {
				const [, saveError] = await this.save(step);
				if (saveError) throw saveError;
				output.created++;
			}

			for (const step of toUpdate) {
				const [, updateError] = await this.update(step);
				if (updateError) throw updateError;
				output.updated++;
			}

			for (const step of toDelete) {
				const [, deleteError] = await this.delete(step.getId());
				if (deleteError) throw deleteError;
				output.deleted++;
			}
		});

		if (error) return [undefined, error];
		return [output, undefined];
	}
}
