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
  ListAccountAssignmentsCommand,
} from '@aws-sdk/client-sso-admin';
import { config } from '../__shared__/config';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import {
  OrganizationsClient,
  ListAccountsCommand,
  Account,
} from '@aws-sdk/client-organizations';
import {
  CreateGroupCommand,
  CreateUserCommand,
  DeleteGroupCommand,
  DeleteUserCommand,
  DescribeGroupCommand,
  DescribeUserCommand,
  Group,
  IdentitystoreClient,
  ListGroupsCommand,
  ListUsersCommand,
  UpdateGroupCommand,
  UpdateUserCommand,
  User,
} from '@aws-sdk/client-identitystore';
import {
  IdentityInstanceNotFoundError,
  OperationFailedError,
  PermissionSetNotFoundError,
} from './errors';
import { db } from '../db';
import { PrincipalType } from '@prisma/client';
import {
  CreateGroupPrincipalData,
  CreatePrincipalData,
  CreateUserPrincipalData,
  DeletePrincipalData,
  UpdatePrincipalData,
  UpdatePrincipalGroupData,
  UpdatePrincipalUserData,
} from './validations';

const credentials = {
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  sessionToken: config.AWS_SESSION_TOKEN,
};

export const ssoAdmin = new SSOAdminClient({
  credentials,
});

export const sts = new STSClient({ credentials });

export const identityStore = new IdentitystoreClient({ credentials });

export const organizations = new OrganizationsClient({ credentials });

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
      id: acc.Id,
      name: acc.Name,
    };
  });
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

export const describePermissionSetsInPrincipal = async (
  principalId: string,
  principalType: 'USER' | 'GROUP' = 'GROUP'
) => {
  const accountAssignments = await listAccountAssignmentsforPrincipal(
    principalId,
    principalType
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

export const listGroups = async () => {
  const { identityStoreId } = await getIdentityInstanceOrThrow();

  let groups: Group[] = [];
  const { Groups, NextToken } = await identityStore.send(
    new ListGroupsCommand({
      IdentityStoreId: identityStoreId,
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

export const detachAllPermissionSetsFromPrincipal = async (
  principalId: string,
  principalType: PrincipalType
) => {
  const accountAssignments = await listAccountAssignmentsforPrincipal(
    principalId,
    principalType
  );

  console.log('accountAssignments: ', accountAssignments);

  const permissionSetArns = accountAssignments.map(
    (assg) => assg.permissionSetArn
  ) as string[];

  const detachPromises = permissionSetArns.map((permissionSetArn) =>
    deleteAccountAssignment({
      permissionSetArn,
      principalId,
      principalType,
    })
  );

  await Promise.all(detachPromises);
};

export const listAccountAssignmentsv0 = async () => {
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

export const describeGroup = async (groupId: string) => {
  const { identityStoreId } = await getIdentityInstanceOrThrow();

  const { GroupId, DisplayName } = await identityStore.send(
    new DescribeGroupCommand({
      GroupId: groupId,
      IdentityStoreId: identityStoreId,
    })
  );

  return {
    id: GroupId ?? '-',
    displayName: DisplayName ?? null,
    principalType: PrincipalType.GROUP,
  };
};

export const describeUser = async (userId: string) => {
  const { identityStoreId } = await getIdentityInstanceOrThrow();

  const { UserId, DisplayName } = await identityStore.send(
    new DescribeUserCommand({
      UserId: userId,
      IdentityStoreId: identityStoreId,
    })
  );

  return {
    id: UserId ?? '-',
    displayName: DisplayName ?? null,
    principalType: PrincipalType.USER,
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
  const { id, displayName, description } = data;

  await identityStore.send(
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

  return {
    id,
  };
};

export const updatePrincipalUser = async (data: UpdatePrincipalUserData) => {
  const { identityStoreId } = await getIdentityInstanceOrThrow();
  const { id, displayName, familyName, givenName } = data;

  await identityStore.send(
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
