import { describeUser } from '../../aws-identity/helper';
import { db } from '../../db';
import { CreateApproversData } from '../validations';
import { IJwtPayload } from '../../__shared__/interfaces';
import { createLog } from '../../__shared__/utils';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';

export const createApproversService = async (
  data: CreateApproversData,
  currentUser?: IJwtPayload
) => {
  const { principalUserIds } = data;

  if (principalUserIds.length === 0) return;

  const principalUsersPromise = principalUserIds.map((principalUserId) =>
    describeUser(principalUserId)
  );

  const principalUsers = await Promise.all(principalUsersPromise);
  const principalUsersUsername = principalUsers.map(
    (principalUser) => principalUser.username
  );
  const usersInDb = await db.user.findMany({
    where: {
      username: { in: principalUsersUsername },
    },
    select: {
      isApprover: true,
      username: true,
    },
  });

  const alreadyApprovers = usersInDb.filter((user) => user.isApprover);
  if (principalUsers.length === alreadyApprovers.length) return;

  const alreadyApproversUsernames = alreadyApprovers.map(
    (approver) => approver.username
  );
  const alreadyApproversUsernamesSet = new Set(alreadyApproversUsernames);

  const filteredPrincipalUsers = principalUsers.filter(
    (principalUser) => !alreadyApproversUsernamesSet.has(principalUser.username)
  );

  console.log(filteredPrincipalUsers);

  const usersInDbUsernameSet = new Set(usersInDb.map((user) => user.username));

  const filteredPrincipalUsersInDb: typeof filteredPrincipalUsers = [];
  const filteredPrincipalUsersNotInDb: typeof filteredPrincipalUsers = [];

  filteredPrincipalUsers.forEach((principalUser) => {
    if (usersInDbUsernameSet.has(principalUser.username)) {
      filteredPrincipalUsersInDb.push(principalUser);
    } else {
      filteredPrincipalUsersNotInDb.push(principalUser);
    }
  });

  const updatePromise = db.user.updateMany({
    where: {
      username: {
        in: filteredPrincipalUsersInDb.map(
          (principalUser) => principalUser.username
        ),
      },
    },
    data: {
      isApprover: true,
    },
  });

  const newPasswords = await Promise.all(
    filteredPrincipalUsersNotInDb.map((principalUser) => {
      return bcrypt.hash(principalUser.username + 'tsel889900!', 12);
    })
  );

  const createPromise = db.user.createMany({
    data: filteredPrincipalUsersNotInDb.map(
      ({ displayName, id, principalType, ...rest }, i) => ({
        ...rest,
        isApprover: true,
        role: Role.USER,
        principalUserId: id,
        password: newPasswords[i],
      })
    ),
  });

  await Promise.all([updatePromise, createPromise]);

  let logMessage = `${currentUser?.name} membuat approver baru dengan username: `;
  const newApproverUsernames = filteredPrincipalUsers
    .map((principalUser) => principalUser.username)
    .join(', ');

  logMessage += newApproverUsernames;

  await createLog(logMessage);
};
