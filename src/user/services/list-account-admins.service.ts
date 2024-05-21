import { Role } from '@prisma/client';
import { db } from '../../db';

export const listAccountAdminsService = async () => {
  const result = await db.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      createdAt: true,
    },
    where: {
      role: Role.ADMIN,
    },
  });

  return { result };
};
