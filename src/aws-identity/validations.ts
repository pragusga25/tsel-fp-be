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
  number,
  minValue,
  maxValue,
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

export const PermissionSetArnsRequiredSchema = array(
  PermissionSetArnSchema,
  'The input must be an array of permission sets.',
  [minLength(1, 'Please input at least one permission set.')]
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

export const AwsAccountIdSchema = string('AWS account ID must be a string.', [
  minLength(1, 'Please enter the AWS account ID.'),
]);

export const CreateAccountAssignmentSchema = object({
  permissionSetArns: PermissionSetArnsRequiredSchema,
  principalId: PrincipalIdSchema,
  principalType: PrincipalTypeSchema,
  awsAccountId: AwsAccountIdSchema,
});

export const IdentityInstanceSchema = object({
  instanceArn: InstanceArnSchema,
  identityStoreId: string([
    minLength(1, 'Please enter the identity store ID.'),
  ]),
  schedulerTargetArn: optional(
    string('Scheduler target ARN must be a string.', [
      minLength(1, 'Please enter the scheduler target ARN.'),
    ])
  ),
  schedulerRoleArn: optional(
    string('Scheduler role ARN must be a string.', [
      minLength(1, 'Please enter the scheduler role ARN.'),
    ])
  ),
});

export const RequestAssignmentSchema = object({
  permissionSetArns: PermissionSetArnsRequiredSchema,
  note: NoteSchema,
  operation: optional(
    picklist(
      Object.values(AssignmentOperation),
      'Operation must be either ATTACH or DETACH.'
    ),
    AssignmentOperation.ATTACH
  ),
  principalGroupId: PrincipalIdSchema,
  awsAccountId: AwsAccountIdSchema,
});

const IdsSchema = array(
  string('Id must be a string', [minLength(1)]),
  'The input must be an array of ids.',
  [minLength(1, 'Please input at least one id.')]
);
export const AcceptAssignmentRequestsSchema = object({
  ids: IdsSchema,
  // operation: picklist(
  //   Object.values(AssignmentOperation),
  //   'Operation must be either ATTACH or DETACH.'
  // ),
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
      excludedPrincipals: optional(
        array(
          object({
            id: PrincipalIdSchema,
            type: PrincipalTypeSchema,
          }),
          'The input must be an array of excluded principals.'
        )
      ),
      name: string('Please enter name', [
        minLength(5, 'Name must be at least 5 characters.'),
        maxLength(32, 'Name maximum is 32 characters.'),
      ]),
      target: picklist(Object.values(FreezeTimeTarget), 'Invalid target.'),
      permissionSetArns: PermissionSetArnsRequiredSchema,
      startTime: number('Start time must be a number', [
        minValue(1, 'Start time must be greater than 0.'),
      ]),
      // startTime: string(
      //   'Please enter a valid start time in the format yyyy-MM-dd HH:mm.',
      //   [
      //     regex(
      //       /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) (2[0-3]|[01][0-9]):[0-5][0-9]$/,
      //       'Please enter a valid start time in the format yyyy-MM-dd HH:mm.'
      //     ),
      //   ]
      // ),
      endTime: number('End time must be a number', [
        minValue(1, 'End time must be greater than 0.'),
      ]),
      // endTime: string(
      //   'Please enter a valid end time in the format yyyy-MM-dd HH:mm.',
      //   [
      //     regex(
      //       /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) (2[0-3]|[01][0-9]):[0-5][0-9]$/,
      //       'Please enter a valid end time in the format yyyy-MM-dd HH:mm.'
      //     ),
      //   ]
      // ),
    },
    [
      forward(
        custom(
          ({ startTime, endTime }) => startTime < endTime,
          'End time must be greater than start date'
        ),
        ['endTime']
      ),
      forward(
        custom(
          ({ startTime }) =>
            new Date(startTime * 1000).getTime() >= new Date().getTime(),
          `Start time must be greater or equal to current time`
        ),
        ['startTime']
      ),
    ]
  ),
  ({ startTime, endTime, ...input }) => ({
    ...input,
    startTime: new Date(startTime * 1000),
    endTime: new Date(endTime * 1000),
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

export const TimeInHourSchema = number('Time must be a number', [
  minValue(1, 'Time must be greater than 0.'),
  maxValue(24, 'Time must be less than 24.'),
]);
export const CreateTimeInHourSchema = object({
  timeInHour: TimeInHourSchema,
});

export const DeleteTimeInHourSchema = object({
  timeInHour: TimeInHourSchema,
});

export const ListGroupPrincipalsSchema = object({
  mode: optional(
    picklist(['withoutMemberships', 'withMemberships']),
    'withMemberships'
  ),
});

export type DeleteTimeInHourData = Output<typeof DeleteTimeInHourSchema>;
export type ListGroupPrincipalsData = Output<typeof ListGroupPrincipalsSchema>;

export type CreateTimeInHourData = Output<typeof CreateTimeInHourSchema>;

export const CreateAssignmentUserRequestSchema = object({
  timeInHour: TimeInHourSchema,
  awsAccountId: AwsAccountIdSchema,
  permissionSetArn: PermissionSetArnSchema,
});

export type CreateAssignmentUserRequestData = Output<
  typeof CreateAssignmentUserRequestSchema
>;

export const AcceptAssignmentUserRequestSchema = object({
  id: string([minLength(1, 'Please enter an id.')]),
});
export const RejectAssignmentUserRequestSchema =
  AcceptAssignmentUserRequestSchema;
export const DeleteAssignmentUserRequestSchema =
  AcceptAssignmentUserRequestSchema;

export type AcceptAssignmentUserRequestData = Output<
  typeof AcceptAssignmentUserRequestSchema
>;

export type RejectAssignmentUserRequestData = AcceptAssignmentUserRequestData;

export type DeleteAssignmentUserRequestData = AcceptAssignmentUserRequestData;

export const UpdatePermissionSetSchema = object({
  arn: PermissionSetArnSchema,

  tags: optional(
    object({
      operation: picklist(
        ['SHOW', 'HIDE'],
        'Operation must be either SHOW or HIDE'
      ),
      values: string('Values must be a string', [
        minLength(1, 'Please enter a username.'),
      ]),
    })
  ),
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
  permissionSetArns: PermissionSetArnsRequiredSchema,
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
  membershipIdsToBeDeleted: optional(
    array(
      string('Id must be a string', [minLength(1, 'Please enter an id.')]),
      'The input must be an array of ids.',
      [minLength(1, 'Please input at least one id.')]
    )
  ),

  userIdsToBeAdded: optional(
    array(
      string('Id must be a string', [minLength(1, 'Please enter an id.')]),
      'The input must be an array of ids.',
      [minLength(1, 'Please input at least one id.')]
    )
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
  membershipIdsToBeDeleted: optional(
    array(
      string('Id must be a string', [minLength(1, 'Please enter an id.')]),
      'The input must be an array of ids.',
      [minLength(1, 'Please input at least one id.')]
    )
  ),

  groupIdsToBeAdded: optional(
    array(
      string('Id must be a string', [minLength(1, 'Please enter an id.')]),
      'The input must be an array of ids.',
      [minLength(1, 'Please input at least one id.')]
    )
  ),
});

export type UpdatePermissionSetData = Output<typeof UpdatePermissionSetSchema>;
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
