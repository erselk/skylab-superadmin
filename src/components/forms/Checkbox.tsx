'use client';

import { useFormContext } from 'react-hook-form';

interface CheckboxProps {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
}

export function Checkbox({ name, label, required, hint }: CheckboxProps) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register(name)}
          className="w-4 h-4 text-dark border-dark-200 rounded focus:ring-brand"
        />
        <span className="text-sm font-medium text-dark">
          {label} {required && <span className="text-dark">*</span>}
        </span>
      </label>
      {hint && (
        <p className="text-xs text-dark opacity-70 mt-1 ml-6">{hint}</p>
      )}
      {errors[name] && (
        <p className="mt-1 text-sm text-dark">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}

