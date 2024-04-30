import { db } from '../../db';

export const listUsersService = async () => {
  const result = await db.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      principalId: true,
      principalType: true,
    },
  });

  return { result };
};
