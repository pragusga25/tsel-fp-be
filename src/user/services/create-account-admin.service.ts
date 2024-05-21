import { Role } from '@prisma/client';
import { db } from '../../db';
import { CreateAccountAdminData } from '../validations';
import bcrypt from 'bcrypt';

export const createAccountAdminService = async (
  data: CreateAccountAdminData
) => {
  const { password, ...rest } = data;
  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await db.user.create({
    data: {
      ...rest,
      password: hashedPassword,
      role: Role.ADMIN,
    },
    select: { id: true },
  });

  return { result };
};
