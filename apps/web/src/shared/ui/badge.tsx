import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/core/lib/cn";

const badgeVariants = cva(
	"inline-flex items-center rounded-full px-2.5 py-1 font-semibold text-xs",
	{
		variants: {
			variant: {
				default: "bg-[#edf2ff] text-[#2b4ccc]",
				success: "bg-[#e0f8ec] text-[#0d7a4f]",
				warning: "bg-[#fff5e0] text-[#a16207]",
				destructive: "bg-[#ffe5e5] text-[#c53030]",
				outline: "border border-[#d4def8] bg-white text-[#30416f]",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<span className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}
