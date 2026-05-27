import { twx } from "#/utils/tailwind";
import { GoToListButton } from "./go-to-list-button";
import { NameInput } from "./name-input";
import { SaveButton } from "./save-button";

const Container = twx.header`base-1 p-md w-full flex justify-between border-b border-ring-inner bg-background-base`;
const Wrapper = twx.div`flex gap-md`;

export const Header = {
	Container,
	Wrapper,
	Controls: {
		NameInput,
		SaveButton,
		GoToListButton,
	},
};
