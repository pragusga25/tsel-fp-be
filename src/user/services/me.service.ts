import { describeDetailPrincipalAwsAccounts } from '../../aws-identity/helper';
import { db } from '../../db';
import { UserNotFoundError } from '../errors';

export const meService = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      principalAwsAccountUsers: {
        select: {
          id: true,
          awsAccountId: true,
          principalId: true,
          principalType: true,
        },
      },
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  const { principalAwsAccountUsers, ...rest } = user;

  if (principalAwsAccountUsers.length === 0)
    return { result: { ...rest, principalAwsAccountUsers: [] } };

  const detailsPrincipalAwsAccounts = await describeDetailPrincipalAwsAccounts(
    user.principalAwsAccountUsers
  );

  return {
    result: {
      ...rest,
      principalAwsAccountUsers: detailsPrincipalAwsAccounts,
    },
  };
};
