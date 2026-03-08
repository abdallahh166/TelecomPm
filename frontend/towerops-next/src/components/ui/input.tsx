import { forwardRef, InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = '', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      {...props}
      className={`w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 ${className}`.trim()}
    />
  );
});
