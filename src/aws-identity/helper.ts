import { IAMClient } from '@aws-sdk/client-iam';
import {
  CreateGroupCommand,
  CreateUserCommand,
  DeleteGroupCommand,
  DeleteUserCommand,
  DescribeGroupCommand,
  DescribeUserCommand,
  type Group,
  IdentitystoreClient,
  ListGroupsCommand,
  ListUsersCommand,
  UpdateGroupCommand,
  UpdateUserCommand,
  type User,
  ListGroupMembershipsCommand,
  CreateGroupMembershipCommand,
  DeleteGroupMembershipCommand,
  ListGroupMembershipsForMemberCommand,
} from '@aws-sdk/client-identitystore';
import {
  type Account,
  ListAccountsCommand,
  OrganizationsClient,
  DescribeAccountCommand,
} from '@aws-sdk/client-organizations';
import {
  type AccountAssignmentForPrincipal,
  CreateAccountAssignmentCommand,
  DeleteAccountAssignmentCommand,
  DescribePermissionSetCommand,
  type InstanceMetadata,
  ListAccountAssignmentsCommand,
  ListAccountAssignmentsForPrincipalCommand,
  ListInstancesCommand,
  ListPermissionSetsCommand,
  SSOAdminClient,
  ListTagsForResourceCommand,
  UpdatePermissionSetCommand,
  TagResourceCommand,
  UntagResourceCommand,
} from '@aws-sdk/client-sso-admin';
import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import {
  PrincipalType,
  AssignmentOperation,
  AssignmentRequestStatus,
} from '@prisma/client';
import { config } from '../__shared__/config';
import { db } from '../db';
import {
  IdentityInstanceNotFoundError,
  OperationFailedError,
  PermissionSetNotFoundError,
} from './errors';
import type {
  CreateGroupPrincipalData,
  CreatePrincipalData,
  CreateUserPrincipalData,
  DeletePrincipalData,
  UpdatePermissionSetData,
  UpdatePrincipalData,
  UpdatePrincipalGroupData,
  UpdatePrincipalUserData,
} from './validations';
import {
  SchedulerClient,
  CreateScheduleCommand,
  DeleteScheduleCommand,
} from '@aws-sdk/client-scheduler';
import { getLocaleDateString, sleep, toJakartaTime } from '../__shared__/utils';
import { SchedulerAction } from './types';
import { sendEmail } from '../__shared__/mailer';

const credentials = {
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  sessionToken: config.AWS_SESSION_TOKEN,
};

export const ssoAdmin = new SSOAdminClient({
  credentials,
});

export const scheduler = new SchedulerClient({ credentials });

export const sts = new STSClient({ credentials });

export const identityStore = new IdentitystoreClient({ credentials });

export const organizations = new OrganizationsClient({ credentials });

export const iam = new IAMClient({ credentials });

type CreateOneTimeSchedule = {
  startTime: Date;
  endTime: Date;
  name: string;
};

type SendEmailToApproversData = {
  approverEmails: string[];
  operation: AssignmentOperation;
  permissionSetNames: string[];
  groupName: string;
  requesterName: string;
  howLong?: string;
  type?: 'GROUP' | 'USER';
  id: string;
};
export const sendEmailToApprovers = async (data: SendEmailToApproversData) => {
  const {
    operation,
    approverEmails,
    groupName,
    permissionSetNames,
    requesterName,
    howLong,
    id,
    type = 'GROUP',
  } = data;

  const ops = operation === AssignmentOperation.ATTACH ? 'Attach' : 'Detach';
  let groupOrUser = 'group';
  if (howLong) groupOrUser = 'user';

  const subject = `${ops} Permission Sets Request for ${groupName}`;
  const detailLink = `${config.FE_REQUEST_PAGE_URL}?id=${id}&type=${type}`;
  const approveLink = `${config.FE_REQUEST_PAGE_URL}?action=accept&id=${id}&type=${type}`;
  const rejectLink = `${config.FE_REQUEST_PAGE_URL}?action=reject&id=${id}&type=${type}`;

  const permissionList = permissionSetNames
    .map((set) => `<li>${set}</li>`)
    .join('');
  const htmlBody = `
  <html>
  <head>
      <style>
          .button {
              display: inline-block;
              padding: 10px 20px;
              font-size: 16px;
              color: #fff;
              text-align: center;
              text-decoration: none;
              margin: 10px;
              border-radius: 5px;
          }
          .approve-button {
              background-color: #28a745;
          }
          .reject-button {
              background-color: #dc3545;
          }
      </style>
  </head>
  <body>
      <h3>Permission Sets ${ops}</h3>
      <p>Dear Approver,</p>
      <p>${requesterName} has requested to ${operation} the following permission sets to/from the ${groupOrUser} <strong>${groupName}</strong> ${
    howLong ? `<strong>for ${howLong}</strong>` : ''
  }:</p>
      <ul>
          ${permissionList}
      </ul>
      <p>Please review the request and take appropriate action:</p>
      <p>
          <a href="${approveLink}" class="button approve-button">Accept</a>
          <a href="${rejectLink}" class="button reject-button">Reject</a>
      </p>
      <p>For more details, visit the <a href="${detailLink}">request details page</a>.</p>
      <p>Thank you.</p>
  </body>
  </html>
`;

  await sendEmail({
    Destination: {
      // ToAddresses: approverEmails,
      ToAddresses: ['pragusga.t@gmail.com'],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Html: {
          Data: htmlBody,
        },
      },
    },
  }).catch();
};

type SendEmailToApproverRequester = {
  approverName: string;
  requesterEmail: string;
  permissionSetNames: string[];
  groupName: string;
  status: AssignmentRequestStatus;
  operation: AssignmentOperation;
  requesterName: string;
};

export const sendEmailToRequester = async (
  data: SendEmailToApproverRequester
) => {
  const {
    approverName,
    groupName,
    permissionSetNames,
    requesterEmail,
    requesterName,
    status,
    operation,
  } = data;

  const ops = operation === AssignmentOperation.ATTACH ? 'Attach' : 'Detach';
  const opsL = ops.toLowerCase();

  const subject = `${ops} Permission Sets Request for ${groupName}`;
  const statusMessage =
    status === AssignmentRequestStatus.ACCEPTED ? 'accepted' : 'rejected';

  const statusMU =
    status === AssignmentRequestStatus.ACCEPTED ? 'Accepted' : 'Rejected';

  const permissionList = permissionSetNames
    .map((set) => `<li>${set}</li>`)
    .join('');

  const htmlBody = `
    <html>
    <head>
        <style>
            .status-message {
                font-size: 16px;
                color: ${
                  status === AssignmentRequestStatus.ACCEPTED
                    ? '#28a745'
                    : '#dc3545'
                };
            }
        </style>
    </head>
    <body>
        <h3>Permission Sets Request ${statusMU}</h3>
        <p>Dear ${requesterName},</p>
        <p>Your request to ${opsL} the following permission sets to/from the group <strong>${groupName}</strong> has been <span class="status-message">${statusMessage}</span> by ${approverName}:</p>
        <ul>
            ${permissionList}
        </ul>
        <p>If you have any questions or need further assistance, please contact the approver.</p>
        <p>Thank you.</p>
    </body>
    </html>
`;

  await sendEmail({
    Destination: {
      // ToAddresses: [requesterEmail],
      ToAddresses: ['pragusga.t@gmail.com'],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Html: {
          Data: htmlBody,
        },
      },
    },
  }).catch();
};

export const deleteSchedule = async (name: string) => {
  await scheduler
    .send(
      new DeleteScheduleCommand({
        Name: `start_${name}`,
      })
    )
    .catch((e) => {});

  await scheduler
    .send(
      new DeleteScheduleCommand({
        Name: `end_${name}`,
      })
    )
    .catch((e) => {});
};

export const createOneTimeSchedulev1 = async ({
  time,
  name,
  input,
}: {
  time: Date;
  name: string;
  input: Object;
}) => {
  const { schedulerRoleArn, schedulerTargetArn } =
    await getIdentityInstanceOrThrow();

  if (!schedulerRoleArn || !schedulerTargetArn) {
    throw new Error('Scheduler role or target not set');
  }

  const timeStr =
    getLocaleDateString(time, {
      format: 'yyyy-mm-ddThh:MM',
    }) + ':00';

  await scheduler.send(
    new CreateScheduleCommand({
      Name: name,
      ActionAfterCompletion: 'DELETE',
      ScheduleExpression: `at(${timeStr})`,
      Target: {
        Arn: schedulerTargetArn,
        RoleArn: schedulerRoleArn,
        Input: JSON.stringify(input),
      },
      FlexibleTimeWindow: {
        Mode: 'OFF',
      },
      ScheduleExpressionTimezone: 'Asia/Jakarta',
    })
  );
};

export const createOneTimeSchedule = async (data: CreateOneTimeSchedule) => {
  const { name, startTime, endTime } = data;

  const startTimeStr =
    getLocaleDateString(startTime, {
      format: 'yyyy-mm-ddThh:MM',
    }) + ':00';
  const endTimeStr =
    getLocaleDateString(endTime, {
      format: 'yyyy-mm-ddThh:MM',
    }) + ':00';

  const { schedulerRoleArn, schedulerTargetArn } =
    await getIdentityInstanceOrThrow();

  if (!schedulerRoleArn || !schedulerTargetArn) {
    throw new Error('Scheduler role or target not set');
  }

  // const targetArn =
  //   'arn:aws:lambda:ap-southeast-3:587000135223:function:cron-aws-identity';

  // const roleArn =
  //   'arn:aws:iam::587000135223:role/service-role/Amazon_EventBridge_Scheduler_LAMBDA_38758e7cac';

  await scheduler.send(
    new CreateScheduleCommand({
      Name: `start_${name}`,
      ActionAfterCompletion: 'DELETE',
      ScheduleExpression: `at(${startTimeStr})`,
      Target: {
        Arn: schedulerTargetArn,
        RoleArn: schedulerRoleArn,
        Input: JSON.stringify({
          name,
          action: SchedulerAction.FREEZE,
        }),
      },
      FlexibleTimeWindow: {
        Mode: 'OFF',
      },
      ScheduleExpressionTimezone: 'Asia/Jakarta',
    })
  );

  await scheduler.send(
    new CreateScheduleCommand({
      Name: `end_${name}`,
      ActionAfterCompletion: 'DELETE',
      ScheduleExpression: `at(${endTimeStr})`,
      Target: {
        Arn: schedulerTargetArn,
        RoleArn: schedulerRoleArn,
        Input: JSON.stringify({
          name,
          action: SchedulerAction.ROLLBACK,
        }),
      },
      FlexibleTimeWindow: {
        Mode: 'OFF',
      },
      ScheduleExpressionTimezone: 'Asia/Jakarta',
    })
  );
};

export const getUserMemberships = async (
  principalUserId: string,
  identityStoreId?: string | null
) => {
  const theIdentityStoreId =
    identityStoreId ?? (await getIdentityInstanceOrThrow()).identityStoreId;
  const [groupsInMap] = await Promise.all([listGroupsInMap()]);

  const { GroupMemberships } = await identityStore.send(
    new ListGroupMembershipsForMemberCommand({
      MemberId: {
        UserId: principalUserId,
      },
      IdentityStoreId: theIdentityStoreId,
    })
  );

  if (!GroupMemberships) return [];

  const memberships: {
    membershipId: string;
    groupId: string;
    groupDisplayName: string;
  }[] = [];

  GroupMemberships.forEach((membership) => {
    const { GroupId, MembershipId } = membership;

    if (!GroupId || !MembershipId) return;

    const group = groupsInMap.get(GroupId);

    if (!group || !group.displayName) return;

    memberships.push({
      membershipId: MembershipId,
      groupId: GroupId,
      groupDisplayName: group.displayName,
    });
  });

  return memberships;
};

export const listGroupsInUsers = async (identityStoreId?: string | null) => {
  const [groupsInMap] = await Promise.all([listGroupsInMap(identityStoreId)]);

  const groups = Array.from(groupsInMap.values());

  const groupMembershipsPromises = groups.map((group) => {
    return identityStore.send(
      new ListGroupMembershipsCommand({
        GroupId: group.id,
        IdentityStoreId: group.identityStoreId!,
        MaxResults: 99,
      })
    );
  });

  const groupMemberships = await Promise.all(groupMembershipsPromises);

  const usersGroupsMap = new Map<
    string,
    { groupDisplayName: string; groupId: string; membershipId: string }[]
  >();

  groupMemberships.forEach(({ GroupMemberships }) => {
    if (!GroupMemberships) return;

    GroupMemberships.forEach(({ MemberId, MembershipId, GroupId }) => {
      if (!MemberId || !MembershipId || !GroupId) return;
      const { UserId } = MemberId;

      if (!UserId || !GroupId) return;
      const group = groupsInMap.get(GroupId);
      if (!group) return;

      const userMap = usersGroupsMap.get(UserId);
      if (!userMap) {
        usersGroupsMap.set(UserId, [
          {
            groupDisplayName: group.displayName!,
            groupId: GroupId,
            membershipId: MembershipId,
          },
        ]);
      } else {
        userMap.push({
          groupDisplayName: group.displayName!,
          groupId: GroupId,
          membershipId: MembershipId,
        });
        usersGroupsMap.set(UserId, userMap);
      }
    });
  });

  return usersGroupsMap;
};

export const listUsersInGroups = async (identityStoreId?: string | null) => {
  const [groupsInMap, usersInMap] = await Promise.all([
    listGroupsInMap(identityStoreId),
    listUsersInMap(identityStoreId),
  ]);

  const groups = Array.from(groupsInMap.values());

  const groupMembershipsPromises = groups.map((group) => {
    return identityStore.send(
      new ListGroupMembershipsCommand({
        GroupId: group.id,
        IdentityStoreId: group.identityStoreId!,
        MaxResults: 99,
      })
    );
  });

  const groupMemberships = await Promise.all(groupMembershipsPromises);

  const groupsUsersMap = new Map<
    string,
    { userDisplayName: string; userId: string; membershipId: string }[]
  >();

  groupMemberships.forEach(({ GroupMemberships }) => {
    if (!GroupMemberships) return;

    GroupMemberships.forEach(({ MemberId, MembershipId, GroupId }) => {
      if (!MemberId || !MembershipId || !GroupId) return;
      const { UserId } = MemberId;

      if (!UserId) return;
      const user = usersInMap.get(UserId);
      if (!user) return;

      const groupMap = groupsUsersMap.get(GroupId);

      if (!groupMap) {
        groupsUsersMap.set(GroupId!, [
          {
            userDisplayName: user.displayName!,
            userId: UserId,
            membershipId: MembershipId,
          },
        ]);
      } else {
        groupMap.push({
          userDisplayName: user.displayName!,
          userId: UserId,
          membershipId: MembershipId,
        });
        groupsUsersMap.set(GroupId!, groupMap);
      }
    });
  });

  return groupsUsersMap;
};

export const getAccountId = async () => {
  const { Account } = await sts.send(new GetCallerIdentityCommand({}));
  return Account;
};

export const listAccounts = async () => {
  const accounts: Account[] = [];
  const { Accounts, NextToken } = await organizations.send(
    new ListAccountsCommand({
      // MaxResults: 9,
    })
  );
  if (!Accounts || Accounts.length === 0) return [];
  let nextToken: string | undefined = undefined;
  nextToken = NextToken;

  accounts.push(...Accounts);

  while (nextToken) {
    const { Accounts, NextToken } = await organizations.send(
      new ListAccountsCommand({
        MaxResults: 99,
        NextToken: nextToken,
      })
    );
    if (!Accounts || Accounts.length === 0) break;
    nextToken = NextToken;
    accounts.push(...Accounts);
  }

  return accounts.map((acc) => {
    return {
      id: acc.Id ?? '',
      name: acc.Name ?? '',
      email: acc.Email,
      arn: acc.Arn,
    };
  });
};

type ListAccountsReturnedOne = Awaited<ReturnType<typeof listAccounts>>[0];

export const listAccountsInMap = async () => {
  const accounts = await listAccounts();
  const map = new Map<string, ListAccountsReturnedOne>();
  accounts.forEach((acc) => {
    map.set(acc.id!, acc);
  });
  return map;
};

export const getIdentityInstanceOrThrow = async () => {
  const res = await db.identityInstance.findFirst({});
  if (!res) {
    throw new IdentityInstanceNotFoundError();
    // return {
    //   id: '-',
    //   instanceArn: '-',
    //   identityStoreId: '-',
    // };
  }

  return res;
};

export const listAccountAssignmentsforPrincipal = async (
  principalId: string,
  principalType: PrincipalType = PrincipalType.GROUP,
  strict = false,
  instanceArn?: string | null
) => {
  const accountAssignments: AccountAssignmentForPrincipal[] = [];

  // const { instanceArn } = identityInstance;
  const theInstanceArn =
    instanceArn ?? (await getIdentityInstanceOrThrow()).instanceArn;

  const { AccountAssignments, NextToken } = await ssoAdmin.send(
    new ListAccountAssignmentsForPrincipalCommand({
      InstanceArn: theInstanceArn,
      PrincipalId: principalId,
      PrincipalType: principalType,
      MaxResults: 99,
    })
  );

  if (!AccountAssignments || AccountAssignments.length === 0) return [];

  let nextToken: string | undefined = undefined;
  nextToken = NextToken;

  accountAssignments.push(...AccountAssignments);

  while (nextToken) {
    const { AccountAssignments, NextToken } = await ssoAdmin.send(
      new ListAccountAssignmentsForPrincipalCommand({
        InstanceArn: theInstanceArn,
        PrincipalId: principalId,
        PrincipalType: principalType,
        NextToken: nextToken,
        MaxResults: 99,
      })
    );
    if (!AccountAssignments || AccountAssignments.length === 0) break;
    nextToken = NextToken;
    accountAssignments.push(...AccountAssignments);
  }

  const d = accountAssignments
    .filter(
      (assgn) =>
        !!assgn.AccountId &&
        !!assgn.PermissionSetArn &&
        !!assgn.PrincipalId &&
        !!assgn.PrincipalType
    )
    .map((assgn) => ({
      accountId: assgn.AccountId!,
      permissionSetArn: assgn.PermissionSetArn!,
      principalId: assgn.PrincipalId!,
      principalType: assgn.PrincipalType!,
    }));

  if (!strict) return d;

  return d.filter(
    (x) => x.principalId === principalId && x.principalType === principalType
  );
};

export const getAllowedAwsAccounts = async (principalUserId: string) => {
  const membershipsPromise = getUserMemberships(principalUserId);
  const awsAccountsPromise = listAccounts();
  const [memberships, awsAccounts] = await Promise.all([
    membershipsPromise,
    awsAccountsPromise,
  ]);

  return awsAccounts.filter((acc) => {
    return memberships.some((mem) => acc.name.includes(mem.groupDisplayName));
  });
};

export const describePermissionSetsInPrincipal = async (
  principalId: string,
  principalType: PrincipalType = PrincipalType.GROUP,
  instanceArn?: string | null
) => {
  const accountAssignments = await listAccountAssignmentsforPrincipal(
    principalId,
    principalType,
    false,
    instanceArn
  );
  const accountAssignmentsFiltered = accountAssignments.filter(
    (assg) =>
      assg.principalId === principalId &&
      assg.principalType === principalType &&
      !!assg.permissionSetArn
  );

  const permissionSetArns = accountAssignmentsFiltered.map(
    (assg) => assg.permissionSetArn
  ) as string[];

  const permissionSetsPromises = permissionSetArns.map((permissionSetArn) =>
    describePermissionSet(permissionSetArn)
  );

  const permissionSets = await Promise.all(permissionSetsPromises);

  return permissionSets;
};

export const describeDetailPrincipalAwsAccounts = async (
  data: {
    principalId: string;
    principalType: PrincipalType;
    awsAccountId: string;
    id: string;
  }[],
  instanceArn?: string | null
) => {
  const principalsUnique = [
    ...new Set(data.map((p) => `${p.principalId}#${p.principalType}`)),
  ];

  // const principalsAwsAccountsSet = new Set(
  //   data.map((p) => `${p.principalId}#${p.principalType}#${p.awsAccountId}`)
  // );

  const accountAssignmentPromises = principalsUnique.map((principal) => {
    const [principalId, principalType] = principal.split('#');
    return listAccountAssignmentsforPrincipal(
      principalId,
      principalType as PrincipalType,
      false,
      instanceArn
    );
  });

  const [accountAssignments, permissionSetsMap, awsAccountsMap, principalsMap] =
    await Promise.all([
      Promise.all(accountAssignmentPromises),
      describeAllPermissionSetsInMap(),
      listAccountsInMap(),
      listPrincipalsInMap(),
    ]);

  const result: {
    principalId: string;
    principalType: PrincipalType;
    permissionSets: {
      arn: string;
      name: string | null;
    }[];
    awsAccountId: string;
    awsAccountName: string | null;
    principalDisplayName: string | null;
    id: string;
  }[] = [];

  const principalAwsAccountMap = new Map<
    string,
    {
      permissionSetArns: string[];
    }
  >();

  accountAssignments.forEach((assgs, idx) => {
    const principalId = data[idx].principalId;
    const assignment = assgs.filter(
      (assg) => assg.principalId === principalId && !!assg.accountId
    );

    if (assignment.length === 0) return;

    assignment.forEach(({ principalId, accountId, permissionSetArn }) => {
      const key = `${principalId}#${accountId}`;

      if (!principalAwsAccountMap.has(key)) {
        principalAwsAccountMap.set(key, {
          permissionSetArns: [],
        });
      }

      const value = principalAwsAccountMap.get(key);
      if (value) {
        value.permissionSetArns.push(permissionSetArn);
      }

      principalAwsAccountMap.set(key, value!);
    });
  });

  // biome-ignore lint/complexity/noForEach: <explanation>
  data.forEach(({ principalId, awsAccountId, principalType, id }) => {
    const key = `${principalId}#${awsAccountId}`;
    const value = principalAwsAccountMap.get(key);

    const permissionSets = !value
      ? []
      : value.permissionSetArns.map((permissionSetArn) => {
          const permissionSet = permissionSetsMap.get(permissionSetArn);
          return {
            arn: permissionSetArn,
            name: permissionSet?.name ?? null,
          };
        });

    result.push({
      principalId,
      principalType,
      permissionSets,
      awsAccountId,
      awsAccountName: awsAccountsMap.get(awsAccountId)?.name ?? null,
      principalDisplayName: principalsMap.get(principalId)?.displayName ?? null,
      id,
    });
  });

  return result;
};

export const listInstances = async () => {
  const instances: InstanceMetadata[] = [];
  const { Instances, NextToken } = await ssoAdmin.send(
    new ListInstancesCommand({
      MaxResults: 99,
    })
  );
  if (!Instances || Instances.length === 0) return [];

  let nextToken: string | undefined = undefined;
  nextToken = NextToken;

  instances.push(...Instances);

  while (nextToken) {
    const { Instances, NextToken } = await ssoAdmin.send(
      new ListInstancesCommand({
        MaxResults: 99,
        NextToken: nextToken,
      })
    );
    if (!Instances || Instances.length === 0) break;
    nextToken = NextToken;
    instances.push(...Instances);
  }

  return instances.map((instance) => ({
    name: instance.Name ?? null,
    identityStoreId: instance.IdentityStoreId ?? null,
    createdDate: instance.CreatedDate ?? null,
    instanceArn: instance.InstanceArn ?? null,
    status: instance.Status ?? null,
    ownerAccountId: instance.OwnerAccountId ?? null,
  }));
};

export const listInstanceArnsByIdentityStoreId = async (
  identityStoreId: string
): Promise<string[]> => {
  const instances = await listInstances();
  return instances
    .filter(
      (instance) =>
        instance.identityStoreId === identityStoreId &&
        instance.instanceArn !== undefined
    )
    .map((instance) => instance.instanceArn) as string[];
};

export const listAccountAssignments = async (): Promise<
  {
    principalId: string;
    principalType: PrincipalType;
    permissionSets: {
      arn: string;
      name: string | null;
    }[];
    principalDisplayName: string | null;
  }[]
> => {
  const identityInstancePromise = getIdentityInstanceOrThrow();
  const accountIdPromise = getAccountId();
  const permissionSetsPromise = describeAllPermissionSets();
  const [{ instanceArn }, accountId, permissionSets] = await Promise.all([
    identityInstancePromise,
    accountIdPromise,
    permissionSetsPromise,
  ]);

  const permissionSetArns = permissionSets.map(
    (permissionSet) => permissionSet.permissionSetArn as string
  );

  let principals: {
    id: string;
    displayName: string | null;
    principalType: PrincipalType;
  }[] = [];

  const commandPromises = permissionSetArns.map((permissionSetArn) => {
    return ssoAdmin.send(
      new ListAccountAssignmentsCommand({
        InstanceArn: instanceArn,
        AccountId: accountId,
        PermissionSetArn: permissionSetArn,
        MaxResults: 99,
      })
    );
  });

  const results = await Promise.all(commandPromises);

  const principalsSet = new Set<string>();

  results.forEach(({ AccountAssignments }) => {
    if (!AccountAssignments) return;
    AccountAssignments.forEach((assignment) => {
      if (assignment.PrincipalId) {
        const { PrincipalId, PrincipalType } = assignment;
        const key = `${PrincipalType}#${PrincipalId}`;
        principalsSet.add(key);
      }
    });
  });

  const principalsPromises = Array.from(principalsSet).map((principal) => {
    const [principalType, principalId] = principal.split('#');
    return describePrincipal(principalId, principalType as PrincipalType);
  });

  principals = await Promise.all(principalsPromises);

  const mapDisplayName = new Map<string, string | null>();
  principals.forEach((principal) => {
    mapDisplayName.set(principal.id, principal.displayName);
  });

  const data: {
    principalId: string;
    principalType: PrincipalType;
    permissionSets: {
      arn: string;
      name: string | null;
    }[];
    principalDisplayName: string | null;
  }[] = [];

  const mapData: Map<
    string,
    {
      principalId: string;
      principalType: PrincipalType;
      permissionSets: {
        arn: string;
        name: string | null;
      }[];
      principalDisplayName: string | null;
    }
  > = new Map();

  results.forEach(({ AccountAssignments }, idx) => {
    if (!AccountAssignments) return;
    AccountAssignments.forEach((assignment) => {
      const { PrincipalId, PrincipalType, PermissionSetArn } = assignment;
      const displayName = mapDisplayName.get(PrincipalId ?? '') ?? null;

      if (!mapData.has(PrincipalId ?? '')) {
        mapData.set(PrincipalId ?? '', {
          principalId: PrincipalId ?? '-',
          principalType: PrincipalType as PrincipalType,
          permissionSets: [],
          principalDisplayName: displayName,
        });
      }

      const data = mapData.get(PrincipalId ?? '');

      if (data) {
        data.permissionSets.push({
          arn: PermissionSetArn ?? '-',
          name:
            permissionSets.find(
              (permissionSet) =>
                permissionSet.permissionSetArn === PermissionSetArn
            )?.name ?? null,
        });
      }

      mapData.set(PrincipalId ?? '', data as any);
    });
  });

  mapData.forEach((value) => {
    data.push(value);
  });

  return data;
};

export const listGroups = async (identityStoreId?: string | null) => {
  const theIdentityStoreId =
    identityStoreId ?? (await getIdentityInstanceOrThrow()).identityStoreId;

  const groups: Group[] = [];
  const { Groups, NextToken } = await identityStore.send(
    new ListGroupsCommand({
      IdentityStoreId: theIdentityStoreId,
      MaxResults: 99,
    })
  );

  if (!Groups || Groups.length === 0) return [];
  let nextToken: string | undefined = undefined;
  nextToken = NextToken;

  groups.push(...Groups);

  while (nextToken) {
    const { Groups, NextToken } = await identityStore.send(
      new ListGroupsCommand({
        IdentityStoreId: theIdentityStoreId,
        NextToken: nextToken,
      })
    );
    if (!Groups || Groups.length === 0) break;
    nextToken = NextToken;
    groups.push(...Groups);
    await sleep(500);
  }

  return groups.map((group) => ({
    id: group.GroupId ?? '-',
    displayName: group.DisplayName ?? null,
    description: group.Description ?? null,
    identityStoreId: group.IdentityStoreId ?? null,
    principalType: PrincipalType.GROUP,
  }));
};

export const listUsers = async (identityStoreId?: string | null) => {
  const theIdentityStoreId =
    identityStoreId ?? (await getIdentityInstanceOrThrow()).identityStoreId;

  const users: User[] = [];
  const { Users, NextToken } = await identityStore.send(
    new ListUsersCommand({
      IdentityStoreId: theIdentityStoreId,
    })
  );

  if (!Users || Users.length === 0) return [];
  let nextToken: string | undefined = undefined;
  nextToken = NextToken;

  users.push(...Users);

  while (nextToken) {
    const { Users, NextToken } = await identityStore.send(
      new ListUsersCommand({
        IdentityStoreId: theIdentityStoreId,
        NextToken: nextToken,
      })
    );
    if (!Users || Users.length === 0) break;
    nextToken = NextToken;
    users.push(...Users);
    await sleep(500);
  }

  return users.map((user) => ({
    id: user.UserId ?? '-',
    displayName: user.DisplayName ?? null,
    name: user.Name
      ? {
          familyName: user.Name.FamilyName ?? null,
          givenName: user.Name.GivenName ?? null,
        }
      : null,
    identityStoreId: user.IdentityStoreId ?? null,
    emails: user.Emails?.map((email) => email.Value).filter(Boolean) ?? [],
    username: user.UserName ?? null,
    principalType: PrincipalType.USER,
  }));
};

export const listPrincipals = async (identityStoreId?: string | null) => {
  const [groups, users] = await Promise.all([
    listGroups(identityStoreId),
    listUsers(identityStoreId),
  ]);
  return [...groups, ...users];
};

export const listPrincipalsInMap = async (identityStoreId?: string | null) => {
  const [groups, users] = await Promise.all([
    listGroups(identityStoreId),
    listUsers(identityStoreId),
  ]);
  const principals = [...groups, ...users];
  const map = new Map<string, ReturnedPrincipal>();

  principals.forEach((principal) => {
    map.set(principal.id, principal);
  });

  return map;
};

export const listGroupsInMap = async (identityStoreId?: string | null) => {
  const groups = await listGroups(identityStoreId);
  const map = new Map<string, Awaited<ReturnType<typeof listGroups>>[0]>();
  groups.forEach((group) => {
    map.set(group.id, group);
  });
  return map;
};

export const listUsersInMap = async (identityStoreId?: string | null) => {
  const users = await listUsers(identityStoreId);
  const map = new Map<string, Awaited<ReturnType<typeof listUsers>>[0]>();
  users.forEach((user) => {
    map.set(user.id, user);
  });
  return map;
};

export const listPermissionSets = async (instanceArn?: string | null) => {
  // const { instanceArn } = await getIdentityInstanceOrThrow();
  const theInstanceArn =
    instanceArn ?? (await getIdentityInstanceOrThrow()).instanceArn;

  const { PermissionSets, NextToken } = await ssoAdmin.send(
    new ListPermissionSetsCommand({
      InstanceArn: theInstanceArn,
    })
  );

  if (!PermissionSets || PermissionSets.length === 0) return [];
  const permissionSets: string[] = [];
  let nextToken = NextToken;

  permissionSets.push(...PermissionSets);

  while (nextToken) {
    const { PermissionSets, NextToken } = await ssoAdmin.send(
      new ListPermissionSetsCommand({
        InstanceArn: theInstanceArn,
        NextToken: nextToken,
      })
    );
    if (!PermissionSets || PermissionSets.length === 0) break;
    nextToken = NextToken;
    permissionSets.push(...PermissionSets);
  }

  return permissionSets;
};

export const listPermissionSetArnsInSet = async (
  instanceArn?: string | null
) => {
  const permissionSetArns = await listPermissionSets(instanceArn);
  return new Set(permissionSetArns);
};

export const getPsTagsInfo = (tags: Record<string, string>) => {
  let showOrHide: 'SHOW' | 'HIDE' = 'HIDE';
  let showHideValue = 'ALL GROUPS';

  if ('showTo' in tags) {
    showHideValue = tags['showTo'];
    showOrHide = 'SHOW';
  }

  if ('hideFrom' in tags) {
    showHideValue = tags['hideFrom'];
    showOrHide = 'HIDE';
  }

  const isShow = showOrHide === 'SHOW';
  const isAll = showHideValue === 'ALL GROUPS';

  return {
    showOrHide,
    showHideValue,
    isShow,
    isAll,
  };
};

export const getPsTagsInfoPayload = (tags: {
  operation: 'SHOW' | 'HIDE';
  values: string;
}) => {
  let showOrHide: 'SHOW' | 'HIDE' = tags.operation;
  let showHideValue = tags.values;

  const isShow = showOrHide === 'SHOW';
  const isAll = showHideValue === 'ALL USERS';

  return {
    showOrHide,
    showHideValue,
    isShow,
    isAll,
  };
};

export const updatePermissionSet = async (data: UpdatePermissionSetData) => {
  const { arn, tags } = data;

  const { instanceArn } = await getIdentityInstanceOrThrow();

  if (tags) {
    const { isShow, isAll } = getPsTagsInfoPayload(tags);

    await ssoAdmin.send(
      new UntagResourceCommand({
        ResourceArn: arn,
        InstanceArn: instanceArn,
        TagKeys: ['showTo', 'hideFrom'],
      })
    );

    await ssoAdmin.send(
      new TagResourceCommand({
        InstanceArn: instanceArn,
        ResourceArn: arn,
        Tags: [
          {
            Key: isShow ? 'showTo' : 'hideFrom',
            Value: isAll ? 'ALL GROUPS' : tags.values,
          },
        ],
      })
    );
  }
};

export const describePermissionSet = async (
  permissionSetArn: string,
  withTags = false,
  instanceArn?: string | null
) => {
  // const { instanceArn } = await getIdentityInstanceOrThrow();
  const theInstanceArn =
    instanceArn ?? (await getIdentityInstanceOrThrow()).instanceArn;

  let tags: Record<string, string> = {};

  const { PermissionSet } = await ssoAdmin.send(
    new DescribePermissionSetCommand({
      InstanceArn: theInstanceArn,
      PermissionSetArn: permissionSetArn,
    })
  );

  if (!PermissionSet) throw new PermissionSetNotFoundError();

  if (withTags) {
    const { Tags } = await ssoAdmin.send(
      new ListTagsForResourceCommand({
        ResourceArn: permissionSetArn,
        InstanceArn: theInstanceArn,
      })
    );

    if (!!Tags && Tags.length > 0) {
      tags = Tags.reduce<typeof tags>((acc, tag) => {
        if (tag.Key) {
          acc[tag.Key] = tag.Value ?? '';
        }
        return acc;
      }, {});
    }
  }

  return {
    name: PermissionSet.Name ?? null,
    description: PermissionSet.Description ?? null,
    createdDate: PermissionSet.CreatedDate ?? null,
    permissionSetArn: PermissionSet.PermissionSetArn ?? null,
    sessionDuration: PermissionSet.SessionDuration ?? null,
    relayState: PermissionSet.RelayState ?? null,
    tags,
  };
};

export const describeAllPermissionSets = async (withTags = false) => {
  const permissionSets = await listPermissionSets();

  const describePermissionSetsPromises = permissionSets.map((permissionSet) =>
    describePermissionSet(permissionSet, withTags)
  );

  return Promise.all(describePermissionSetsPromises);
};

export const describeAllPermissionSetsInMap = async (
  instanceArn?: string | null
) => {
  const permissionSets = await listPermissionSets(instanceArn);

  const describePermissionSetsPromises = permissionSets.map((permissionSet) =>
    describePermissionSet(permissionSet, false, instanceArn)
  );

  const permissionSetsDetail = await Promise.all(
    describePermissionSetsPromises
  );

  const map = new Map<
    string,
    Awaited<ReturnType<typeof describePermissionSet>>
  >();

  permissionSetsDetail.forEach((permissionSet) => {
    map.set(permissionSet.permissionSetArn!, permissionSet);
  });

  return map;
};

type ReturnedPrincipal = Awaited<ReturnType<typeof listPrincipals>>[0];

type Data = {
  principalId: string;
  principalType: PrincipalType;
  permissionSets: {
    arn: string;
    name: string | null;
  }[];
  principalDisplayName: string | null;
  permissionSetArns: string[];
  awsAccountId?: string | null;
  awsAccountName?: string | null;
}[];

export const detachAllPermissionSetsFromPrincipal = async (
  principalId: string,
  principalType: PrincipalType,
  instanceArn?: string | null
) => {
  const accountAssignments = await listAccountAssignmentsforPrincipal(
    principalId,
    principalType,
    false,
    instanceArn
  );

  const detachPromises = accountAssignments.map((assg) => {
    return deleteAccountAssignment({
      principalId: principalId,
      principalType: principalType,
      permissionSetArn: assg.permissionSetArn,
      awsAccountId: assg.accountId,
    });
  });

  await Promise.all(detachPromises);
};

export const listAccountAssignmentsv2 = async (
  type: PrincipalType = PrincipalType.GROUP,
  opts?: { identityStoreId?: string | null; instanceArn?: string | null } | null
) => {
  const principalsPromise =
    type === PrincipalType.GROUP
      ? listGroups(opts?.identityStoreId)
      : listUsers(opts?.identityStoreId);

  const awsAccountsPromise = listAccountsInMap();

  const [principals, awsAccounts] = await Promise.all([
    principalsPromise,
    awsAccountsPromise,
  ]);

  const data: Data = [];

  if (principals.length === 0 || awsAccounts.size === 0) return data;

  const principalsMap: Record<string, ReturnedPrincipal> = {};
  principals.forEach((principal) => {
    principalsMap[principal.id] = principal;
  });

  const accountAssignmentsPromises = principals.map((principal) =>
    listAccountAssignmentsforPrincipal(
      principal.id,
      principal.principalType,
      false,
      opts?.instanceArn
    )
  );

  const accountAssignments = await Promise.all(accountAssignmentsPromises);

  const uniquePermissionSetArns = new Set<string>();

  accountAssignments.forEach((assgs, idx) => {
    const principalId = principals[idx].id;
    const assignment = assgs.filter(
      (assg) => assg.principalId === principalId && !!assg.accountId
    );

    const accountIdPsMap: Record<string, string[]> = {};

    assignment.forEach((assg) => {
      if (!accountIdPsMap[assg.accountId!]) {
        accountIdPsMap[assg.accountId!] = [];
      }
      accountIdPsMap[assg.accountId!].push(assg.permissionSetArn);
      uniquePermissionSetArns.add(assg.permissionSetArn);
    });

    Object.entries(accountIdPsMap).forEach(([accountId, permissionSetArns]) => {
      data.push({
        principalId,
        principalType: principalsMap[principalId].principalType,
        permissionSets: [],
        principalDisplayName: principalsMap[principalId].displayName ?? null,
        awsAccountId: accountId,
        awsAccountName: awsAccounts.get(accountId)?.name,
        permissionSetArns,
      });
    });
  });

  const describePermissionSetsPromises = Array.from(
    uniquePermissionSetArns
  ).map((permissionSetArn) => describePermissionSet(permissionSetArn));

  const permissionSets = await Promise.all(describePermissionSetsPromises);

  data.forEach((principal) => {
    principal.permissionSetArns.forEach((permissionSetArn) => {
      const permissionSet = permissionSets.find(
        (set) => set.permissionSetArn === permissionSetArn
      );
      if (permissionSet) {
        principal.permissionSets.push({
          arn: permissionSet.permissionSetArn as string,
          name: permissionSet.name,
        });
      }
    });
  });

  return data.map(({ permissionSetArns, ...d }) => d);
};

type CreateAccountAssignmentData = {
  permissionSetArn: string;
  principalId: string;
  principalType: PrincipalType;
  awsAccountId?: string;
};

export const createAccountAssignment = async (
  data: CreateAccountAssignmentData,
  instanceArn?: string | null
) => {
  // const { instanceArn } = await getIdentityInstanceOrThrow();
  const theInstanceArn =
    instanceArn ?? (await getIdentityInstanceOrThrow()).instanceArn;
  const { principalId, principalType, permissionSetArn, awsAccountId } = data;

  const { AccountAssignmentCreationStatus } = await ssoAdmin.send(
    new CreateAccountAssignmentCommand({
      InstanceArn: theInstanceArn,
      PermissionSetArn: permissionSetArn,
      PrincipalId: principalId,
      PrincipalType: principalType,
      TargetId: awsAccountId ?? (await getAccountId()),
      TargetType: 'AWS_ACCOUNT',
    })
  );

  if (AccountAssignmentCreationStatus?.FailureReason) {
    throw new OperationFailedError([
      AccountAssignmentCreationStatus.FailureReason,
    ]);
  }
};

type DeleteAccountAssignmentData = CreateAccountAssignmentData;
export const deleteAccountAssignment = async (
  data: DeleteAccountAssignmentData,
  instanceArn?: string | null
) => {
  const theInstanceArn =
    instanceArn ?? (await getIdentityInstanceOrThrow()).instanceArn;
  const { principalId, principalType, permissionSetArn, awsAccountId } = data;

  const { AccountAssignmentDeletionStatus } = await ssoAdmin.send(
    new DeleteAccountAssignmentCommand({
      InstanceArn: theInstanceArn,
      PermissionSetArn: permissionSetArn,
      PrincipalId: principalId,
      PrincipalType: principalType,
      TargetId: awsAccountId ?? (await getAccountId()),
      TargetType: 'AWS_ACCOUNT',
    })
  );

  if (AccountAssignmentDeletionStatus?.FailureReason) {
    throw new OperationFailedError([
      AccountAssignmentDeletionStatus.FailureReason,
    ]);
  }
};

export const describeAwsAccount = async (awsAccountId: string) => {
  const { Account } = await organizations.send(
    new DescribeAccountCommand({
      AccountId: awsAccountId,
    })
  );

  return {
    id: Account?.Id,
    arn: Account?.Arn,
    name: Account?.Name,
  };
};

export const describeGroup = async (
  groupId: string,
  identityStoreId?: string | null
) => {
  // const { identityStoreId } = await getIdentityInstanceOrThrow();
  const theIdentityStoreId =
    identityStoreId ?? (await getIdentityInstanceOrThrow()).identityStoreId;

  const { GroupId, DisplayName } = await identityStore.send(
    new DescribeGroupCommand({
      GroupId: groupId,
      IdentityStoreId: theIdentityStoreId,
    })
  );

  return {
    id: GroupId ?? '-',
    displayName: DisplayName ?? null,
    principalType: PrincipalType.GROUP,
  };
};

export const describeGroupsInMap = async (
  groupIds: string[],
  identityStoreId?: string | null
) => {
  const theIdentityStoreId =
    identityStoreId ?? (await getIdentityInstanceOrThrow()).identityStoreId;

  const describePromises = groupIds.map((groupId) => {
    return identityStore.send(
      new DescribeGroupCommand({
        GroupId: groupId,
        IdentityStoreId: theIdentityStoreId,
      })
    );
  });

  const groups = await Promise.all(describePromises);

  const result: Map<string, { id: string; displayName: string | null }> =
    new Map();

  groups.forEach((group) => {
    result.set(group.GroupId!, {
      id: group.GroupId ?? '-',
      displayName: group.DisplayName ?? null,
    });
  });

  return result;
};

export const describeUser = async (
  userId: string,
  identityStoreId?: string | null
) => {
  // const { identityStoreId } = await getIdentityInstanceOrThrow();
  const theIdentityStoreId =
    identityStoreId ?? (await getIdentityInstanceOrThrow()).identityStoreId;

  const { UserId, DisplayName, Emails, Name, UserName } =
    await identityStore.send(
      new DescribeUserCommand({
        UserId: userId,
        IdentityStoreId: theIdentityStoreId,
      })
    );

  const givenName = Name?.GivenName ?? '';
  const familyName = Name?.FamilyName ?? '';
  const middleName = Name?.MiddleName ?? '';

  return {
    id: UserId ?? '-',
    displayName: DisplayName ?? null,
    principalType: PrincipalType.USER,
    email: Emails?.[0]?.Value ?? null,
    name: givenName + ' ' + middleName + ' ' + familyName,
    username: UserName ?? '',
  };
};

export const createPrincipal = async ({
  displayName,
  type,
  username,
  familyName,
  givenName,
}: CreatePrincipalData) => {
  const { identityStoreId } = await getIdentityInstanceOrThrow();

  let id: string | undefined = undefined;
  const input = {
    DisplayName: displayName,
    IdentityStoreId: identityStoreId,
  };

  if (type === PrincipalType.GROUP) {
    const { GroupId } = await identityStore.send(new CreateGroupCommand(input));
    id = GroupId;
  } else {
    const { UserId } = await identityStore.send(
      new CreateUserCommand({
        ...input,
        UserName: username,
        Name: {
          FamilyName: familyName,
          GivenName: givenName,
        },
      })
    );
    id = UserId;
  }

  return {
    id,
  };
};

export const createGroupPrincipal = async (data: CreateGroupPrincipalData) => {
  const { identityStoreId } = await getIdentityInstanceOrThrow();

  const { GroupId } = await identityStore.send(
    new CreateGroupCommand({
      DisplayName: data.displayName,
      IdentityStoreId: identityStoreId,
      Description: data.description,
    })
  );

  return {
    id: GroupId,
  };
};

export const createUserPrincipal = async (data: CreateUserPrincipalData) => {
  const { identityStoreId } = await getIdentityInstanceOrThrow();

  const { UserId } = await identityStore.send(
    new CreateUserCommand({
      DisplayName: data.displayName,
      IdentityStoreId: identityStoreId,
      UserName: data.username,
      Name: {
        FamilyName: data.familyName,
        GivenName: data.givenName,
      },
    })
  );

  return {
    id: UserId,
  };
};

export const deletePrincipal = async ({ id, type }: DeletePrincipalData) => {
  const { identityStoreId } = await getIdentityInstanceOrThrow();
  const input = {
    IdentityStoreId: identityStoreId,
  };

  if (type === PrincipalType.GROUP) {
    await identityStore.send(
      new DeleteGroupCommand({
        ...input,
        GroupId: id,
      })
    );
  } else {
    await identityStore.send(
      new DeleteUserCommand({
        ...input,
        UserId: id,
      })
    );
  }
};

export const updatePrincipal = async ({
  id,
  displayName,
  type,
}: UpdatePrincipalData) => {
  const { identityStoreId } = await getIdentityInstanceOrThrow();
  const input = {
    IdentityStoreId: identityStoreId,
    Operations: [
      {
        AttributePath: 'DisplayName',
        AttributeValue: displayName,
      },
    ],
  };

  if (type === PrincipalType.GROUP) {
    await identityStore.send(
      new UpdateGroupCommand({
        GroupId: id,
        ...input,
      })
    );
  } else {
    await identityStore.send(
      new UpdateUserCommand({
        UserId: id,
        ...input,
      })
    );
  }
};

export const updatePrincipalGroup = async (data: UpdatePrincipalGroupData) => {
  const { identityStoreId } = await getIdentityInstanceOrThrow();
  const {
    id,
    displayName,
    description,
    membershipIdsToBeDeleted,
    userIdsToBeAdded,
  } = data;

  const updatePromise = identityStore.send(
    new UpdateGroupCommand({
      GroupId: id,
      IdentityStoreId: identityStoreId,
      Operations: [
        {
          AttributePath: 'DisplayName',
          AttributeValue: displayName,
        },
        {
          AttributePath: 'Description',
          AttributeValue: description,
        },
      ],
    })
  );

  const deleteMembershipPromises =
    membershipIdsToBeDeleted?.map((membershipId) => {
      return identityStore.send(
        new DeleteGroupMembershipCommand({
          IdentityStoreId: identityStoreId,
          MembershipId: membershipId,
        })
      );
    }) ?? [];

  const addMembershipPromises =
    userIdsToBeAdded?.map((userId) => {
      return identityStore.send(
        new CreateGroupMembershipCommand({
          GroupId: id,
          IdentityStoreId: identityStoreId,
          MemberId: {
            UserId: userId,
          },
        })
      );
    }) ?? [];

  await Promise.all([
    ...deleteMembershipPromises,
    ...addMembershipPromises,
    updatePromise,
  ]);

  return {
    id,
  };
};

export const updatePrincipalUser = async (data: UpdatePrincipalUserData) => {
  const { identityStoreId } = await getIdentityInstanceOrThrow();
  const {
    id,
    displayName,
    familyName,
    givenName,
    membershipIdsToBeDeleted,
    groupIdsToBeAdded,
  } = data;

  const updatePromise = identityStore.send(
    new UpdateUserCommand({
      UserId: id,
      IdentityStoreId: identityStoreId,
      Operations: [
        {
          AttributePath: 'displayName',
          AttributeValue: displayName,
        },
        {
          AttributePath: 'name',
          AttributeValue: {
            FamilyName: familyName,
            GivenName: givenName,
          },
        },
      ],
    })
  );

  const deleteMembershipPromises =
    membershipIdsToBeDeleted?.map((membershipId) => {
      return identityStore.send(
        new DeleteGroupMembershipCommand({
          IdentityStoreId: identityStoreId,
          MembershipId: membershipId,
        })
      );
    }) ?? [];

  const addMembershipPromises =
    groupIdsToBeAdded?.map((groupId) => {
      return identityStore.send(
        new CreateGroupMembershipCommand({
          GroupId: groupId,
          IdentityStoreId: identityStoreId,
          MemberId: {
            UserId: id,
          },
        })
      );
    }) ?? [];

  await Promise.all([
    ...deleteMembershipPromises,
    ...addMembershipPromises,
    updatePromise,
  ]);

  return {
    id,
  };
};

export const describePrincipal = async (id: string, type: PrincipalType) => {
  if (type === PrincipalType.GROUP) {
    return describeGroup(id);
  }

  return describeUser(id);
};

export const getAwsAccountsAndPrincipalsMap = async () => {
  const [awsAccountsMap, principalsMap] = await Promise.all([
    listAccountsInMap(),
    listPrincipalsInMap(),
  ]);

  return { awsAccountsMap, principalsMap };
};

export const getAwsAccountsPrincipalsPermissionSetsMap = async (
  opts?: { identityStoreId?: string | null; instanceArn?: string | null } | null
) => {
  const [awsAccountsMap, principalsMap, permissionSetsMap] = await Promise.all([
    listAccountsInMap(),
    listPrincipalsInMap(opts?.identityStoreId),
    describeAllPermissionSetsInMap(opts?.instanceArn),
  ]);

  return { awsAccountsMap, principalsMap, permissionSetsMap };
};

export const getPrincipalsPermissionSetsMap = async () => {
  const [principalsMap, permissionSetsMap] = await Promise.all([
    listPrincipalsInMap(),
    describeAllPermissionSetsInMap(),
  ]);

  return { principalsMap, permissionSetsMap };
};
