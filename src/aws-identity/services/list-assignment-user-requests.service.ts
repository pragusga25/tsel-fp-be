import { Role } from '@prisma/client';
import { IJwtPayload } from '../../__shared__/interfaces';
import { db } from '../../db';
import { describeAllPermissionSetsInMap, listAccountsInMap } from '../helper';

export const listAssignmentUserRequestsService = async (
  currentUser: IJwtPayload
) => {
  const { id, role } = currentUser;

  const data = await db.assignmentUserRequest.findMany({
    where: {
      requesterId: role === Role.USER ? id : undefined,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      requester: {
        select: {
          name: true,
        },
      },
      responder: {
        select: {
          name: true,
        },
      },
    },
  });

  const pss = await describeAllPermissionSetsInMap();
  const awsAcc = await listAccountsInMap();

  const result = data.map(
    ({ permissionSetArn, awsAccountId, responderId, requesterId, ...rest }) => {
      const permissionSetName = pss.get(permissionSetArn)?.name;
      const awsAccountName = awsAcc.get(awsAccountId)?.name;

      return {
        ...rest,
        permissionSetName,
        awsAccountName,
      };
    }
  );

  // result.sort((a, b) => {
  //   if (a.status === 'PENDING') return -1;
  //   if (b.status === 'PENDING') return 1;
  //   return 0;
  // });

  return { result };
};
