import { getUserMemberships } from '../../aws-identity/helper';
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
      email: true,
      principalUserId: true,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  const { principalUserId, ...rest } = user;
  const memberships = principalUserId
    ? await getUserMemberships(principalUserId)
    : [];

  return {
    result: {
      ...rest,
      memberships,
      principalUserId,
    },
  };
};
