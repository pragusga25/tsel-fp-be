import { Role } from '@prisma/client';
import { db } from '../../db';
import { CreateAccountUserData } from '../validations';
import bcrypt from 'bcrypt';

export const createAccountUserService = async (data: CreateAccountUserData) => {
  const { principalAwsAccountUsers, password, ...rest } = data;
  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await db.user.create({
    data: {
      ...rest,
      password: hashedPassword,
      role: Role.USER,
      principalAwsAccountUsers: {
        createMany: {
          data: principalAwsAccountUsers,
        },
      },
    },
    select: { id: true },
  });

  return { result };
};
