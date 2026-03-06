import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
  }
>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue text-navy font-display font-bold px-4 py-2.5 rounded-lg hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed",
  outline:
    "border border-d-border bg-transparent text-d-text font-mono text-sm px-3 py-2 rounded-lg hover:bg-d-surface2 disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-d-text hover:bg-d-surface2 px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
