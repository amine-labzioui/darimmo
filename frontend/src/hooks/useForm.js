/**
 * Hook useForm — DarImmo
 * Gestion simple d'état de formulaire contrôlé + validation + soumission.
 */

import { useCallback, useState } from "react";

export function useForm(initialValues, validateFn) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((eventOrName, maybeValue) => {
    if (typeof eventOrName === "string") {
      const name = eventOrName;
      setValues((prev) => ({ ...prev, [name]: maybeValue }));
      return;
    }
    const { name, value, type, checked } = eventOrName.target;
    setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }, []);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(
    (onSubmit) => async (e) => {
      e?.preventDefault?.();
      if (validateFn) {
        const { isValid, errors: validationErrors } = validateFn(values);
        setErrors(validationErrors);
        if (!isValid) return;
      }
      setSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setSubmitting(false);
      }
    },
    [values, validateFn]
  );

  return { values, errors, submitting, handleChange, setFieldValue, handleSubmit, reset, setValues };
}
