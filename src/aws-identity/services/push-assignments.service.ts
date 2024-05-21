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

  // filter out assignments that are not in the database
  const awsAssignmentsFiltered = awsAssignments.filter((assignment) => {
    const key = `${assignment.principalId}#${assignment.awsAccountId}`;

    return dbKeys.includes(key);
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

  // create an array of promises to delete account assignments
  const deleteAccountAssignmentsPromises: Promise<void>[] = [];

  // for each assignment in the filtered AWS assignments, check if the key is in the set of account assignments
  // if it is not, delete the account assignment
  for (let i = 0; i < awsAssignmentsFiltered.length; i++) {
    const awsAssignmentFiltered = awsAssignmentsFiltered[i];
    const permissionSetArns = awsAssignmentFiltered.permissionSets.map(
      (ps) => ps.arn
    );
    permissionSetArns.forEach((psa) => {
      const key = `${awsAssignmentFiltered.principalId}-${awsAssignmentFiltered.awsAccountId}-${psa}`;

      if (accountAssignmentSet.has(key)) {
        notDeletedMemo.add(key);
        return;
      }

      deleteAccountAssignmentsPromises.push(
        deleteAccountAssignment({
          permissionSetArn: psa,
          principalId: awsAssignmentFiltered.principalId,
          principalType: awsAssignmentFiltered.principalType,
          awsAccountId: awsAssignmentFiltered.awsAccountId!,
        })
      );
    });
  }

  // create an array of promises to create account assignments
  const createAccountAssignmentsPromises: Promise<void>[] = [];

  // for each assignment in the database, check if the key is in the set of not deleted keys
  // if it is not, create the account assignment
  for (let i = 0; i < dbAssignments.length; i++) {
    const dbAssignment = dbAssignments[i];
    const permissionSetArns = dbAssignment.permissionSetArns;

    permissionSetArns.forEach((psa) => {
      const key = `${dbAssignment.principalId}-${dbAssignment.awsAccountId}-${psa}`;
      if (notDeletedMemo.has(key)) {
        return;
      }

      createAccountAssignmentsPromises.push(
        createAccountAssignment({
          permissionSetArn: psa,
          principalId: dbAssignment.principalId,
          principalType: dbAssignment.principalType,
          awsAccountId: dbAssignment.awsAccountId,
        })
      );
    });
  }

  // wait for all promises to resolve
  await Promise.all([
    ...deleteAccountAssignmentsPromises,
    ...createAccountAssignmentsPromises,
  ]);

  // update the last pushed at date for all account assignments
  await db.accountAssignment.updateMany({
    data: {
      lastPushedAt: new Date(),
    },
    where: {},
  });
};
