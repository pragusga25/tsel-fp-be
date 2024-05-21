import {
  Output,
  array,
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
  principalAwsAccountUsers: array(PrincipalAwsAccountUser, [
    minLength(1, 'Please enter at least one AWS account.'),
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
  principalAwsAccountUserIdsToBeDeleted: optional(
    array(
      string('Principal AWS Account User Id must be a string', [
        minLength(1, 'Please enter the Principal AWS Account User Id.'),
      ]),
      'The input must be an array of Principal AWS Account User Ids.'
    )
  ),
  principalAwsAccountsToBeAdded: optional(
    array(PrincipalAwsAccountUser, [
      minLength(1, 'Please enter at least one AWS account.'),
    ])
  ),
  id: string('Id must be a string', [minLength(1, 'Please enter the id.')]),
});

export type CreateAccountUserData = Output<typeof CreateAccountUserSchema>;
export type CreateAccountAdminData = Output<typeof CreateAccountAdminSchema>;
export type UpdateAccountUserData = Output<typeof UpdateAccountUserSchema>;
export type DeleteAccountsData = Output<typeof DeleteAccountsSchema>;
export type UpdateAccountPasswordData = Output<
  typeof UpdateAccountPasswordSchema
> & {
  userId: string;
};
