import { Role } from '@prisma/client';
import { db } from '../../db';
import {
  listAccountsInMap,
  listPrincipalsInMap,
} from '../../aws-identity/helper';
import { PrincipalAwsAccountUserDetail } from '../types';

export const listAccountUsersService = async () => {
  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      principalAwsAccountUsers: {
        select: {
          id: true,
          awsAccountId: true,
          principalId: true,
          principalType: true,
        },
      },
    },
    where: {
      role: Role.USER,
    },
  });

  if (users.length === 0) {
    return { users };
  }

  const [principals, awsAccounts] = await Promise.all([
    listPrincipalsInMap(),
    listAccountsInMap(),
  ]);

  const result = users.map(({ principalAwsAccountUsers, ...rest }) => {
    const principalAwsAccountUserDetails: PrincipalAwsAccountUserDetail[] = [];

    if (principalAwsAccountUsers.length === 0)
      return { ...rest, principalAwsAccountUsers: [] };

    principalAwsAccountUsers.forEach(
      ({ awsAccountId, principalId, ...rest }) => {
        const principal = principals.get(principalId);
        const awsAccount = awsAccounts.get(awsAccountId);

        if (!principal || !awsAccount) {
          return;
        }

        principalAwsAccountUserDetails.push({
          ...rest,
          principalId,
          awsAccountId,
          awsAccountName: awsAccount.name,
          principalDisplayName: principal.displayName ?? '',
        });
      }
    );

    return {
      ...rest,
      principalAwsAccountUsers: principalAwsAccountUserDetails,
    };
  });

  return { result };
};
