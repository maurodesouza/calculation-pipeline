import { twx } from "#/utils/tailwind";
import { NameInput } from "./name-input";
import { SaveButton } from "./save-button";

const Container = twx.header`base-1 p-md w-full flex justify-between border-b border-ring-inner bg-background-base`;

export const Header = {
	Container,
	NameInput,
	SaveButton,
};
