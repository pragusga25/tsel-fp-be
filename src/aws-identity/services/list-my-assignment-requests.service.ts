import { db } from '../../db';
import { getAwsAccountsPrincipalsPermissionSetsMap } from '../helper';

export const listMyAssignmentRequestsService = async (userId: string) => {
  const assgReqs = await db.assignmentRequest.findMany({
    select: {
      id: true,
      status: true,
      requestedAt: true,
      note: true,
      operation: true,
      permissionSetArns: true,
      responder: {
        select: {
          name: true,
          username: true,
        },
      },
      respondedAt: true,
      awsAccountId: true,
      principalId: true,
      principalType: true,
    },
    where: {
      requesterId: userId,
    },
    orderBy: {
      requestedAt: 'desc',
    },
  });

  if (assgReqs.length === 0) {
    return { result: [] };
  }

  const { awsAccountsMap, principalsMap, permissionSetsMap } =
    await getAwsAccountsPrincipalsPermissionSetsMap();

  let result = assgReqs.map(({ permissionSetArns, ...rest }) => {
    const { awsAccountId, principalId } = rest;

    const awsAccount = awsAccountsMap.get(awsAccountId);
    const principal = principalsMap.get(principalId);
    let permissionSets = permissionSetArns.map((arn) => {
      const detail = permissionSetsMap.get(arn);

      return {
        arn,
        name: detail?.name,
      };
    });

    permissionSets = permissionSets.filter((ps) => ps.name);

    return {
      ...rest,
      permissionSets,
      awsAccountName: awsAccount?.name,
      principalDisplayName: principal?.displayName,
    };
  });

  result = result.filter(
    (r) =>
      r.awsAccountName && r.principalDisplayName && r.permissionSets.length > 0
  );

  return { result };
};
