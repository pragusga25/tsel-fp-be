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
    // const permissionSetsFromAws = await describePermissionSetsInPrincipal(
    //   principalId,
    //   principalType
    // );

    // const permissionSetArnsFromAws = permissionSetsFromAws.map(
    //   (ps) => ps!.permissionSetArn
    // ) as string[];

    // const removePromises = permissionSetArnsFromAws.map((ps) =>
    //   deleteAccountAssignment({
    //     permissionSetArn: ps,
    //     principalId,
    //     principalType,
    //   })
    // );

    // await Promise.all(removePromises);
  } catch {}

  await db.accountAssignment.delete({
    where: { id },
  });
};
