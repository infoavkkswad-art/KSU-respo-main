import {
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';


/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL FORM STATUS SYSTEM

   Supports:
   - idle
   - loading
   - success
   - error

   This component intentionally keeps its existing public API so existing
   forms do not need to be rewritten.
   ========================================================================== */


interface FormStatusMessageProps {
  status:
    | 'idle'
    | 'loading'
    | 'success'
    | 'error';

  successMsg?: string;
  errorMsg?: string;
  loadingMsg?: string;
}


export function FormStatusMessage({
  status,
  successMsg = 'Submitted successfully!',
  errorMsg =
    'An error occurred. Please try again.',
  loadingMsg = 'Submitting...',
}: FormStatusMessageProps) {

  /* ==========================================================================
     IDLE
     ======================================================================== */

  if (status === 'idle') {
    return null;
  }


  /* ==========================================================================
     LOADING
     ======================================================================== */

  if (status === 'loading') {
    return (
      <div
        className="
          flex
          items-start
          gap-3
          rounded-xl
          border
          border-brand-brown/10
          bg-brand-cream
          p-4
          text-sm
          font-medium
          leading-relaxed
          text-brand-brown
          shadow-soft
          animate-scale-in
        "
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2
          className="
            mt-0.5
            h-4
            w-4
            shrink-0
            animate-spin
            text-brand-green
          "
          aria-hidden="true"
        />

        <span>
          {loadingMsg}
        </span>
      </div>
    );
  }


  /* ==========================================================================
     SUCCESS
     ======================================================================== */

  if (status === 'success') {
    return (
      <div
        className="
          flex
          items-start
          gap-3
          rounded-xl
          border
          border-green-200
          bg-green-50
          p-4
          text-sm
          font-medium
          leading-relaxed
          text-green-800
          shadow-soft
          animate-scale-in
        "
        role="status"
        aria-live="polite"
      >
        <CheckCircle
          className="
            mt-0.5
            h-5
            w-5
            shrink-0
            text-green-600
          "
          aria-hidden="true"
        />

        <span>
          {successMsg}
        </span>
      </div>
    );
  }


  /* ==========================================================================
     ERROR
     ======================================================================== */

  if (status === 'error') {
    return (
      <div
        className="
          flex
          items-start
          gap-3
          rounded-xl
          border
          border-red-200
          bg-red-50
          p-4
          text-sm
          font-medium
          leading-relaxed
          text-red-800
          shadow-soft
          animate-scale-in
        "
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle
          className="
            mt-0.5
            h-5
            w-5
            shrink-0
            text-brand-red
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
