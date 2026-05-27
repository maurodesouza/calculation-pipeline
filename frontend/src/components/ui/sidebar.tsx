import { twx } from "#/utils/tailwind";

const Container = twx.aside`w-full max-w-72 border-r border-ring-inner`;
const Header = twx.div`p-md border-b border-ring-inner`;
const Content = twx.div`p-md`;
const Scrollable = twx.div``;
const Footer = twx.div`p-md border-t border-ring-inner`;

export const Sidebar = {
	Container,
	Header,
	Content,
	Scrollable,
	Footer,
};
