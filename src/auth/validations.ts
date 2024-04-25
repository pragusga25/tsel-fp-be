import { Role } from '@prisma/client';
import {
  object,
  string,
  minLength,
  Output,
  optional,
  picklist,
  forward,
  custom,
} from 'valibot';
import {
  PrincipalIdSchema,
  PrincipalTypeSchema,
} from '../aws-identity/validations';

export const LoginSchema = object({
  username: string([minLength(1, 'Please enter your username.')]),
  password: string([minLength(1, 'Please enter your password.')]),
});

export const RegisterSchema = object(
  {
    username: string('Username must be a string.', [
      minLength(2, 'Username must be at least 2 characters long.'),
    ]),
    password: string('Password must be a string.', [
      minLength(8, 'Password must be at least 8 characters long.'),
    ]),
    name: string('Name must be a string.', [
      minLength(2, 'Name must be at least 2 characters long.'),
    ]),
    role: optional(
      picklist(Object.values(Role), 'Role must be either USER or ADMIN.'),
      Role.ADMIN
    ),
    principalId: optional(PrincipalIdSchema),
    principalType: optional(PrincipalTypeSchema),
  },
  [
    forward(
      custom(
        ({ role, principalId }) =>
          role === Role.ADMIN || (role === Role.USER && !!principalId),
        'PrincipalId is required for user role'
      ),
      ['principalId']
    ),
    forward(
      custom(
        ({ role, principalType }) =>
          role === Role.ADMIN || (role === Role.USER && !!principalType),
        'PrincipalType is required for user role'
      ),
      ['principalType']
    ),
  ]
);

export type LoginData = Output<typeof LoginSchema>;
export type RegisterData = Output<typeof RegisterSchema>;
