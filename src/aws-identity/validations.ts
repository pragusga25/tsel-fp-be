import { AssignmentOperation, PrincipalType } from '@prisma/client';
import {
  object,
  string,
  minLength,
  picklist,
  Output,
  array,
  optional,
  regex,
  boolean,
  forward,
  custom,
  transform,
} from 'valibot';

export const PrincipalIdSchema = string('PrincipalId must be a string.', [
  regex(
    new RegExp(
      '([0-9a-f]{10}-|)[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}'
    ),
    'The principalId must be a valid UUID v4 string.'
  ),
]);

export const PrincipalTypeSchema = picklist(
  Object.values(PrincipalType),
  'PrincipalType must be either USER or GROUP.'
);

export const InstanceArnSchema = string('Instance ARN must be a string.', [
  minLength(1, 'Please enter the instance ARN.'),
]);

export const PermissionSetArnSchema = string(
  'Permission set ARN must be a string.',
  [minLength(1, 'Please enter the permission set ARN.')]
);

export const AccountAssignmentSchema = object({
  instanceArn: InstanceArnSchema,
  permissionSetArn: PermissionSetArnSchema,
  principalId: PrincipalIdSchema,
  principalType: PrincipalTypeSchema,
});

export const IdentityInstanceSchema = object({
  instanceArn: InstanceArnSchema,
  identityStoreId: string([
    minLength(1, 'Please enter the identity store ID.'),
  ]),
});

export const RequestAssignmentSchema = transform(
  object(
    {
      permissionSetArns: array(
        PermissionSetArnSchema,
        'The input must be an array of permission set ARNs.',
        [minLength(1, 'Please select at least one permission set.')]
      ),
      note: optional(
        string('Note must be a string.', [minLength(1, 'Please enter a note.')])
      ),
      startTime: string(
        'Please enter a valid start time in the format yyyy-mm-dd.',
        [
          regex(
            /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
            'Please enter a valid start time in the format yyyy-mm-dd.'
          ),
        ]
      ),
      endTime: string(
        'Please enter a valid end time in the format yyyy-mm-dd.',
        [
          regex(
            /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
            'Please enter a valid end time in the format yyyy-mm-dd.'
          ),
        ]
      ),
      operation: optional(
        picklist(
          Object.values(AssignmentOperation),
          'Operation must be either ATTACH or DETACH.'
        ),
        AssignmentOperation.ATTACH
      ),
    },
    [
      forward(
        custom(
          ({ startTime, endTime }) =>
            new Date(startTime).getTime() < new Date(endTime).getTime(),
          'End time must be greater than start time'
        ),
        ['endTime']
      ),
      forward(
        custom(
          ({ startTime }) =>
            new Date(startTime).getTime() >= new Date().getTime(),
          `Start time must be greater or equal to current date
          (${new Date().toISOString().split('T')[0]})`
        ),
        ['startTime']
      ),
    ]
  ),
  ({ startTime, endTime, ...input }) => ({
    ...input,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
  })
);

const IdsSchema = array(
  string('Id must be a string', [minLength(1)]),
  'The input must be an array of ids.',
  [minLength(1, 'Please input at least one id.')]
);
export const AcceptAssignmentSchema = object({
  ids: IdsSchema,
});

export const SynchronizeAssignmentSchema = object({
  force: optional(
    boolean('Force must be a boolean value (true or false).'),
    false
  ),
});

export type AccountAssignmentData = Output<typeof AccountAssignmentSchema>;
export type IdentityInstanceData = Output<typeof IdentityInstanceSchema>;
export type RequestAssignmentData = Output<typeof RequestAssignmentSchema>;
export type AcceptAssignmentData = Output<typeof AcceptAssignmentSchema>;
export type SynchronizeAssignmentData = Output<
  typeof SynchronizeAssignmentSchema
>;
