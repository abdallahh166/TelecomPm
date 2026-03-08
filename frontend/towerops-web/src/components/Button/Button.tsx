import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
  }
>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue px-4 py-2.5 font-display text-sm font-bold tracking-[0.2px] text-navy shadow-[0_10px_24px_rgba(0,194,255,0.18)] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30 focus-visible:ring-offset-2 focus-visible:ring-offset-d-bg disabled:cursor-not-allowed disabled:opacity-70",
  outline:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-d-border bg-transparent px-3.5 py-2.5 font-mono text-sm text-d-text transition hover:border-blue/30 hover:bg-d-surface2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/20 focus-visible:ring-offset-2 focus-visible:ring-offset-d-bg disabled:cursor-not-allowed disabled:opacity-50",
  ghost:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-transparent px-3.5 py-2.5 text-d-text transition hover:bg-d-surface2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/20 focus-visible:ring-offset-2 focus-visible:ring-offset-d-bg disabled:cursor-not-allowed disabled:opacity-50",
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
