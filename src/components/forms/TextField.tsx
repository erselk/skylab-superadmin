'use client';

import { useFormContext } from 'react-hook-form';

interface TextFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

export function TextField({ name, label, type = 'text', placeholder, required }: TextFieldProps) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <label className="block text-sm font-medium text-black mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-black placeholder:opacity-70"
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}





