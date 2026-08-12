interface FormStatusMessageProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  successMsg?: string;
  errorMsg?: string;
  loadingMsg?: string;
}

export function FormStatusMessage({
  status,
  successMsg = 'Submitted successfully!',
  errorMsg = 'An error occurred. Please try again.',
  loadingMsg = 'Submitting...',
}: FormStatusMessageProps) {
  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <div className="p-4 rounded-xl bg-brand-cream border border-brand-brown/10 text-brand-brown text-sm font-medium flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
        <span>{loadingMsg}</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
        {successMsg}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
        {errorMsg}
      </div>
    );
  }

  return null;
}
