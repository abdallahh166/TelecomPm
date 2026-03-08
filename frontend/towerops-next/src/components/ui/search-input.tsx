import { InputHTMLAttributes } from 'react';
import { Input } from './input';

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} placeholder={props.placeholder ?? 'Search...'} />;
}
