import {
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

import {
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';


/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL FORM SYSTEM

   Responsibilities:
   - Consistent field rendering
   - Validation state
   - Submission state
   - Accessible feedback
   - Reusable submit controls

   Visual authority:
   - index.css
   - .input-field
   - .label-field
   - .form-error
   - .form-success
   - .btn-primary
   - .btn-secondary
   - Central brand tokens

   This file does NOT define its own global visual language.
   ========================================================================== */


/* ==========================================================================
   FORM STATUS
   ========================================================================== */

export type FormStatus =
  | 'idle'
  | 'submitting'
  | 'success'
  | 'error';


/* ==========================================================================
   FORM FIELD
   ========================================================================== */

export interface FormFieldProps {
  label: string;
  name: string;
  type?:
    | 'text'
    | 'email'
    | 'tel'
    | 'textarea'
    | 'select'
    | 'number';
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
  required = false,
  placeholder,
  options,
  rows = 4,
  autoComplete,
}: FormFieldProps) {

  const inputId = name;
  const errorId = `${name}-error`;

  const baseClass = `
    input-field
    ${error ? 'border-brand-red ring-1 ring-brand-red/30' : ''}
  `;


  return (
    <div className="min-w-0">

      {/* ====================================================================
          LABEL
          ================================================================= */}

      <label
        htmlFor={inputId}
        className="label-field"
      >
        {label}

        {required && (
          <>
            <span
              className="
                ml-1
                text-brand-red
              "
              aria-hidden="true"
            >
              *
            </span>

            <span className="sr-only">
              required
            </span>
          </>
        )}
      </label>


      {/* ====================================================================
          TEXTAREA
          ================================================================= */}

      {type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          required={required}
          rows={rows}
          autoComplete={autoComplete}
          className={`
            ${baseClass}
            min-h-[120px]
            resize-y
          `}
          aria-invalid={
            error ? 'true' : 'false'
          }
          aria-describedby={
            error
              ? errorId
              : undefined
          }
        />
      ) : type === 'select' ? (

        /* ================================================================
           SELECT
           ================================================================ */

        <div className="relative">

          <select
            id={inputId}
            name={name}
            value={value}
            onChange={(event) =>
              onChange(event.target.value)
            }
            required={required}
            className={`
              ${baseClass}
              cursor-pointer
              appearance-none
              pr-10
            `}
            aria-invalid={
              error ? 'true' : 'false'
            }
            aria-describedby={
              error
                ? errorId
                : undefined
            }
          >
            <option value="">
              Select...
            </option>

            {options?.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ),
            )}
          </select>


          {/* ================================================================
              SELECT INDICATOR
              ============================================================= */}

          <span
            className="
              pointer-events-none
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-xs
              text-brand-brown/45
            "
            aria-hidden="true"
          >
            ▼
          </span>

        </div>

      ) : (

        /* ================================================================
           STANDARD INPUT
           ================================================================ */

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          inputMode={
            type === 'number'
              ? 'numeric'
              : type === 'tel'
                ? 'tel'
                : undefined
          }
          className={baseClass}
          aria-invalid={
            error ? 'true' : 'false'
          }
          aria-describedby={
            error
              ? errorId
              : undefined
          }
        />
      )}


      {/* ====================================================================
          VALIDATION MESSAGE
          ================================================================= */}

      {error && (
        <p
          id={errorId}
          className="form-error flex items-start gap-1.5"
          role="alert"
        >
          <AlertCircle
            className="
              mt-0.5
              h-3.5
              w-3.5
              shrink-0
            "
            aria-hidden="true"
          />

          <span>
            {error}
          </span>
        </p>
      )}

    </div>
  );
}


/* ==========================================================================
   FORM STATE
   ========================================================================== */

export function useFormState<
  T extends {
    [K in keyof T]: string;
  },
>(initial: T) {

  const [values, setValues] =
    useState<T>(initial);

  const [errors, setErrors] =
    useState<
      Partial<Record<keyof T, string>>
    >({});

  const [status, setStatus] =
    useState<FormStatus>('idle');


  /* ------------------------------------------------------------------------
     SET VALUE
     ------------------------------------------------------------------------ */

  const setValue = (
    name: keyof T,
    value: string,
  ) => {

    setValues(
      (previous) =>
        ({
          ...previous,
          [name]: value,
        }) as T,
    );


    setErrors(
      (previous) => ({
        ...previous,
        [name]: undefined,
      }),
    );


    if (status === 'error') {
      setStatus('idle');
    }
  };


  /* ------------------------------------------------------------------------
     VALIDATE
     ------------------------------------------------------------------------ */

  const validate = (
    rules: Partial<
      Record<
        keyof T,
        (
          value: string,
        ) =>
          | string
          | undefined
      >
    >,
  ): boolean => {

    const newErrors: Partial<
      Record<keyof T, string>
    > = {};


    for (const key in rules) {

      const rule = rules[key];

      if (!rule) {
        continue;
      }


      const error = rule(
        values[key],
      );


      if (error) {
        newErrors[key] = error;
      }
    }


    setErrors(newErrors);


    return (
      Object.keys(newErrors).length === 0
    );
  };


  /* ------------------------------------------------------------------------
     RESET
     ------------------------------------------------------------------------ */

  const reset = () => {
    setValues(initial);
    setErrors({});
    setStatus('idle');
  };


  return {
    values,
    errors,
    status,
    setValue,
    validate,
    setStatus,
    reset,
  };
}


/* ==========================================================================
   FORM STATUS MESSAGE
   ========================================================================== */

export interface FormStatusMessageProps {
  status: FormStatus;
  successMsg?: string;
  errorMsg?: string;
}


export function FormStatusMessage({
  status,
  successMsg = 'Submitted successfully!',
  errorMsg =
    'Something went wrong. Please try again or contact us directly.',
}: FormStatusMessageProps) {

  /* ------------------------------------------------------------------------
     SUCCESS
     ------------------------------------------------------------------------ */

  if (status === 'success') {
    return (
      <div
        className="
          form-success
          flex
          items-start
          gap-2.5
          animate-scale-in
        "
        role="status"
      >

        <CheckCircle
          className="
            mt-0.5
            h-5
            w-5
            shrink-0
          "
          aria-hidden="true"
        />

        <span>
          {successMsg}
        </span>

      </div>
    );
  }


  /* ------------------------------------------------------------------------
     ERROR
     ------------------------------------------------------------------------ */

  if (status === 'error') {
    return (
      <div
        className="
          flex
          items-start
          gap-2.5
          rounded-xl
          border
          border-brand-red/20
          bg-brand-red/5
          p-3
          text-sm
          leading-relaxed
          text-brand-red
          animate-scale-in
        "
        role="alert"
      >

        <AlertCircle
          className="
            mt-0.5
            h-5
            w-5
            shrink-0
          "
          aria-hidden="true"
        />

        <span>
          {errorMsg}
        </span>

      </div>
    );
  }


  return null;
}


/* ==========================================================================
   SUBMIT BUTTON
   ========================================================================== */

export function SubmitButton({
  status,
  label,
  className = 'btn-primary',
}: {
  status: FormStatus;
  label: string;
  className?: string;
}) {

  const isSubmitting =
    status === 'submitting';

  const isSuccess =
    status === 'success';


  return (
    <button
      type="submit"
      disabled={
        isSubmitting ||
        isSuccess
      }
      aria-busy={isSubmitting}
      className={`
        ${className}
        w-full
        min-h-[46px]
        sm:w-auto
        ${
          isSuccess
            ? 'btn-secondary'
            : ''
        }
      `}
    >

      {isSubmitting ? (
        <>
          <Loader2
            className="
              h-4
              w-4
              animate-spin
            "
            aria-hidden="true"
          />

          <span>
            Submitting...
          </span>
        </>
      ) : isSuccess ? (
        <>
          <CheckCircle
            className="h-4 w-4"
            aria-hidden="true"
          />

          <span>
            Submitted
          </span>
        </>
      ) : (
        label
      )}

    </button>
  );
}


/* ==========================================================================
   FORM CONTAINER
   ========================================================================== */

export function FormContainer({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        space-y-4
        sm:space-y-5
      "
    >
      {children}
    </div>
  );
}


/* ==========================================================================
   SIMULATED SUBMIT
   ========================================================================== */

export async function simulateSubmit(
  _data: unknown,
  delay = 1200,
): Promise<void> {
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, delay);
  });
}


/* ==========================================================================
   VALIDATION HELPERS
   ========================================================================== */

export const validators = {

  required:
    (
      message =
        'This field is required',
    ) =>
    (value: string) =>
      value.trim()
        ? undefined
        : message,


  email:
    (
      message =
        'Please enter a valid email',
    ) =>
    (value: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value.trim(),
      )
        ? undefined
        : message,


  phone:
    (
      message =
        'Please enter a valid phone number',
    ) =>
    (value: string) =>
      /^[+]?[0-9\s-]{10,15}$/.test(
        value.trim(),
      )
        ? undefined
        : message,


  pincode:
    (
      message =
        'Please enter a valid 6-digit PIN code',
    ) =>
    (value: string) =>
      /^\d{6}$/.test(
        value.trim(),
      )
        ? undefined
        : message,
};


/* ==========================================================================
   SUBMIT HANDLER
   ========================================================================== */

export function handleFormSubmit(
  event: FormEvent,
  isValid: boolean,
  onSubmit: () => Promise<void>,
) {
  event.preventDefault();

  if (!isValid) {
    return;
  }

  void onSubmit();
}
