import { db } from '../../db';
import { UserNotFoundError } from '../errors';

import bcrypt from 'bcrypt';
import { ResetAccountUserPasswordData } from '../validations';
import { IJwtPayload } from '../../__shared__/interfaces';
import { createLog } from '../../__shared__/utils';

export const resetAccountUserPasswordService = async (
  data: ResetAccountUserPasswordData,
  currentUser?: IJwtPayload
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

  const logMessage = `${currentUser?.name} mereset password akun dengan username: ${user.username}`;

  await createLog(logMessage);
};
