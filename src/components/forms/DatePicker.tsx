'use client';

import { useFormContext } from 'react-hook-form';

interface DatePickerProps {
  name: string;
  label: string;
  required?: boolean;
}

export function DatePicker({ name, label, required }: DatePickerProps) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...register(name)}
        type="datetime-local"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}

