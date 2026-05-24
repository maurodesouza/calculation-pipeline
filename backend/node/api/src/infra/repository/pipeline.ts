import { SQLDatabaseConnection } from "../../application/database/sql-database-connection";
import { Pipeline } from "../../domain/entities/pipeline";
import { Step } from "../../domain/entities/step";
import { inject } from "../DI/container";
import { PipelineNotFoundError } from "../../domain/errors";

export interface PipelineRepository {
    save(pipeline: Pipeline): Promise<[undefined, undefined] | [undefined, Error]>
    getById(id: string): Promise<[Pipeline, undefined] | [undefined, Error]>
    update(pipeline: Pipeline): Promise<[undefined, undefined] | [undefined, Error]>
    sync(pipeline: Pipeline): Promise<[{ created: number; updated: number; deleted: number }, undefined] | [undefined, Error]>
}

export class PipelineRepositoryDAO implements PipelineRepository {
	@inject("sql-connection")
	declare private readonly sql: SQLDatabaseConnection;

    async save(pipeline: Pipeline): Promise<[undefined, undefined] | [undefined, Error]> {
        const [, error] = await this.sql.query(
            "INSERT INTO cp.pipelines (id, name, description, initial_step_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)",
            [
                pipeline.getId(),
                pipeline.getName(),
                pipeline.getDescription(),
                pipeline.getInitialStepId(),
                pipeline.getCreatedAt(),
                pipeline.getUpdatedAt(),
            ]
        );
        if (error) return [undefined, error];
        return [undefined, undefined];
    }

    async update(pipeline: Pipeline): Promise<[undefined, undefined] | [undefined, Error]> {
        const [, error] = await this.sql.query(
            "UPDATE cp.pipelines SET name = $1, description = $2, initial_step_id = $3, updated_at = $4 WHERE id = $5",
            [
                pipeline.getName(),
                pipeline.getDescription(),
                pipeline.getInitialStepId(),
                pipeline.getUpdatedAt(),
                pipeline.getId(),
            ]
        );
        if (error) return [undefined, error];
        return [undefined, undefined];
    }

	async getById(id: string): Promise<[Pipeline, undefined] | [undefined, Error]> {
        const [result, error] = await this.sql.query(
            "SELECT * FROM cp.pipelines WHERE id = $1",
            [id]
        );

        if (error) return [undefined, error];

        if (!result || result.length === 0) {
            return [undefined, new PipelineNotFoundError(id)];
        }

        const row = result[0];

        const [steps, stepsError] = await this.getSteps(id);
        if (stepsError) return [undefined, stepsError];

        const [pipeline, restoreError] = Pipeline.restore({
            id: row.id,
            name: row.name,
            description: row.description,
            initialStepId: row.initial_step_id,
            steps,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });

        if (restoreError) return [undefined, restoreError];

        return [pipeline, undefined];
    }

    async sync(pipeline: Pipeline): Promise<[{ created: number; updated: number; deleted: number }, undefined] | [undefined, Error]> {
        const [existingSteps, fetchError] = await this.getSteps(pipeline.getId());
        if (fetchError) return [undefined, fetchError];

        const newSteps = pipeline.getSteps();
        const existingStepIds = new Set(existingSteps.map((s) => s.getId()));
        const newStepIds = new Set(newSteps.map((s) => s.getId()));

        const toCreate: Step[] = [];
        const toUpdate: Step[] = [];
        const toDelete: Step[] = [];

        for (const step of newSteps) {
            if (existingStepIds.has(step.getId())) {
                toUpdate.push(step);
            } else {
                toCreate.push(step);
            }
        }

        for (const step of existingSteps) {
            if (!newStepIds.has(step.getId())) {
                toDelete.push(step);
            }
        }

        const output = { created: 0, updated: 0, deleted: 0 };

        const [, error] = await this.sql.transaction(async () => {
            for (const step of toCreate) {
                const [, saveError] = await this.saveStep(step);
                if (saveError) throw saveError;
                output.created++;
            }

            for (const step of toUpdate) {
                const [, updateError] = await this.updateStep(step);
                if (updateError) throw updateError;
                output.updated++;
            }

            for (const step of toDelete) {
                const [, deleteError] = await this.deleteStep(step.getId());
                if (deleteError) throw deleteError;
                output.deleted++;
            }

            const [, updateError] = await this.update(pipeline);
            if (updateError) throw updateError;
        });

        if (error) return [undefined, error];
        return [output, undefined];
    }

    private async getSteps(pipelineId: string): Promise<[Step[], undefined] | [undefined, Error]> {
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

    private async saveStep(step: Step): Promise<[undefined, undefined] | [undefined, Error]> {
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

    private async updateStep(step: Step): Promise<[undefined, undefined] | [undefined, Error]> {
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

    private async deleteStep(id: string): Promise<[undefined, undefined] | [undefined, Error]> {
        const [, error] = await this.sql.query(
            "DELETE FROM cp.steps WHERE id = $1",
            [id]
        );
        if (error) return [undefined, error];
        return [undefined, undefined];
    }
}
