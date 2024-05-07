import { PrincipalType } from '@prisma/client';
import { describePermissionSetsInPrincipal } from '../helper';

export const listMyPermissionSetsService = async (
  principalId: string,
  principalType: PrincipalType
) => {
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
