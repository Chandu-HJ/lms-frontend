import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({ variant = 'primary', className = '', ...props }: ButtonProps) => {
  return <button className={`btn btn-${variant} ${className}`.trim()} {...props} />;
};
