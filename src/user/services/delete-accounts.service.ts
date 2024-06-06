import { IJwtPayload } from '../../__shared__/interfaces';
import { createLog } from '../../__shared__/utils';
import { db } from '../../db';
import { DeleteAccountsData } from '../validations';

export const deleteAccountsService = async (
  { ids }: DeleteAccountsData,
  currentUser?: IJwtPayload
) => {
  const userDeleted = await db.user.delete({
    where: {
      id: ids[0],
    },
  });

  const logMessage = `${currentUser?.name} menghapus akun dengan username: ${userDeleted.username}`;
  await createLog(logMessage);
};
