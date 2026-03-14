import { useCallback, useState } from 'react';

interface UseFormSubmissionOptions {
  defaultSubmitErrorMessage?: string;
}

interface RunSubmissionOptions {
  submitErrorMessage?: string;
}

export function useFormSubmission(options: UseFormSubmissionOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultSubmitErrorMessage = options.defaultSubmitErrorMessage || '';

  const clearErrors = useCallback(() => {
    setFieldError(null);
    setSubmitError(null);
  }, []);

  const resetSubmissionState = useCallback(() => {
    setIsSubmitting(false);
    setFieldError(null);
    setSubmitError(null);
  }, []);

  const runSubmission = useCallback(
    async (submitTask: () => Promise<boolean>, runOptions: RunSubmissionOptions = {}) => {
      if (isSubmitting) return false;

      setIsSubmitting(true);
      try {
        const sent = await submitTask();
        if (!sent) {
          const message = runOptions.submitErrorMessage ?? defaultSubmitErrorMessage;
          if (message) {
            setSubmitError(message);
          }
        }
        return sent;
      } finally {
        setIsSubmitting(false);
      }
    },
    [defaultSubmitErrorMessage, isSubmitting],
  );

  return {
    isSubmitting,
    fieldError,
    submitError,
    setFieldError,
    setSubmitError,
    clearErrors,
    resetSubmissionState,
    runSubmission,
  };
}

