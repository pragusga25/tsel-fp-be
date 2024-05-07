import { db } from '../../db';
import { UserNotFoundError, UserPasswordIncorrectError } from '../errors';
import { UpdateUserPasswordData } from '../validations';
import bcrypt from 'bcrypt';

export const updateUserPasswordService = async (
  data: UpdateUserPasswordData
) => {
  const user = await db.user.findUnique({
    where: {
      id: data.userId,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  const isValidPassword = await bcrypt.compare(data.oldPassword, user.password);

  if (!isValidPassword) {
    throw new UserPasswordIncorrectError();
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 12);

  await db.user.update({
    where: {
      id: data.userId,
    },
    data: {
      password: hashedPassword,
    },
  });
};
