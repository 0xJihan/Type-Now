import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none cursor-pointer rounded-lg";

    const variants = {
      primary:
        "bg-accent text-accent-foreground hover:bg-accent-hover active:scale-98 shadow-2xs font-semibold",
      secondary:
        "bg-surface-secondary text-text-primary hover:bg-surface-tertiary active:scale-98 border border-border",
      outline:
        "border border-border bg-transparent text-text-primary hover:bg-surface-secondary active:scale-98",
      ghost:
        "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary active:scale-98",
      danger:
        "bg-error text-white hover:opacity-90 active:scale-98 shadow-2xs font-semibold",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
