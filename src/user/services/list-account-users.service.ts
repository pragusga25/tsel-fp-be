import { Role } from '@prisma/client';
import { db } from '../../db';
import { listUsersInMap } from '../../aws-identity/helper';

export const listAccountUsersService = async () => {
  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      email: true,
      principalUserId: true,
    },
    where: {
      role: Role.USER,
    },
    orderBy: {
      name: 'asc',
    },
  });

  if (users.length === 0) {
    return { users };
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
