import { useState, type FormEvent, type ReactNode } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  rows?: number;
  autoComplete?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required,
  placeholder,
  options,
  rows = 4,
  autoComplete,
}: FormFieldProps) {
  const baseClass = `input-field ${error ? 'border-brand-red ring-1 ring-brand-red' : ''}`;

  return (
    <div>
      <label htmlFor={name} className="label-field">
        {label} {required && <span className="text-brand-red">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={baseClass}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={baseClass}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          <option value="">Select...</option>
          {options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={baseClass}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-brand-red flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

export function useFormState<T extends { [K in keyof T]: string }>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [status, setStatus] = useState<FormStatus>('idle');

  const setValue = (name: keyof T, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }) as T);
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (rules: Partial<Record<keyof T, (v: string) => string | undefined>>): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    for (const key in rules) {
      const rule = rules[key];
      if (rule) {
        const err = rule(values[key]);
        if (err) newErrors[key] = err;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initial);
    setErrors({});
    setStatus('idle');
  };

  return { values, errors, status, setValue, validate, setStatus, reset };
}

export interface FormStatusMessageProps {
  status: FormStatus;
  successMsg?: string;
  errorMsg?: string;
}

export function FormStatusMessage({
  status,
  successMsg = 'Submitted successfully!',
  errorMsg = 'Something went wrong. Please try again or contact us directly.',
}: FormStatusMessageProps) {
  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 text-green-700 text-sm animate-scale-in" role="status">
        <CheckCircle className="w-5 h-5 shrink-0" />
        {successMsg}
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-brand-red text-sm animate-scale-in" role="alert">
        <AlertCircle className="w-5 h-5 shrink-0" />
        {errorMsg}
      </div>
    );
  }
  return null;
}

export function SubmitButton({
  status,
  label,
  className = 'btn-primary',
}: {
  status: FormStatus;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={status === 'submitting' || status === 'success'}
      className={`${className} w-full sm:w-auto ${status === 'success' ? 'btn-secondary' : ''}`}
    >
      {status === 'submitting' ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Submitting...
        </>
      ) : status === 'success' ? (
        <>
          <CheckCircle className="w-4 h-4" />
          Submitted
        </>
      ) : (
        label
      )}
    </button>
  );
}

export function FormContainer({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

// Simulated async submit (ready to swap for real API)
export async function simulateSubmit(_data: unknown, delay = 1200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Validation helpers
export const validators = {
  required: (msg = 'This field is required') => (v: string) => (v.trim() ? undefined : msg),
  email: (msg = 'Please enter a valid email') => (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? undefined : msg,
  phone: (msg = 'Please enter a valid phone number') => (v: string) =>
    /^[+]?[\d\s-]{10,15}$/.test(v) ? undefined : msg,
  pincode: (msg = 'Please enter a valid 6-digit PIN code') => (v: string) =>
    /^\d{6}$/.test(v) ? undefined : msg,
};

export function handleFormSubmit(
  e: FormEvent,
  isValid: boolean,
  onSubmit: () => Promise<void>,
) {
  e.preventDefault();
  if (!isValid) return;
  onSubmit();
}
