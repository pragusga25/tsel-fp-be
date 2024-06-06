import { Role } from '@prisma/client';
import { listUsers } from '../../aws-identity/helper';
import { db } from '../../db';
import bcrypt from 'bcrypt';
import { IJwtPayload } from '../../__shared__/interfaces';
import { createLog } from '../../__shared__/utils';

export const synchronizeAccountUserService = async (
  currentUser?: IJwtPayload
) => {
  const principalUsers = await listUsers();
  const awsPrincipalUserUsername = principalUsers.map(
    (user) => user.username
  ) as string[];

  const usersDb = await db.user.findMany({
    where: {
      username: {
        in: awsPrincipalUserUsername,
      },
    },
    select: {
      id: true,
      username: true,
    },
  });

  const dbPrincipalUsernamesSet = new Set(usersDb.map((user) => user.username));

  const principalUsersNotInDb = principalUsers.filter(
    (user) => !dbPrincipalUsernamesSet.has(user.username!)
  );

  const principalUsersInDb = principalUsers.filter((user) =>
    dbPrincipalUsernamesSet.has(user.username!)
  );

  const updatePromises = principalUsersInDb.map((user) =>
    db.user.update({
      where: { username: user.username! },
      data: {
        name: user.name?.givenName + ' ' + user.name?.familyName,
        email: user.emails[0],
      },
    })
  );

  await Promise.all([
    db.user.createMany({
      data: principalUsersNotInDb.map((user) => ({
        name: user.name?.givenName + ' ' + user.name?.familyName,
        username: user.username!,
        email: user.emails[0],
        password: bcrypt.hashSync(user.username! + 'tsel889900!', 12),
        principalUserId: user.id,
        role: Role.USER,
      })),
    }),
    ...updatePromises,
  ]);

  const newLen = principalUsersNotInDb.length;
  const updateLen = updatePromises.length;
  const logMessage = `${currentUser?.name} melakukan synkronisasi akun dengan role user. Terdapat ${newLen} akun baru dan ${updateLen} akun yang diperbarui`;

  await createLog(logMessage);
};
