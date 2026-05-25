type Result<D = any> = {
	status: number;
	data?: D;
};

export type Callback<R, T = any, P = any, Q = any> = (
	body: T,
	params: P,
	queryParams: Q,
) => Promise<[Result<R>, undefined] | [undefined, Error]>;
export type Method = "get" | "post" | "put" | "delete";

export type HTTPServer = {
	route<R = any, T = any, P = any, Q = any>(
		method: Method,
		url: string,
		callback: Callback<R, T, P, Q>,
	): void;
	listen(port: number): void;
};
