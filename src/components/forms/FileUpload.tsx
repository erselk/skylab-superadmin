'use client';

import { useFormContext } from 'react-hook-form';
import { useState } from 'react';

interface FileUploadProps {
  name: string;
  label: string;
  accept?: string;
  required?: boolean;
  hint?: string;
}

export function FileUpload({ name, label, accept, required, hint }: FileUploadProps) {
  const {
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();
  const [preview, setPreview] = useState<string | null>(null);
  const file = watch(name);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(name, file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setValue(name, undefined, { shouldValidate: true });
      setPreview(null);
    }
  };

  return (
    <div>
      <label className="text-dark mb-1 block text-sm font-medium">
        {label} {required && <span className="text-dark">*</span>}
      </label>
      {hint && <p className="text-dark mb-1 text-xs opacity-70">{hint}</p>}
      <input
        name={name}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="border-dark-200 bg-light text-dark focus:ring-brand w-full cursor-pointer rounded-md border px-3 py-2 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:px-3 file:py-1 file:text-sm file:font-medium focus:border-transparent focus:ring-2 focus:outline-none"
      />
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Preview" className="max-w-xs rounded-md" />
        </div>
      )}
      {errors[name] && <p className="text-dark mt-1 text-sm">{errors[name]?.message as string}</p>}
    </div>
  );
}
