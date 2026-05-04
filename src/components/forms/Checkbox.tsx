'use client';

import { useFormContext } from 'react-hook-form';

interface CheckboxProps {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
}

export function Checkbox({ name, label, required, hint }: CheckboxProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          {...register(name)}
          className="text-dark border-dark-200 focus:ring-brand h-4 w-4 rounded"
        />
        <span className="text-dark text-sm font-medium">
          {label} {required && <span className="text-dark">*</span>}
        </span>
      </label>
      {hint && <p className="text-dark mt-1 ml-6 text-xs opacity-70">{hint}</p>}
      {errors[name] && <p className="text-dark mt-1 text-sm">{errors[name]?.message as string}</p>}
    </div>
  );
}
