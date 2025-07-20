import { z } from 'zod';

import { signUpSchema } from '@/features/auth/schemas';

export type User = {
  id: string;
  username: string;
  email: string;
  created_at: string;
};

export type SignUpData = z.infer<typeof signUpSchema>;

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  base_currency: SignUpData['base_currency'];
};

export type RegisterResponse = {
  token: string;
  user: User;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};
