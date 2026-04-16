'use server';

import { auth } from '@/lib/auth';
import { LoginSchemaType, SignUpSchemaType } from '@/types/authSchema';

export const loginUser = async (
  email: LoginSchemaType['email'],
  password: LoginSchemaType['password'],
) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return { success: true, message: 'Login successful' };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Login failed' };
  }
};

export const signUpUser = async (
  name: SignUpSchemaType['name'],
  email: SignUpSchemaType['email'],
  password: SignUpSchemaType['password'],
) => {
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    return { success: true, message: 'Please verify your email to continue' };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Sign up failed' };
  }
};
