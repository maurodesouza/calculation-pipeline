import { useRef, useState } from "react";
import { z } from "zod";
import { Field } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { actions } from "#/lib/command";
import { fn } from "#/utils/fn";
import { usePipelineContext } from "../../store";

const nameSchema = z
	.string()
	.nonempty("Name is required")
	.max(50, "Name must be at most 50 characters");

export function NameInput() {
	const { store } = usePipelineContext();
	const state = store.state;
	const instanceId = state.instanceId;

	const [name, setName] = useState(state.name);
	const [error, setError] = useState<string | null>(null);

	const debouncedUpdateNameRef = useRef(
		fn.debounce((value: string) => {
			const result = nameSchema.safeParse(value);
			if (result.success) {
				setError(null);
				actions.pipelines.update.name(result.data, { instanceId });
			} else {
				const pretty = z.prettifyError(result.error);
				setError(pretty);
			}
		}, 300),
	);

	function onChange(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value;
		setName(value);
		debouncedUpdateNameRef.current?.(value);
	}

	return (
		<Field.Root
			data-invalid={!!error}
			orientation="horizontal"
			className="w-auto"
		>
			<Field.Label htmlFor="pipeline-name">Name</Field.Label>
			<Input
				id="pipeline-name"
				value={name}
				className="w-80 shrink-0"
				onChange={onChange}
				maxLength={50}
				aria-invalid={!!error}
			/>
			{error && <Field.Error>{error}</Field.Error>}
		</Field.Root>
	);
}
