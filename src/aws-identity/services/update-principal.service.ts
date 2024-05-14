import { ConflictException } from '@aws-sdk/client-identitystore';
import { updatePrincipal } from '../helper';
import { UpdatePrincipalData } from '../validations';
import { PrincipalConflictError } from '../errors';
import { db } from '../../db';

export const updatePrincipalService = async (data: UpdatePrincipalData) => {
  try {
    await updatePrincipal(data);
    await db.user.updateMany({
      where: {
        principalId: data.id,
        principalType: data.type,
      },
      data: {
        principalDisplayName: data.displayName,
      },
    });
    await db.assignmentRequest.updateMany({
      where: {
        principalId: data.id,
        principalType: data.type,
      },
      data: {
        principalDisplayName: data.displayName,
      },
    });
  } catch (err) {
    if (err instanceof ConflictException) {
      throw new PrincipalConflictError([
        'Principal already exists. Please use a different name.',
      ]);
    }
    throw err;
  }

  const { id, type, displayName } = data;

  try {
    await db.accountAssignment.update({
      where: { principalId: id, principalType: type },
      data: {
        principalDisplayName: displayName,
      },
    });
  } catch {}
};
