import { SQLDatabaseConnection } from "../../application/database/sql-database-connection";
import { Pipeline } from "../../domain/entities/pipeline";
import { inject } from "../DI/container";
import { PipelineNotFoundError } from "../../domain/errors";

export interface PipelineRepository {
    save(pipeline: Pipeline): Promise<[undefined, undefined] | [undefined, Error]>
    getById(id: string): Promise<[Pipeline, undefined] | [undefined, Error]>
    update(pipeline: Pipeline): Promise<[undefined, undefined] | [undefined, Error]>
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
        const [pipeline, restoreError] = Pipeline.restore({
            id: row.id,
            name: row.name,
            description: row.description,
            initialStepId: row.initial_step_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });

        if (restoreError) return [undefined, restoreError];

        return [pipeline, undefined];
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
}
