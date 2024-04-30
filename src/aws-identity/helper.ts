import {
  SSOAdminClient,
  ListInstancesCommand,
  InstanceMetadata,
  ListAccountAssignmentsForPrincipalCommand,
  AccountAssignmentForPrincipal,
  DescribePermissionSetCommand,
  CreateAccountAssignmentCommand,
  ListPermissionSetsCommand,
  DeleteAccountAssignmentCommand,
} from '@aws-sdk/client-sso-admin';
import { config } from '../__shared__/config';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import {
  Group,
  IdentitystoreClient,
  ListGroupsCommand,
  ListUsersCommand,
  User,
} from '@aws-sdk/client-identitystore';
import {
  IdentityInstanceNotFoundError,
  OperationFailedError,
  PermissionSetNotFoundError,
} from './errors';
import { db } from '../db';
import { PrincipalType } from '@prisma/client';

const credentials = {
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
};

export const ssoAdmin = new SSOAdminClient({
  credentials,
});

export const sts = new STSClient({ credentials });

export const identityStore = new IdentitystoreClient({ credentials });

export const getAccountId = async () => {
  const { Account } = await sts.send(new GetCallerIdentityCommand({}));
  return Account;
};

export const getIdentityInstanceOrThrow = async () => {
  const res = await db.identityInstance.findFirst({});
  if (!res) {
    throw new IdentityInstanceNotFoundError();
  }

  return res;
};

export const listAccountAssignmentsforPrincipal = async (
  principalId: string,
  principalType: 'USER' | 'GROUP' = 'GROUP'
) => {
  const identityInstance = await getIdentityInstanceOrThrow();

  let accountAssignments: AccountAssignmentForPrincipal[] = [];

  const { instanceArn } = identityInstance;

  const { AccountAssignments, NextToken } = await ssoAdmin.send(
    new ListAccountAssignmentsForPrincipalCommand({
      InstanceArn: instanceArn,
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
        InstanceArn: instanceArn,
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

  return accountAssignments.map((assgn) => ({
    accountId: assgn.AccountId ?? null,
    permissionSetArn: assgn.PermissionSetArn ?? null,
    principalId: assgn.PrincipalId ?? '-',
    principalType: assgn.PrincipalType ?? null,
  }));
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

export const listGroups = async () => {
  const { identityStoreId } = await getIdentityInstanceOrThrow();

  let groups: Group[] = [];
  const { Groups, NextToken } = await identityStore.send(
    new ListGroupsCommand({
      IdentityStoreId: identityStoreId,
      MaxResults: 99,
    })
  );

  console.log('GROUPS 1: ', Groups);

  if (!Groups || Groups.length === 0) return [];
  let nextToken: string | undefined = undefined;
  nextToken = NextToken;

  groups.push(...Groups);

  while (nextToken) {
    console.log('HELLO 1');
    const { Groups, NextToken } = await identityStore.send(
      new ListGroupsCommand({
        IdentityStoreId: identityStoreId,
        NextToken: nextToken,
      })
    );
    if (!Groups || Groups.length === 0) break;
    nextToken = NextToken;
    groups.push(...Groups);
  }

  return groups.map((group) => ({
    id: group.GroupId ?? '-',
    displayName: group.DisplayName ?? null,
    description: group.Description ?? null,
    identityStoreId: group.IdentityStoreId ?? null,
    principalType: PrincipalType.GROUP,
  }));
};

export const listUsers = async () => {
  const { identityStoreId } = await getIdentityInstanceOrThrow();

  let users: User[] = [];
  const { Users, NextToken } = await identityStore.send(
    new ListUsersCommand({
      IdentityStoreId: identityStoreId,
    })
  );

  if (!Users || Users.length === 0) return [];
  let nextToken: string | undefined = undefined;
  nextToken = NextToken;

  users.push(...Users);

  while (nextToken) {
    const { Users, NextToken } = await identityStore.send(
      new ListUsersCommand({
        IdentityStoreId: identityStoreId,
        NextToken: nextToken,
      })
    );
    if (!Users || Users.length === 0) break;
    nextToken = NextToken;
    users.push(...Users);
  }

  return users.map((user) => ({
    id: user.UserId ?? '-',
    displayName: user.DisplayName ?? null,
    name: user.Name ?? null,
    identityStoreId: user.IdentityStoreId ?? null,
    emails: user.Emails?.map((email) => email.Value).filter(Boolean) ?? [],
    username: user.UserName ?? null,
    principalType: PrincipalType.USER,
  }));
};

export const listPrincipals = async () => {
  const groups = await listGroups();
  const users = await listUsers();
  return [...groups, ...users];
};

export const listPermissionSets = async () => {
  const { instanceArn } = await getIdentityInstanceOrThrow();

  const { PermissionSets, NextToken } = await ssoAdmin.send(
    new ListPermissionSetsCommand({
      InstanceArn: instanceArn,
    })
  );

  if (!PermissionSets || PermissionSets.length === 0) return [];
  const permissionSets: string[] = [];
  let nextToken = NextToken;

  permissionSets.push(...PermissionSets);

  while (nextToken) {
    const { PermissionSets, NextToken } = await ssoAdmin.send(
      new ListPermissionSetsCommand({
        InstanceArn: instanceArn,
        NextToken: nextToken,
      })
    );
    if (!PermissionSets || PermissionSets.length === 0) break;
    nextToken = NextToken;
    permissionSets.push(...PermissionSets);
  }

  return permissionSets;
};

export const describePermissionSet = async (permissionSetArn: string) => {
  const { instanceArn } = await getIdentityInstanceOrThrow();

  const { PermissionSet } = await ssoAdmin.send(
    new DescribePermissionSetCommand({
      InstanceArn: instanceArn,
      PermissionSetArn: permissionSetArn,
    })
  );

  if (!PermissionSet) throw new PermissionSetNotFoundError();

  return {
    name: PermissionSet.Name ?? null,
    description: PermissionSet.Description ?? null,
    createdDate: PermissionSet.CreatedDate ?? null,
    permissionSetArn: PermissionSet.PermissionSetArn ?? null,
    sessionDuration: PermissionSet.SessionDuration ?? null,
    relayState: PermissionSet.RelayState ?? null,
  };
};

export const describeAllPermissionSets = async () => {
  const permissionSets = await listPermissionSets();

  const describePermissionSetsPromises = permissionSets.map((permissionSet) =>
    describePermissionSet(permissionSet)
  );

  return Promise.all(describePermissionSetsPromises);
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
}[];

export const listAccountAssignments = async () => {
  // const principals = await listGroups();
  const principals = await listPrincipals();
  const principalsMap: Record<string, ReturnedPrincipal> = {};
  principals.forEach((principal) => {
    principalsMap[principal.id] = principal;
  });

  const data: Data = [];

  const accountAssignmentsPromises = principals.map((principal) =>
    listAccountAssignmentsforPrincipal(principal.id, principal.principalType)
  );

  const accountAssignments = await Promise.all(accountAssignmentsPromises);

  const uniquePermissionSetArns = new Set<string>();

  accountAssignments.forEach((assgs, idx) => {
    const principalId = principals[idx].id;
    const assignment = assgs.filter((assg) => assg.principalId === principalId);
    const permissionSetArns = assignment.map(
      ({ permissionSetArn }) => permissionSetArn
    );
    const filteredPermissionSetArns = permissionSetArns.filter(
      Boolean
    ) as string[];

    filteredPermissionSetArns.forEach((permissionSetArn) => {
      uniquePermissionSetArns.add(permissionSetArn);
    });

    if (assignment.length > 0) {
      // const principalId: string = assignment[0].principalId;

      data.push({
        principalId,
        principalType: assignment[0].principalType as PrincipalType,
        permissionSetArns: filteredPermissionSetArns,
        permissionSets: [],
        principalDisplayName: principalsMap[principalId].displayName ?? null,
      });
    }
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
  principalType: 'USER' | 'GROUP';
};

export const createAccountAssignment = async (
  data: CreateAccountAssignmentData
) => {
  const { instanceArn } = await getIdentityInstanceOrThrow();
  const { principalId, principalType, permissionSetArn } = data;

  const { AccountAssignmentCreationStatus } = await ssoAdmin.send(
    new CreateAccountAssignmentCommand({
      InstanceArn: instanceArn,
      PermissionSetArn: permissionSetArn,
      PrincipalId: principalId,
      PrincipalType: principalType,
      TargetId: await getAccountId(),
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
  data: DeleteAccountAssignmentData
) => {
  const { instanceArn } = await getIdentityInstanceOrThrow();
  const { principalId, principalType, permissionSetArn } = data;

  const { AccountAssignmentDeletionStatus } = await ssoAdmin.send(
    new DeleteAccountAssignmentCommand({
      InstanceArn: instanceArn,
      PermissionSetArn: permissionSetArn,
      PrincipalId: principalId,
      PrincipalType: principalType,
      TargetId: await getAccountId(),
      TargetType: 'AWS_ACCOUNT',
    })
  );

  if (AccountAssignmentDeletionStatus?.FailureReason) {
    throw new OperationFailedError([
      AccountAssignmentDeletionStatus.FailureReason,
    ]);
  }
};
