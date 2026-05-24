export type SQLDatabaseConnection = {
	connect(): Promise<void>;
	query<T = any>(query: string, params: any[]): Promise<[T[], undefined] | [undefined, Error]>;
	close(): Promise<void>;
	transaction<T>(callback: () => Promise<T>): Promise<[T, undefined] | [undefined, Error]>;
}
