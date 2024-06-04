import { Role } from '@prisma/client';
import { listUsers } from '../../aws-identity/helper';
import { db } from '../../db';
import bcrypt from 'bcrypt';

export const synchronizeAccountUserService = async () => {
  const principalUsers = await listUsers();
  const awsPrincipalUserIds = principalUsers.map((user) => user.id);

  const usersDb = await db.user.findMany({
    where: {
      principalUserId: {
        in: awsPrincipalUserIds,
      },
    },
    select: {
      id: true,
      principalUserId: true,
    },
  });

  const dbPrincipalUserIdsSet = new Set(
    usersDb.map((user) => user.principalUserId)
  );

  const principalUsersNotInDb = principalUsers.filter(
    (user) => !dbPrincipalUserIdsSet.has(user.id)
  );

  const principalUsersInDb = principalUsers.filter((user) =>
    dbPrincipalUserIdsSet.has(user.id)
  );

  const updatePromises = principalUsersInDb.map((user) =>
    db.user.update({
      where: { id: user.id },
      data: {
        name: user.name?.givenName + ' ' + user.name?.familyName,
        username: user.username!,
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
        password: bcrypt.hashSync(user.username!, 12),
        principalUserId: user.id,
        role: Role.USER,
      })),
    }),
    ...updatePromises,
  ]);
};
