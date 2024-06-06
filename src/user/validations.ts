import {
  Output,
  array,
  email,
  minLength,
  object,
  optional,
  string,
  uuid,
} from 'valibot';
import { PrincipalTypeSchema } from '../aws-identity/validations';

export const DeleteAccountsSchema = object({
  ids: array(
    string('Id must be a string', [minLength(1)]),
    'The input must be an array of ids.',
    [minLength(1, 'Please input at least one id.')]
  ),
});

export const UpdateAccountPasswordSchema = object({
  // userId: string('User id must be a string', [minLength(1)]),
  oldPassword: string('Password must be a string', [minLength(1)]),
  newPassword: string('New password must be a string', [minLength(8)]),
});

export const ResetAccountUserPasswordSchema = object({
  userId: string('User id must be a string', [minLength(1)]),
});

export const PrincipalAwsAccountUser = object({
  principalId: string('Principal id must be a string', [
    uuid('Please enter a valid principal id.'),
  ]),
  principalType: PrincipalTypeSchema,
  awsAccountId: string('AWS account id must be a string', [
    minLength(1, 'Please enter the AWS account id.'),
  ]),
});

export const CreateAccountUserSchema = object({
  username: string('Username must be a string', [
    minLength(1, 'Please enter the username.'),
  ]),
  password: string('Password must be a string', [
    minLength(1, 'Please enter the password.'),
  ]),
  name: string('Name must be a string', [
    minLength(1, 'Please enter the name.'),
  ]),
  principalUserId: string('Principal user id must be a string', [
    uuid('Please enter a valid principal user id.'),
  ]),
  email: string('Email must be a string', [
    email('Please enter a valid email address.'),
  ]),
});

export const CreateAccountAdminSchema = object({
  username: string('Username must be a string', [
    minLength(1, 'Please enter the username.'),
  ]),
  password: string('Password must be a string', [
    minLength(1, 'Please enter the password.'),
  ]),
  name: string('Name must be a string', [
    minLength(1, 'Please enter the name.'),
  ]),
  email: string('Email must be a string', [
    email('Please enter a valid email address.'),
  ]),
});

const PrincipalUserIdsSchema = array(
  string('Principal user id must be a string', [
    uuid('Please enter a valid principal user id.'),
  ]),
  'The input must be an array of principal user ids.',
  [minLength(1, 'Please input at least one principal user id.')]
);
export const CreateAccountAdminBulkSchema = object({
  principalUserIds: PrincipalUserIdsSchema,
});

export const CreateApproversSchema = object({
  principalUserIds: PrincipalUserIdsSchema,
});

export const DeleteApproverSchema = object({
  userId: string('User id must be a string', [minLength(5)]),
});

export const UpdateAccountUserSchema = object({
  name: optional(
    string('Name must be a string', [minLength(1, 'Please enter the name.')])
  ),
  username: optional(
    string('Username must be a string', [
      minLength(1, 'Please enter the username.'),
    ])
  ),
  principalUserId: optional(
    string('Principal user id must be a string', [
      uuid('Please enter a valid principal user id.'),
    ])
  ),
  id: string('Id must be a string', [minLength(1, 'Please enter the id.')]),
});

export type DeleteApproverData = Output<typeof DeleteApproverSchema>;
export type CreateAccountAdminBulkData = Output<
  typeof CreateAccountAdminBulkSchema
>;
export type CreateApproversData = Output<typeof CreateApproversSchema>;
export type CreateAccountUserData = Output<typeof CreateAccountUserSchema>;
export type CreateAccountAdminData = Output<typeof CreateAccountAdminSchema>;
export type UpdateAccountUserData = Output<typeof UpdateAccountUserSchema>;
export type DeleteAccountsData = Output<typeof DeleteAccountsSchema>;
export type UpdateAccountPasswordData = Output<
  typeof UpdateAccountPasswordSchema
> & {
  userId: string;
};
export type ResetAccountUserPasswordData = Output<
  typeof ResetAccountUserPasswordSchema
>;
