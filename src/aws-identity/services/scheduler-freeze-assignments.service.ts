import { FreezeTimeTarget } from '@prisma/client';
import { db } from '../../db';
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
import { ExcludedPrincipals } from '../types';
import { createLog, sleep } from '../../__shared__/utils';
import { Response } from 'express';

export const schedulerFreezeAssignmentsService = async (
  name: string,
  res?: Response
) => {
  const assignmentPromise = db.accountAssignment.findFirst();

  const freezeTimePromise = db.freezeTime.findUnique({
    where: {
      name,
    },
  });

  const [assignment, freezeTime] = await Promise.all([
    assignmentPromise,
    freezeTimePromise,
  ]);

  if (!assignment) {
    throw new OperationFailedError([
      'No account assignments found. Please pull account assignments first.',
    ]);
  }

  if (!freezeTime) {
    throw new OperationFailedError([
      'No active freeze time found. Please create a freeze time first.',
    ]);
  }

  const doTheJob = async () => {
    let awsAssignmentsPromise = await listAccountAssignmentsv2();

    if (awsAssignmentsPromise.length === 0) {
      throw new AccountAssignmentInAWSNotFoundError();
    }

    let {
      target,
      permissionSetArns: permissionSetArnsFreeze,
      excludedPrincipals,
    } = freezeTime;

    const awsPermissionSetArns = await listPermissionSetArnsInSet();
    permissionSetArnsFreeze = permissionSetArnsFreeze.filter(
      (permissionSetArn) => awsPermissionSetArns.has(permissionSetArn)
    );
    const permissionSetArnsFreezeSet = new Set<string>(permissionSetArnsFreeze);

    if (excludedPrincipals && excludedPrincipals.length > 0) {
      const excluded = excludedPrincipals as ExcludedPrincipals;
      const excKeys = new Set(excluded.map(({ id, type }) => `${id}#${type}`));

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

      const permissionSetArnsAwsSet = new Set<string>(permissionSetArnsAws);

      // Delete all assignments that are not in the freeze list
      for (let j = 0; j < permissionSetArnsAws.length; j++) {
        const permissionSetArn = permissionSetArnsAws[j];
        if (permissionSetArnsFreezeSet.has(permissionSetArn)) {
          continue;
        }

        await deleteAccountAssignment({
          principalId: awsAssignment.principalId,
          principalType: awsAssignment.principalType,
          permissionSetArn: permissionSetArn,
          awsAccountId: awsAssignment.awsAccountId!,
        });

        await sleep(300);
      }

      // Create all assignments that are in the freeze list
      for (let j = 0; j < permissionSetArnsFreeze.length; j++) {
        const permissionSetArnFreeze = permissionSetArnsFreeze[j];
        if (permissionSetArnsAwsSet.has(permissionSetArnFreeze)) {
          continue;
        }

        await createAccountAssignment({
          principalId: awsAssignment.principalId,
          principalType: awsAssignment.principalType,
          permissionSetArn: permissionSetArnFreeze,
          awsAccountId: awsAssignment.awsAccountId!,
        });

        await sleep(300);
      }
    }
  };

  const executeStart = async () => {
    await db.freezeTime.update({
      where: {
        name,
      },
      data: {
        isExecutedAtStart: true,
      },
    });
  };

  if (res) {
    res.on('finish', async () => {
      await doTheJob();
      await executeStart();
      await createLog('Sistem melakukan freeze assignments');
    });
  } else {
    await doTheJob();
    await executeStart();
    await createLog('Sistem melakukan freeze assignments');
  }
};
