import { db } from '../../db';
import { DeleteUsersData } from '../validations';

export const deleteUsersService = async ({ ids }: DeleteUsersData) => {
  await db.user.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
};
