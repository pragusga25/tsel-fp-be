import { db } from '../../db';
import { UsernameTakenError } from '../errors';
import { RegisterData } from '../validations';
import bcrypt from 'bcrypt';

export const registerService = async (data: RegisterData) => {
  const { username, password } = data;

  const usernameTaken = await db.user.findUnique({
    where: { username },
  });

  if (usernameTaken) {
    throw new UsernameTakenError();
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await db.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: { id: true },
  });

  return { result };
};
