'use client';

import { useFormContext, useController } from 'react-hook-form';

interface SelectProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  placeholder?: string;
}

export function Select({
  name,
  label,
  options,
  required,
  disabled,
  hint,
  placeholder = 'Seçiniz',
}: SelectProps) {
  const {
    formState: { errors },
    control,
  } = useFormContext();
  const { field } = useController({ name, control });

  return (
    <div>
      <label className="text-dark mb-1 block text-sm font-medium">
        {label} {required && <span className="text-dark">*</span>}
      </label>
      {hint && <p className="text-dark mb-1 text-xs opacity-70">{hint}</p>}
      <select
        name={name}
        value={field.value ?? ''}
        disabled={disabled}
        onChange={(e) => field.onChange(e.target.value)}
        onBlur={field.onBlur}
        className="bg-light border-dark-200 focus:ring-brand disabled:bg-light-300 text-dark w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && <p className="text-dark mt-1 text-sm">{errors[name]?.message as string}</p>}
    </div>
  );
}
