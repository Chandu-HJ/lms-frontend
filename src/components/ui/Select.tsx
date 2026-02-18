import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
}

export const Select = ({ label, id, options, ...props }: SelectProps) => {
  const resolvedId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="form-field">
      <label htmlFor={resolvedId}>{label}</label>
      <select id={resolvedId} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
