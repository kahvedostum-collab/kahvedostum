import { z } from 'zod';

/**
 * Validation schemas for form inputs
 * Using Zod for runtime type checking and validation
 */

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gereklidir')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: z
    .string()
    .min(1, 'Şifre gereklidir')
    .min(8, 'Şifre en az 8 karakter olmalıdır'),
});

// Signup form validation schema
export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Ad gereklidir')
      .min(2, 'Ad en az 2 karakter olmalıdır')
      .max(50, 'Ad en fazla 50 karakter olabilir'),
    lastName: z
      .string()
      .min(1, 'Soyad gereklidir')
      .min(2, 'Soyad en az 2 karakter olmalıdır')
      .max(50, 'Soyad en fazla 50 karakter olabilir'),
    email: z
      .string()
      .min(1, 'E-posta adresi gereklidir')
      .email('Geçerli bir e-posta adresi giriniz'),
    password: z
      .string()
      .min(1, 'Şifre gereklidir')
      .min(8, 'Şifre en az 8 karakter olmalıdır')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
      ),
    confirmPassword: z.string().min(1, 'Şifre tekrarı gereklidir'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

// English validation messages (for i18n support)
export const loginSchemaEN = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export const signupSchemaEN = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be at most 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be at most 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Validate data against a schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {object} data - Data to validate
 * @returns {{ success: boolean, data?: object, errors?: object }}
 */
export const validateForm = (schema, data) => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = err.message;
        }
      });
      return { success: false, errors };
    }
    throw error;
  }
};
