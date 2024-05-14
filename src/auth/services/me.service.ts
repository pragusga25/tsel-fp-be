import { db } from '../../db';

export const meService = async (userId: string) => {
  const result = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      name: true,
      principalId: true,
      principalType: true,
      principalDisplayName: true,
      role: true,
    },
  });

  return { result };
};
