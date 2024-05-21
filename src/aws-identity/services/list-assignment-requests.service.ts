import { AssignmentRequestStatus } from '@prisma/client';
import { db } from '../../db';
import { getAwsAccountsPrincipalsPermissionSetsMap } from '../helper';

export const listAssignmentRequestsService = async () => {
  const assgReqs = await db.assignmentRequest.findMany({
    select: {
      id: true,
      status: true,
      requestedAt: true,
      note: true,
      operation: true,
      principalId: true,
      principalType: true,
      permissionSetArns: true,
      awsAccountId: true,
      requester: {
        select: {
          name: true,
          username: true,
        },
      },
      responder: {
        select: {
          name: true,
          username: true,
        },
      },
      respondedAt: true,
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

  const pendingData = result.filter(
    (x) => x.status === AssignmentRequestStatus.PENDING
  );
  const notPendingData = result.filter(
    (x) => x.status !== AssignmentRequestStatus.PENDING
  );

  return { result: [...pendingData, ...notPendingData] };
};
