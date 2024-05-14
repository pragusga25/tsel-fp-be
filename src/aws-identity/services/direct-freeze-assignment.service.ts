import { FreezeTimeTarget } from '@prisma/client';
import { db } from '../../db';
import { OperationFailedError } from '../errors';
import {
  createAccountAssignment,
  deleteAccountAssignment,
  listAccountAssignments,
  listGroups,
  listPrincipals,
  listUsers,
} from '../helper';
import { CreateFreezeTimeData } from '../validations';

export const directFreezeAssignmentsService = async (
  data: CreateFreezeTimeData
) => {
  const assignment = await db.accountAssignment.findFirst();

  if (!assignment) {
    throw new OperationFailedError([
      'No account assignments found. Please pull account assignments first.',
    ]);
  }

  const awsAssignmentsPromise = await listAccountAssignments();

  const { target, permissionSets } = data;

  const permissionSetArnsFreeze: string[] = permissionSets.map(
    (permissionSet) => (permissionSet as { arn: string }).arn
  );

  const principalsMap = {
    [FreezeTimeTarget.ALL]: listPrincipals,
    [FreezeTimeTarget.GROUP]: listGroups,
    [FreezeTimeTarget.USER]: listUsers,
  };

  const principals = await principalsMap[target]();

  const deleteAccountAssignmentPromise: Promise<unknown>[] = [];
  const memo = new Set<string>();

  console.log('AWS ASSIGNMENTS: ', awsAssignmentsPromise);

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

    permissionSetArnsAws.forEach((permissionSetArn) => {
      if (permissionSetArnsFreeze.includes(permissionSetArn)) {
        memo.add(
          `${awsAssignment.principalId}-${awsAssignment.principalType}-${permissionSetArn}`
        );
        return;
      }

      deleteAccountAssignmentPromise.push(
        deleteAccountAssignment({
          principalId: awsAssignment.principalId,
          principalType: awsAssignment.principalType,
          permissionSetArn: permissionSetArn,
        })
      );
    });
  }

  const createAccountAssignmentPromise: Promise<unknown>[] = [];
  for (let i = 0; i < principals.length; i++) {
    const principal = principals[i];

    permissionSetArnsFreeze.forEach((permissionSet) => {
      const key = `${principal.id}-${principal.principalType}-${permissionSet}`;
      if (memo.has(key)) {
        return;
      }
      createAccountAssignmentPromise.push(
        createAccountAssignment({
          principalId: principal.id,
          principalType: principal.principalType,
          permissionSetArn: permissionSet,
        })
      );
    });
  }

  await Promise.all([
    ...deleteAccountAssignmentPromise,
    ...createAccountAssignmentPromise,
  ]);
};
