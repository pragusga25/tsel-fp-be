import { db } from '../../db';
import { DeleteAccountsData } from '../validations';

export const deleteAccountsService = async ({ ids }: DeleteAccountsData) => {
  await db.user.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
};
