import type { InputHTMLAttributes, LabelHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
};

export function Input({
  label,
  error,
  labelProps = {},
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <label className="grid gap-2 text-sm text-d-text" {...labelProps}>
      {label ? (
        <span className="font-mono text-[11px] uppercase tracking-[1.6px] text-d-muted">
          {label}
        </span>
      ) : null}
      <input
        id={inputId}
        className={`min-h-11 w-full rounded-xl border border-d-border bg-d-surface2 px-3.5 py-2.5 text-sm text-d-text placeholder-d-muted/80 transition focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20 ${className}`.trim()}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error ? (
        <span id={`${inputId}-error`} className="text-sm leading-5 text-red" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
