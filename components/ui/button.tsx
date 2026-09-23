import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClass: Record<ButtonVariant, string> = {
  primary: "ds-button",
  secondary: "ds-button ds-button-secondary",
  ghost: "ds-button ds-button-ghost",
  danger: "ds-button ds-button-danger",
};

export function buttonClassName(variant: ButtonVariant = "primary", className?: string) {
  return cn(variantClass[variant], className);
}

type Props = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  href?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, variant = "primary", className, href, type = "submit", title, ...rest }: Props) {
  const classes = buttonClassName(variant, className);
  if (href) {
    return (
      <Link href={href} className={classes} title={title}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} title={title} {...rest}>
      {children}
    </button>
  );
}
