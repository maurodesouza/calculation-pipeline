import { useSelector } from "@tanstack/react-store";
import { Field } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { actions } from "#/lib/command";
import { usePipelineContext } from "../../../store";

export function PayloadInput() {
	const { store } = usePipelineContext();
	const payload = useSelector(store, (state) => state.run.payload);
	const instanceId = useSelector(store, (state) => state.instanceId);

	const handleChange = (value: number) => {
		actions.pipelines.run.update.payload({ payload: value }, { instanceId });
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
