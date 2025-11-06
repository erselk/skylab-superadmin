'use client';

import { useFormContext, useController } from 'react-hook-form';

interface ToggleProps {
  name: string;
  label: string;
  hint?: string;
}

export function Toggle({ name, label, hint }: ToggleProps) {
  const { control, formState: { errors } } = useFormContext();
  const { field } = useController({
    name,
    control,
  });
  const value = field.value ?? false;

  return (
    <div>
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => {
              field.onChange(e.target.checked);
            }}
            onBlur={field.onBlur}
            ref={field.ref}
            className="sr-only peer"
          />
          <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lacivert relative transition-colors duration-300 ease-in-out ${value ? 'bg-yesil' : 'bg-pembe'}`}>
            <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 shadow-sm transition-transform duration-300 ease-in-out ${value ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </div>
        </div>
        <span className="text-sm font-medium text-pembe">
          {label}
        </span>
        {hint && (
          <p className="text-xs text-pembe opacity-70">{hint}</p>
        )}
      </label>
      {errors[name] && (
        <p className="mt-1 text-sm text-pembe">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}

