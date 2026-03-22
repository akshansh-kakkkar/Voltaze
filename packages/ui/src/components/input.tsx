import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@voltaze/ui/lib/utils";
import type * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<InputPrimitive
			type={type}
			data-slot="input"
			className={cn(
				"h-11 w-full min-w-0 rounded-none border-0 border-[color-mix(in_srgb,var(--outline-variant)_40%,transparent)] border-b-2 bg-transparent px-0 py-2 text-sm outline-none transition-colors file:inline-flex file:h-8 file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
