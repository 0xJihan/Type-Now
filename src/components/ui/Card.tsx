import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          "rounded-xl border border-border bg-surface p-4 shadow-2xs",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
