import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, id, error, className = '', ...props }: InputProps) => {
  const resolvedId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="form-field">
      <label htmlFor={resolvedId}>{label}</label>
      <input id={resolvedId} className={className} {...props} />
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
};
