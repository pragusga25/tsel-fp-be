import { Role } from '@prisma/client';
import { describeUser } from '../../aws-identity/helper';
import { db } from '../../db';
import { CreateAccountAdminBulkData } from '../validations';
import bcrypt from 'bcrypt';
import { IJwtPayload } from '../../__shared__/interfaces';
import { createLog } from '../../__shared__/utils';

export const createAccountAdminBulkService = async (
  data: CreateAccountAdminBulkData,
  currentUser?: IJwtPayload
) => {
  const { principalUserIds } = data;

  const principalUsersPromise = principalUserIds.map((principalUserId) =>
    describeUser(principalUserId)
  );

  if (principalUserIds.length === 0) return;

  const principalUsers = await Promise.all(principalUsersPromise);

  const alreadAdmins = await db.user.findMany({
    where: {
      role: Role.ADMIN,
      username: {
        in: principalUsers.map((principalUser) => principalUser.username),
      },
    },
  });

  if (principalUsers.length === alreadAdmins.length) return;

  const alreadyAdminsUsernames = alreadAdmins.map((admin) => admin.username);
  const alreadyAdminsUsernamesSet = new Set(alreadyAdminsUsernames);

  const filteredPrincipalUsers = principalUsers.filter(
    (principalUser) => !alreadyAdminsUsernamesSet.has(principalUser.username)
  );

  const passwordMap = new Map<string, string>();

  const hashPasswordPromises = filteredPrincipalUsers.map((principalUser) => {
    return bcrypt.hash(principalUser.username + 'tsel889900!', 12);
  });

  const hashedPasswords = await Promise.all(hashPasswordPromises);

  for (let i = 0; i < filteredPrincipalUsers.length; i++) {
    passwordMap.set(filteredPrincipalUsers[i].username, hashedPasswords[i]);
  }

  let logMessage = `${currentUser?.name} membuat akun admin baru dengan username: `;

  for (let i = 0; i < filteredPrincipalUsers.length; i++) {
    const principalUser = filteredPrincipalUsers[i];
    const principalUserId = principalUser.id;

    logMessage += principalUser.username;
    if (i < filteredPrincipalUsers.length - 1) logMessage += ', ';

    const { name, email, username } = principalUser;
    await db.user.upsert({
      create: {
        username,
        email,
        name,
        role: Role.ADMIN,
        password: passwordMap.get(username)!,
        principalUserId,
      },
      update: {
        role: Role.ADMIN,
        principalUserId,
      },
      where: {
        username,
      },
    });
  }

  await createLog(logMessage);
};
