import z from 'zod';

export const LoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;

export const SignUpSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;
