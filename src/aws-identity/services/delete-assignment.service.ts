import { db } from '../../db';
import { AccountAssignmentNotFoundError } from '../errors';
import {
  deleteAccountAssignment,
  describePermissionSetsInPrincipal,
  detachAllPermissionSetsFromPrincipal,
} from '../helper';
import { DeleteAccountAssignmentData } from '../validations';

export const deleteAssignmentService = async ({
  id,
}: DeleteAccountAssignmentData) => {
  const assignment = await db.accountAssignment.findUnique({
    where: { id },
    select: {
      principalId: true,
      principalType: true,
    },
  });

  if (!assignment) {
    throw new AccountAssignmentNotFoundError();
  }
  try {
    const { principalId, principalType } = assignment;
    await detachAllPermissionSetsFromPrincipal(principalId, principalType);
  } catch {}

  await db.accountAssignment.delete({
    where: { id },
  });
};
