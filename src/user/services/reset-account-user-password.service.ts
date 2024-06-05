import { db } from '../../db';
import { UserNotFoundError } from '../errors';

import bcrypt from 'bcrypt';
import { ResetAccountUserPasswordData } from '../validations';

export const resetAccountUserPasswordService = async (
  data: ResetAccountUserPasswordData
) => {
  const { userId } = data;
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  const hashedPassword = await bcrypt.hash(user.username + 'tsel889900!', 12);

  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });
};
