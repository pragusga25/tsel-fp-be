import { Output, array, minLength, object, string } from 'valibot';
import { PrincipalTypeSchema } from '../aws-identity/validations';

export const DeleteUsersSchema = object({
  ids: array(
    string('Id must be a string', [minLength(1)]),
    'The input must be an array of ids.',
    [minLength(1, 'Please input at least one id.')]
  ),
});

export const UpdateUserPasswordSchema = object({
  // userId: string('User id must be a string', [minLength(1)]),
  oldPassword: string('Password must be a string', [minLength(1)]),
  newPassword: string('New password must be a string', [minLength(8)]),
});

export type DeleteUsersData = Output<typeof DeleteUsersSchema>;
export type UpdateUserPasswordData = Output<typeof UpdateUserPasswordSchema> & {
  userId: string;
};

export const UpdateUserPrincipalSchema = object({
  principalId: string('Principal id must be a string', [
    minLength(1, 'Please enter the principal id.'),
  ]),
  principalType: PrincipalTypeSchema,
  userId: string('User id must be a string', [
    minLength(1, 'Please enter the user id.'),
  ]),
});

export type UpdateUserPrincipalData = Output<typeof UpdateUserPrincipalSchema>;
