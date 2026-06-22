import type * as React from "react";

import { cn } from "#/utils/tailwind";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"base-1 h-9 w-full min-w-0 rounded-md border border-ring-inner bg-background-base px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-tone-luminosity-500 selection:text-tone-foreground-contrast file:inline-flex file:h-7 file:border-0 file:bg-background-base file:text-sm file:font-medium file:text-foreground placeholder:text-foreground-min disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"focus-visible:border-ring-inner focus-visible:ring-[3px] focus-visible:ring-ring-outer",

				"aria-invalid:tone aria-invalid:palette-danger aria-invalid:border-tone-contrast-500 aria-invalid:ring-tone-contrast-200",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
