import { twx } from "#/utils/tailwind";
import { ClearButton } from "./clear-button";
import { FinalizeButton } from "./finalize-button";
import { PlayButton } from "./play-button";
import { ToggleButton } from "./toggle-button";

const Container = twx.div`p-xs border border-ring-inner rounded-md flex flex-col gap-xs`;

export const Controls = {
	Container,
	Play: PlayButton,
	Toggle: ToggleButton,
	Finalize: FinalizeButton,
	Clear: ClearButton,
};
