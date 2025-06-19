'use client';

import { useState, useCallback } from 'react';

type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

type FieldValidation<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: FieldValidation<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      const fieldRules = validationRules[name];
      if (!fieldRules) return null;

      for (const rule of fieldRules) {
        if (!rule.validate(value)) {
          return rule.message;
        }
      }

      return null;
    },
    [validationRules]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let formIsValid = true;

    Object.keys(validationRules).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, values[fieldName]);
      
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  }, [validateField, values, validationRules]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target as HTMLInputElement;
      const fieldName = name as keyof T;
      
      // Handle different input types
      let fieldValue: any = value;
      if (type === 'checkbox') {
        fieldValue = (e.target as HTMLInputElement).checked;
      } else if (type === 'number') {
        fieldValue = value === '' ? '' : Number(value);
      }

      setValues((prev) => ({ ...prev, [fieldName]: fieldValue }));
      
      // Validate field if it's been touched
      if (touched[fieldName]) {
        const error = validateField(fieldName, fieldValue);
        setErrors((prev) => ({ ...prev, [fieldName]: error || undefined }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const fieldName = name as keyof T;
      
      // Mark field as touched
      setTouched((prev) => ({ ...prev, [fieldName]: true }));
      
      // Validate field
      const error = validateField(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: error || undefined }));
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) => async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      // Validate all fields
      const formIsValid = validateForm();
      
      // Mark all fields as touched
      const allTouched = Object.keys(validationRules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);
      
      if (formIsValid) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }
      
      setIsSubmitting(false);
    },
    [validateForm, values, validationRules]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    
    // Validate field if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error || undefined }));
    }
  }, [touched, validateField]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    validateForm,
  };
}