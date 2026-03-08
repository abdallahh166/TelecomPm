import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

const variantClass: Record<Variant, string> = {
  primary: 'bg-brand-blue text-slate-950',
  secondary: 'bg-slate-800 text-slate-100',
  danger: 'bg-brand-red text-white',
};

export function ActionButton({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${variantClass[variant]} ${className}`}
    />
  );
}
