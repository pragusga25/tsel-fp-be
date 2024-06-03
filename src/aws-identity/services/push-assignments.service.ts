import { sleep } from '../../__shared__/utils';
import { db } from '../../db';
import { OperationFailedError } from '../errors';
import {
  createAccountAssignment,
  deleteAccountAssignment,
  listAccountAssignmentsv2,
} from '../helper';

export const pushAssignmentsService = async () => {
  const dbAssignmentsPromise = db.accountAssignment.findMany();

  const [dbAssignments] = await Promise.all([dbAssignmentsPromise]);

  if (dbAssignments.length === 0) {
    throw new OperationFailedError([
      'No account assignments found in the database',
    ]);
  }

  const awsAssignments = await listAccountAssignmentsv2();

  const dbKeys = dbAssignments.map(({ principalId, awsAccountId }) => {
    const key = `${principalId}#${awsAccountId}`;

    return key;
  });

  const dbKeysSet = new Set(dbKeys);

  // filter out assignments that are not in the database
  const awsAssignmentsFiltered = awsAssignments.filter((assignment) => {
    const key = `${assignment.principalId}#${assignment.awsAccountId}`;

    return dbKeysSet.has(key);
  });

  // create a set of account assignments
  const accountAssignmentSet = new Set<string>();

  // for each assignment in the database, add the permission set to the set
  for (let i = 0; i < dbAssignments.length; i++) {
    const dbAssignment = dbAssignments[i];
    dbAssignment.permissionSetArns.forEach((arn) => {
      const key = `${dbAssignment.principalId}-${dbAssignment.awsAccountId}-${arn}`;
      accountAssignmentSet.add(key);
    });
  }

  // create a set of keys that were not deleted
  const notDeletedMemo = new Set<string>();

  // for each assignment in the filtered AWS assignments, check if the key is in the set of account assignments
  // if it is not, delete the account assignment
  for (let i = 0; i < awsAssignmentsFiltered.length; i++) {
    const awsAssignmentFiltered = awsAssignmentsFiltered[i];
    const permissionSetArns = awsAssignmentFiltered.permissionSets.map(
      (ps) => ps.arn
    );

    for (let j = 0; j < permissionSetArns.length; j++) {
      const psa = permissionSetArns[j];
      const key = `${awsAssignmentFiltered.principalId}-${awsAssignmentFiltered.awsAccountId}-${psa}`;

      if (accountAssignmentSet.has(key)) {
        notDeletedMemo.add(key);
        continue;
      }

      await deleteAccountAssignment({
        permissionSetArn: psa,
        principalId: awsAssignmentFiltered.principalId,
        principalType: awsAssignmentFiltered.principalType,
        awsAccountId: awsAssignmentFiltered.awsAccountId!,
      });

      await sleep(500);
    }
  }

  for (let i = 0; i < dbAssignments.length; i++) {
    const dbAssignment = dbAssignments[i];
    const permissionSetArns = dbAssignment.permissionSetArns;

    for (let j = 0; j < permissionSetArns.length; j++) {
      const psa = permissionSetArns[j];
      const key = `${dbAssignment.principalId}-${dbAssignment.awsAccountId}-${psa}`;

      if (notDeletedMemo.has(key)) {
        continue;
      }

      await createAccountAssignment({
        permissionSetArn: psa,
        principalId: dbAssignment.principalId,
        principalType: dbAssignment.principalType,
        awsAccountId: dbAssignment.awsAccountId,
      });
      await sleep(500);
    }
  }

  // update the last pushed at date for all account assignments
  await db.accountAssignment.updateMany({
    data: {
      lastPushedAt: new Date(),
    },
    where: {},
  });
};
