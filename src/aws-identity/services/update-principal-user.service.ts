import { ConflictException } from '@aws-sdk/client-identitystore';
import { updatePrincipalUser } from '../helper';
import { UpdatePrincipalUserData } from '../validations';
import { PrincipalConflictError } from '../errors';
import { db } from '../../db';
import { PrincipalType } from '@prisma/client';

export const updatePrincipalUserService = async (
  data: UpdatePrincipalUserData
) => {
  const { displayName, id } = data;
  try {
    await updatePrincipalUser(data);
    await db.user
      .updateMany({
        where: {
          principalId: id,
          principalType: PrincipalType.USER,
        },
        data: {
          principalDisplayName: displayName,
        },
      })
      .catch();
    await db.assignmentRequest
      .updateMany({
        where: {
          principalId: id,
          principalType: PrincipalType.USER,
        },
        data: {
          principalDisplayName: displayName,
        },
      })
      .catch();
    await db.accountAssignment
      .updateMany({
        where: { principalId: id, principalType: PrincipalType.USER },
        data: {
          principalDisplayName: displayName,
        },
      })
      .catch();
  } catch (err) {
    if (err instanceof ConflictException) {
      throw new PrincipalConflictError([
        'User already exists. Please use a different name.',
      ]);
    }
    throw err;
  }
};
