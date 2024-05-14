import { describePermissionSetsInPrincipal } from '../helper';
import { db } from '../../db';
import { OperationFailedError } from '../errors';

export const listMyPermissionSetsService = async (userId: string) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      principalId: true,
      principalType: true,
    },
  });

  if (!user) {
    throw new OperationFailedError(['User not found']);
  }

  if (!user.principalId || !user.principalType) {
    throw new OperationFailedError(['Principal not found']);
  }

  const { principalId, principalType } = user;
  const result = await describePermissionSetsInPrincipal(
    principalId,
    principalType
  );

  return {
    result: result.map((r) => ({
      arn: r.permissionSetArn,
      name: r.name,
    })),
  };
};
