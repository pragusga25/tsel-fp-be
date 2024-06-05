import { Role } from '@prisma/client';
import { describeUser } from '../../aws-identity/helper';
import { db } from '../../db';
import { CreateAccountAdminBulkData } from '../validations';
import bcrypt from 'bcrypt';

export const createAccountAdminBulkService = async (
  data: CreateAccountAdminBulkData
) => {
  const { principalUserIds } = data;

  const principalUsersPromise = principalUserIds.map((principalUserId) =>
    describeUser(principalUserId)
  );

  const principalUsers = await Promise.all(principalUsersPromise);

  if (principalUsers.length === 0) return;

  const passwordMap = new Map<string, string>();

  const hashPasswordPromises = principalUsers.map((principalUser) => {
    return bcrypt.hash(principalUser.username + 'tsel889900!', 12);
  });

  const hashedPasswords = await Promise.all(hashPasswordPromises);

  for (let i = 0; i < principalUsers.length; i++) {
    passwordMap.set(principalUsers[i].username, hashedPasswords[i]);
  }

  for (let i = 0; i < principalUsers.length; i++) {
    const principalUser = principalUsers[i];

    const { name, email, username } = principalUser;
    await db.user.upsert({
      create: {
        username,
        email,
        name,
        role: Role.ADMIN,
        password: passwordMap.get(username)!,
      },
      update: {},
      where: {
        username_role: {
          username,
          role: Role.ADMIN,
        },
      },
    });
  }
};
