import pgPromise from "pg-promise";
import type { SQLDatabaseConnection } from "../../application/database/sql-database-connection";

export class PGPromiseAdapter implements SQLDatabaseConnection {
	connection: pgPromise.IDatabase<{}, any> | undefined;

	async connect(): Promise<void> {
		const pgp = pgPromise();
		this.connection = pgp("postgres://postgres:postgres@localhost:6543/app");

		console.info("[pg-promise-adapter]: connected successfully to database");
	}

	async query<T = any>(
		query: string,
		params: any[],
	): Promise<[T[], undefined] | [undefined, Error]> {
		this.validateConnection();
		try {
			const result = await this.connection!.query(query, params);
			return [result, undefined];
		} catch (error) {
			return [undefined, error as Error];
		}
	}

	async close(): Promise<void> {
		this.validateConnection();
		await this.connection!.$pool.end();

		console.info("[pg-promise-adapter]: disconnected from database");
	}

	async transaction<T>(
		callback: () => Promise<T>,
	): Promise<[T, undefined] | [undefined, Error]> {
		this.validateConnection();
		try {
			const result = await this.connection!.tx(async (t) => {
				// Temporarily replace connection with transaction context
				const originalConnection = this.connection;
				this.connection = t as any;
				try {
					const result = await callback();
					this.connection = originalConnection;
					return result;
				} catch (error) {
					this.connection = originalConnection;
					throw error;
				}
			});
			return [result, undefined];
		} catch (error) {
			return [undefined, error as Error];
		}
	}

	private validateConnection() {
		if (!this.connection) {
			throw new Error(
				"[pg-promise-adapter]: database connection not established",
			);
		}
	}
}
