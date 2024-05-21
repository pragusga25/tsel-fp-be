import { db } from '../../db';
import { UpdateAccountUserData } from '../validations';

export const updateAccountUserService = async (data: UpdateAccountUserData) => {
  const {
    id,
    name,
    principalAwsAccountsToBeAdded,
    principalAwsAccountUserIdsToBeDeleted,
    username,
  } = data;

  await db.$transaction(async (trx) => {
    await trx.user.update({
      where: { id: id },
      data: {
        name,
        username,
      },
      select: { id: true },
    });

    if (principalAwsAccountsToBeAdded) {
      await trx.principalAwsAccountUser.createMany({
        data: principalAwsAccountsToBeAdded.map((paa) => ({
          userId: id,
          ...paa,
        })),
      });
    }

    if (principalAwsAccountUserIdsToBeDeleted) {
      await trx.principalAwsAccountUser.deleteMany({
        where: {
          userId: id,
          id: {
            in: principalAwsAccountUserIdsToBeDeleted,
          },
        },
      });
    }
  });
};
