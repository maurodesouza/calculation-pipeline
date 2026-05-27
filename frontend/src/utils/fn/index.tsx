function debounce<T extends (...args: any[]) => void>(
	fn: T,
	wait = 300,
	time?: ReturnType<typeof setTimeout>,
) {
	return (...args: Parameters<T>) => {
		clearTimeout(time);
		time = setTimeout(() => fn(...args), wait);
	};
}

export const fn = {
	debounce,
};
