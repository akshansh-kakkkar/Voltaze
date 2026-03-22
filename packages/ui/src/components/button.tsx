import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@voltaze/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
	"group/button inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-none border-0 bg-clip-padding font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"label-md bg-primary text-primary-foreground hover:opacity-[0.92] active:opacity-100",
				/* DESIGN: invert — on-surface bg, surface text */
				outline:
					"label-md bg-foreground text-background hover:opacity-90 aria-expanded:opacity-90",
				secondary:
					"label-md bg-muted text-foreground hover:bg-muted/80 aria-expanded:bg-muted",
				ghost: "label-md text-foreground hover:bg-muted aria-expanded:bg-muted",
				destructive:
					"label-md bg-destructive/15 text-destructive hover:bg-destructive/25",
				/* DESIGN: tertiary — underline 2px primary */
				link: "label-md text-foreground underline decoration-2 decoration-primary underline-offset-4 hover:text-primary",
			},
			size: {
				default:
					"min-h-10 gap-2 px-6 py-3 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
				xs: "min-h-8 gap-1 px-3 py-2 text-[0.65rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
				sm: "min-h-9 gap-1.5 px-4 py-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
				lg: "min-h-12 gap-2 px-8 py-4 has-data-[icon=inline-end]:pr-8 has-data-[icon=inline-start]:pl-8",
				icon: "size-8",
				"icon-xs": "size-6 rounded-none [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-7 rounded-none",
				"icon-lg": "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
	return (
		<ButtonPrimitive
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
