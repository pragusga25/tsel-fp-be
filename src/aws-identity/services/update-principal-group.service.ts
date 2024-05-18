import { ConflictException } from '@aws-sdk/client-identitystore';
import { updatePrincipalGroup } from '../helper';
import { UpdatePrincipalGroupData } from '../validations';
import { PrincipalConflictError } from '../errors';
import { db } from '../../db';
import { PrincipalType } from '@prisma/client';

export const updatePrincipalGroupService = async (
  data: UpdatePrincipalGroupData
) => {
  const { displayName, id } = data;
  try {
    await updatePrincipalGroup(data);
    await db.user
      .updateMany({
        where: {
          principalId: id,
          principalType: PrincipalType.GROUP,
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
          principalType: PrincipalType.GROUP,
        },
        data: {
          principalDisplayName: displayName,
        },
      })
      .catch();
    await db.accountAssignment
      .updateMany({
        where: { principalId: id, principalType: PrincipalType.GROUP },
        data: {
          principalDisplayName: displayName,
        },
      })
      .catch();
  } catch (err) {
    if (err instanceof ConflictException) {
      throw new PrincipalConflictError([
        'Group already exists. Please use a different name.',
      ]);
    }
    throw err;
  }
};
