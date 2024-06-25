import { FreezeTimeTarget } from '@prisma/client';
import {
  AccountAssignmentInAWSNotFoundError,
  OperationFailedError,
} from '../errors';
import {
  createAccountAssignment,
  deleteAccountAssignment,
  listAccountAssignmentsv2,
  listPermissionSetArnsInSet,
} from '../helper';
import { CreateFreezeTimeData } from '../validations';
import { db } from '../../db';
import { sleep } from '../../__shared__/utils';

export const directFreezeAssignmentsService = async (
  data: CreateFreezeTimeData
) => {
  const assignment = await db.accountAssignment.findFirst();

  if (!assignment) {
    throw new OperationFailedError([
      'No account assignments found. Please pull account assignments first.',
    ]);
  }

  let awsAssignmentsPromise = await listAccountAssignmentsv2();

  if (awsAssignmentsPromise.length === 0) {
    throw new AccountAssignmentInAWSNotFoundError();
  }

  const identity = await db.identityInstance.findFirst();

  let {
    target,
    permissionSetArns: permissionSetArnsFreeze,
    excludedPrincipals,
  } = data;

  const awsPermissionSetArns = await listPermissionSetArnsInSet();
  permissionSetArnsFreeze = permissionSetArnsFreeze.filter((permissionSetArn) =>
    awsPermissionSetArns.has(permissionSetArn)
  );

  const permissionSetArnsFreezeSet = new Set(permissionSetArnsFreeze);

  if (excludedPrincipals && excludedPrincipals.length > 0) {
    const excKeys = new Set(
      excludedPrincipals.map(({ id, type }) => `${id}#${type}`)
    );

    awsAssignmentsPromise = awsAssignmentsPromise.filter((awsAssignment) => {
      return !excKeys.has(
        `${awsAssignment.principalId}#${awsAssignment.principalType}`
      );
    });
  }

  for (let i = 0; i < awsAssignmentsPromise.length; i++) {
    const awsAssignment = awsAssignmentsPromise[i];

    if (
      awsAssignment.principalType !== target &&
      target !== FreezeTimeTarget.ALL
    ) {
      continue;
    }

    const permissionSetArnsAws = awsAssignment.permissionSets.map(
      (permissionSet) => permissionSet.arn
    );
    const permissionSetArnsAwsSet = new Set(permissionSetArnsAws);

    // Delete all assignments that are not in the freeze list
    for (let j = 0; j < permissionSetArnsAws.length; j++) {
      const permissionSetArn = permissionSetArnsAws[j];
      if (permissionSetArnsFreezeSet.has(permissionSetArn)) {
        continue;
      }

      await deleteAccountAssignment(
        {
          principalId: awsAssignment.principalId,
          principalType: awsAssignment.principalType,
          permissionSetArn: permissionSetArn,
          awsAccountId: awsAssignment.awsAccountId!,
        },
        identity?.instanceArn
      );

      await sleep(300);
    }

    // Create all assignments that are in the freeze list
    for (let j = 0; j < permissionSetArnsFreeze.length; j++) {
      const permissionSetArnFreeze = permissionSetArnsFreeze[j];
      if (permissionSetArnsAwsSet.has(permissionSetArnFreeze)) {
        continue;
      }

      await createAccountAssignment(
        {
          principalId: awsAssignment.principalId,
          principalType: awsAssignment.principalType,
          permissionSetArn: permissionSetArnFreeze,
          awsAccountId: awsAssignment.awsAccountId!,
        },
        identity?.instanceArn
      );

      await sleep(300);
    }
  }
};
