import { describeDetailPrincipalAwsAccounts } from '../helper';
import { db } from '../../db';

export const listMyPermissionSetsService = async (userId: string) => {
  const principalAwsAccount = await db.principalAwsAccountUser.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      principalId: true,
      principalType: true,
      awsAccountId: true,
    },
  });

  const result = await describeDetailPrincipalAwsAccounts(principalAwsAccount);

  return { result };
};
