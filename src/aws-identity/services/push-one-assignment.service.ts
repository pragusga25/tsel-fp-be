import { db } from '../../db';
import { AccountAssignmentNotFoundError } from '../errors';
import {
  createAccountAssignment,
  deleteAccountAssignment,
  describePermissionSetsInPrincipal,
} from '../helper';
import { PushOneAssignmentData } from '../validations';

export const pushOneAssignmentService = async ({
  id,
}: PushOneAssignmentData) => {
  const assignment = await db.accountAssignment.findUnique({
    where: { id },
  });

  if (!assignment) {
    throw new AccountAssignmentNotFoundError();
  }

  const identity = await db.identityInstance.findFirst();

  const {
    principalId,
    principalType,
    permissionSetArns: permissionSetArnsFromDb,
    awsAccountId,
  } = assignment;

  const permissionSetsFromAws = await describePermissionSetsInPrincipal(
    principalId,
    principalType
  );

  const permissionSetArnsFromAws = permissionSetsFromAws.map(
    (ps) => ps.permissionSetArn
  ) as string[];

  const permissionSetsToAdd = permissionSetArnsFromDb.filter(
    (ps) => !permissionSetArnsFromAws.includes(ps)
  );

  const permissionSetsToRemove = permissionSetArnsFromAws.filter(
    (ps) => !permissionSetArnsFromDb.includes(ps)
  );

  const addPromises = permissionSetsToAdd.map((ps) =>
    createAccountAssignment(
      {
        principalId,
        principalType,
        permissionSetArn: ps,
        awsAccountId,
      },
      identity?.instanceArn
    )
  );

  const removePromises = permissionSetsToRemove.map((ps) =>
    deleteAccountAssignment(
      {
        permissionSetArn: ps,
        principalId,
        principalType,
        awsAccountId,
      },
      identity?.instanceArn
    )
  );

  await Promise.all([...addPromises, ...removePromises]);
  await db.accountAssignment.update({
    where: { id },
    data: {
      lastPushedAt: new Date(),
    },
  });
};
