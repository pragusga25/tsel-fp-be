import {
  AssignmentOperation,
  AssignmentRequestStatus,
  FreezeTimeTarget,
  PrincipalType,
  Role,
} from '@prisma/client';
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
  maxLength,
} from 'valibot';

export const PrincipalIdSchema = string('PrincipalId must be a string.', [
  regex(
    new RegExp(
      '([0-9a-f]{10}-|)[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}'
    ),
    'The principalId must be a valid UUID v4 string.'
  ),
]);

export const NoteSchema = optional(
  string('Note must be a string.', [
    minLength(1, 'Please enter a note.'),
    maxLength(32, 'Note must be less than 32 characters.'),
  ])
);

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

export const PermissionSetNameSchema = string(
  'Permission set name must be a string.',
  [minLength(1, 'Please enter the permission set name.')]
);

export const PermissionSetSchema = object({
  arn: PermissionSetArnSchema,
  name: optional(PermissionSetNameSchema),
});

export const PermissionSetsSchema = array(
  PermissionSetSchema,
  'The input must be an array.',
  [minLength(1, 'Please input at least one permission set.')]
);

export const CreateAccountAssignmentSchema = object({
  permissionSets: PermissionSetsSchema,
  principalId: PrincipalIdSchema,
  principalType: PrincipalTypeSchema,
});

export const IdentityInstanceSchema = object({
  instanceArn: InstanceArnSchema,
  identityStoreId: string([
    minLength(1, 'Please enter the identity store ID.'),
  ]),
});

export const RequestAssignmentSchema = object({
  permissionSets: PermissionSetsSchema,
  note: NoteSchema,

  operation: optional(
    picklist(
      Object.values(AssignmentOperation),
      'Operation must be either ATTACH or DETACH.'
    ),
    AssignmentOperation.ATTACH
  ),
});

const IdsSchema = array(
  string('Id must be a string', [minLength(1)]),
  'The input must be an array of ids.',
  [minLength(1, 'Please input at least one id.')]
);
export const AcceptAssignmentRequestsSchema = object({
  ids: IdsSchema,
  operation: picklist(
    Object.values(AssignmentOperation),
    'Operation must be either ATTACH or DETACH.'
  ),
});
export const RejectAssignmentRequestsSchema = object({
  ids: IdsSchema,
});

export const PullAssignmentSchema = object({
  force: optional(
    boolean('Force must be a boolean value (true or false).'),
    false
  ),
});

export const CreateFreezeTimeSchema = transform(
  object(
    {
      // creatorId: string('Creator ID must be a string.', [
      //   minLength(1, 'Please enter the creator ID.'),
      // ]),
      note: NoteSchema,
      target: picklist(Object.values(FreezeTimeTarget), 'Invalid target.'),
      permissionSets: PermissionSetsSchema,
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
            new Date(startTime).getTime() >=
            new Date(new Date().toDateString()).getTime(),
          `Start time must be greater or equal to current date (${
            new Date().toISOString().split('T')[0]
          })`
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

export const DeleteFreezeTimesSchema = object({
  ids: IdsSchema,
});

export const DeleteAssignmentRequestsSchema = object({
  ids: IdsSchema,
});

export const DeleteAccountAssignmentSchema = object({
  id: string('Id must be a string', [minLength(1, 'Please enter an id.')]),
});

export const CountAssignmentRequestsSchema = object({
  status: optional(
    picklist(
      Object.values(AssignmentRequestStatus),
      'Status must be either PENDING, ACCEPTED or REJECTED.'
    )
  ),
});

export const EditAccountAssignmentSchema = object({
  id: string('Id must be a string', [minLength(1)]),
  permissionSets: PermissionSetsSchema,
});

export const PushOneAssignmentSchema = object({
  id: string('Id must be a string', [minLength(1)]),
});

export const CreatePrincipalSchema = object({
  displayName: string('Principal must be a string', [
    minLength(1, 'Please enter a name.'),
  ]),
  type: PrincipalTypeSchema,
  username: optional(
    string('Principal must be a string', [minLength(1, 'Please enter a name.')])
  ),
  givenName: optional(
    string('Principal must be a string', [minLength(1, 'Please enter a name.')])
  ),
  familyName: optional(
    string('Principal must be a string', [minLength(1, 'Please enter a name.')])
  ),
});

export const CreateUserPrincipalSchema = object({
  displayName: string('Display name must be a string', [
    minLength(1, 'Please enter a name.'),
  ]),
  username: string('Username must be a string', [
    minLength(1, 'Please enter a name.'),
  ]),
  givenName: optional(
    string('Given name must be a string', [
      minLength(1, 'Please enter a name.'),
    ])
  ),
  familyName: optional(
    string('Family name must be a string', [
      minLength(1, 'Please enter a name.'),
    ])
  ),
});

export const CreateGroupPrincipalSchema = object({
  displayName: string('Principal must be a string', [
    minLength(1, 'Please enter a name.'),
  ]),
  description: optional(
    string('Description must be a string', [
      minLength(1, 'Please enter a name.'),
    ])
  ),
});

export const DeletePrincipalSchema = object({
  id: string('Principal must be a string', [
    minLength(1, 'Please enter a name.'),
  ]),
  type: PrincipalTypeSchema,
});

export const UpdatePrincipalSchema = object({
  id: string('Principal must be a string', [
    minLength(1, 'Please enter a name.'),
  ]),
  type: PrincipalTypeSchema,
  displayName: string('Principal must be a string', [
    minLength(1, 'Please enter a name.'),
  ]),
});

export const UpdatePrincipalGroupSchema = object({
  id: string('Id must be a string', [minLength(1, 'Please enter an id.')]),
  displayName: string('Display name must be a string', [
    minLength(1, 'Please enter a display name.'),
  ]),
  description: optional(
    string('Description must be a string', [
      minLength(1, 'Please enter a description.'),
    ])
  ),
});

export const UpdatePrincipalUserSchema = object({
  id: string('Id must be a string', [minLength(1, 'Please enter an id.')]),
  displayName: string('Display name must be a string', [
    minLength(1, 'Please enter a display name.'),
  ]),

  givenName: string('Given name must be a string', [
    minLength(1, 'Please enter a given name.'),
  ]),
  familyName: string('Family name must be a string', [
    minLength(1, 'Please enter a family name.'),
  ]),
});

export type CreateUserPrincipalData = Output<typeof CreateUserPrincipalSchema>;
export type CreateGroupPrincipalData = Output<
  typeof CreateGroupPrincipalSchema
>;

export type DeleteAccountAssignmentData = Output<
  typeof DeleteAccountAssignmentSchema
>;

export type UpdatePrincipalGroupData = Output<
  typeof UpdatePrincipalGroupSchema
>;
export type UpdatePrincipalUserData = Output<typeof UpdatePrincipalUserSchema>;
export type UpdatePrincipalData = Output<typeof UpdatePrincipalSchema>;
export type CreatePrincipalData = Output<typeof CreatePrincipalSchema>;
export type DeletePrincipalData = Output<typeof DeletePrincipalSchema>;
export type PushOneAssignmentData = Output<typeof PushOneAssignmentSchema>;
export type EditAccountAssignmentData = Output<
  typeof EditAccountAssignmentSchema
>;
export type CreateAccountAssignmentData = Output<
  typeof CreateAccountAssignmentSchema
>;
export type IdentityInstanceData = Output<typeof IdentityInstanceSchema>;
export type RequestAssignmentData = Output<typeof RequestAssignmentSchema> & {
  requesterId: string;
};
export type AcceptAssignmentRequetsData = Output<
  typeof AcceptAssignmentRequestsSchema
>;
export type RejectAssignmentRequetsData = Output<
  typeof RejectAssignmentRequestsSchema
>;
export type PullAssignmentData = Output<typeof PullAssignmentSchema>;
export type CreateFreezeTimeData = Output<typeof CreateFreezeTimeSchema> & {
  creatorId: string;
};
export type PermissionSetsData = Output<typeof PermissionSetsSchema>;
export type DeleteFreezeTimesData = Output<typeof DeleteFreezeTimesSchema>;
export type DeleteAssignmentRequestsData = Output<
  typeof DeleteAssignmentRequestsSchema
> & {
  userId: string;
  role: Role;
};

export type CountAssignmentRequestsData = Output<
  typeof CountAssignmentRequestsSchema
>;
