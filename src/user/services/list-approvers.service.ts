import { listUsersInMap } from '../../aws-identity/helper';
import { db } from '../../db';

export const listApproversService = async () => {
  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      email: true,
      principalUserId: true,
      isRoot: true,
    },
    where: {
      isApprover: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  if (users.length === 0) {
    return { result: [] };
  }

  const [principalUsers] = await Promise.all([listUsersInMap()]);

  const result = users.map(({ principalUserId, ...rest }) => {
    const principalUser = principalUserId
      ? principalUsers.get(principalUserId)
      : null;

    return {
      ...rest,
      principalDisplayName: principalUser?.displayName,
      principalId: principalUser?.id,
    };
  });

  return { result };
};
