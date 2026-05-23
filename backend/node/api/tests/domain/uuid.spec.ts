import { describe, it, expect } from 'vitest';
import { UUID } from '../../src/domain/value-objects/uuid';
import { RequiredUuidError } from '../../src/domain/errors/required-uuid-error';
import { InvalidUuidError } from '../../src/domain/errors/invalid-uuid-error';

describe('UUID', () => {
	describe('create', () => {
		it('should create a valid UUID', () => {
			const uuid = UUID.create();
			expect(uuid).toBeInstanceOf(UUID);
			expect(uuid.getValue()).toBeDefined();
			expect(uuid.getValue()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
		});

		it('should create different UUIDs each time', () => {
			const uuid1 = UUID.create();
			const uuid2 = UUID.create();
			expect(uuid1.getValue()).not.toBe(uuid2.getValue());
		});
	});

	describe('restore', () => {
		it('should restore a valid UUID', () => {
			const validUuid = UUID.create().getValue();
			const [uuid, error] = UUID.restore(validUuid);

			expect(error).toBeUndefined();
			expect(uuid).toBeInstanceOf(UUID);
			expect(uuid!.getValue()).toBe(validUuid);
		});

		it('should return error when value is invalid', () => {
			{
				const [uuid, error] = UUID.restore(undefined);

				expect(uuid).toBeUndefined();
				expect(error).toBeInstanceOf(RequiredUuidError);
			}
			{
				const [uuid, error] = UUID.restore('invalid-uuid');

				expect(uuid).toBeUndefined();
				expect(error).toBeInstanceOf(InvalidUuidError);
			}
			{
				const [uuid, error] = UUID.restore('');

				expect(uuid).toBeUndefined();
				expect(error).toBeInstanceOf(RequiredUuidError);
			}
			{
				const [uuid, error] = UUID.restore('550e8400-e29b-41d4-a716');

				expect(uuid).toBeUndefined();
				expect(error).toBeInstanceOf(InvalidUuidError);
			}
		});

		it('should accept uppercase UUID', () => {
			const validUuid = UUID.create().getValue().toUpperCase();
			const [uuid, error] = UUID.restore(validUuid);

			expect(error).toBeUndefined();
			expect(uuid).toBeInstanceOf(UUID);
			expect(uuid!.getValue()).toBe(validUuid);
		});
	});
});
