import { Link as RouterLink } from "@tanstack/react-router";
import { Label as LabelPrimitive } from "radix-ui";
import type { JSX } from "react";
import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn, twx } from "#/utils/tailwind";

const headingVariants = tv({
	base: "font-semibold text-foreground",
	variants: {
		hierarchy: {
			h1: "text-xl",
			h2: "text-lg",
			h3: "text-md",
		},
	},
});

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
	VariantProps<typeof headingVariants> & {
		as?: Extract<keyof JSX.IntrinsicElements, "h1" | "h2" | "h3">;
	};

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
	function Heading(props, ref) {
		const { as: Element = "h1", className } = props;

		return (
			<Element
				ref={ref}
				className={headingVariants({
					hierarchy: Element,
					className,
				})}
				{...props}
			/>
		);
	},
);

const Paragraph = twx.p`text-foreground text-sm transition-all`;

const Link = twx(
	RouterLink,
)`text-tone-foreground-context text-sm hover:underline`;

const Clickable = twx.button`inline text-tone-foreground-context! text-sm hover:underline`;

const Strong = twx.strong`text-foreground text-sm font-semibold`;

const Small = twx.small`text-foreground text-xs italic`;

function Label({
	className,
	...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
	return (
		<LabelPrimitive.Root
			data-slot="label"
			className={cn(
				"base-1 flex items-center gap-2 text-sm leading-none font-medium select-none text-foreground group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

const Highlight = twx.span`text-tone-foreground-context text-sm`;

const ErrorText = twx(Highlight)`tone palette-danger text-xs`;

export const Text = {
	Heading,
	Paragraph,

	Link,
	Small,
	Label,
	Error: ErrorText,
	Strong,
	Highlight,

	Clickable,
};
