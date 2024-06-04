import { db } from '../../db';
import { UpdateAccountUserData } from '../validations';

export const updateAccountUserService = async (data: UpdateAccountUserData) => {
  const { id } = data;

  await db.$transaction(async (trx) => {
    await trx.user.update({
      where: { id: id },
      data,
      select: { id: true },
    });
  });
};
