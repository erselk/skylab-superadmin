'use client';

import { useFormContext } from 'react-hook-form';

interface CheckboxProps {
  name: string;
  label: string;
  required?: boolean;
}

export function Checkbox({ name, label, required }: CheckboxProps) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register(name)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </label>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}

