import { v4 as uuid } from "uuid";

function generateId(size = 5): string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < size; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

export const random = {
	uuid,
	id: generateId,
};
