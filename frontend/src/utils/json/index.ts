const safeParser = <T>(value: string, returnValue: T | null = null): T => {
	try {
		return JSON.parse(value) as T;
	} catch {
		return returnValue ?? (null as T);
	}
};

export const json = {
	safeParser,
};
