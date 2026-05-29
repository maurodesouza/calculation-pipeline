import { useSelector } from "@tanstack/react-store";
import { Field } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { usePipelineContext } from "../../../store";

export function PayloadInput() {
	const { store } = usePipelineContext();
	const payload = useSelector(store, (state) => state.run.payload);

	const handleChange = (value: number) => {
		store.setState((prev) => ({
			...prev,
			run: { ...prev.run, payload: value },
		}));
	};

	return (
		<Field.Root>
			<Field.Label htmlFor="payload-input">Payload:</Field.Label>
			<Input
				id="payload-input"
				type="number"
				value={payload}
				onChange={(e) => handleChange(Number(e.target.value))}
				className="w-32"
			/>
		</Field.Root>
	);
}
