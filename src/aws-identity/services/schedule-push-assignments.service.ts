import { db } from '../../db';
import { OperationFailedError } from '../errors';
import {
  createAccountAssignment,
  deleteAccountAssignment,
  listAccountAssignments,
} from '../helper';

export const schedulePushAssignmentsService = async () => {
  const currentDate = new Date().toISOString().split('T')[0];
  const now = new Date(currentDate);

  const assignmentsPromise = db.accountAssignment.findMany();
  const awsAssignmentsPromise = listAccountAssignments();

  const freezeTimePromise = db.freezeTime.findFirst({
    where: {
      AND: [{ startTime: { lte: now } }, { endTime: { gt: now } }],
    },
  });

  const [dbAssignments, freezeTime] = await Promise.all([
    assignmentsPromise,
    freezeTimePromise,
  ]);

  if (dbAssignments.length === 0) {
    throw new OperationFailedError([
      'No account assignments found. Please pull account assignments first.',
    ]);
  }

  if (freezeTime) {
    throw new OperationFailedError([
      'There is an active freeze time. Please wait until the freeze time ends.',
    ]);
  }

  const awsAssignments = await listAccountAssignments();

  const dbPrincipalIds = dbAssignments.map(
    (assignment) => assignment.principalId
  );
  const awsAssignmentsFiltered = awsAssignments.filter((assignment) =>
    dbPrincipalIds.includes(assignment.principalId)
  );

  const accountAssignmentSet = new Set<string>();

  for (let i = 0; i < dbAssignments.length; i++) {
    const dbAssignment = dbAssignments[i];
    dbAssignment.permissionSets.forEach((ps) => {
      const arn = (ps as { arn: string }).arn;
      const key = `${dbAssignment.principalType}-${dbAssignment.principalId}-${arn}`;
      accountAssignmentSet.add(key);
    });
  }

  const notDeletedMemo = new Set<string>();

  const deleteAccountAssignmentsPromises: Promise<void>[] = [];
  for (let i = 0; i < awsAssignmentsFiltered.length; i++) {
    const awsAssignmentFiltered = awsAssignmentsFiltered[i];
    const permissionSetArns = awsAssignmentFiltered.permissionSets.map(
      (ps) => ps.arn
    );
    permissionSetArns.forEach((psa) => {
      const key = `${awsAssignmentFiltered.principalType}-${awsAssignmentFiltered.principalId}-${psa}`;

      if (accountAssignmentSet.has(key)) {
        notDeletedMemo.add(key);
        return;
      }

      deleteAccountAssignmentsPromises.push(
        deleteAccountAssignment({
          permissionSetArn: psa,
          principalId: awsAssignmentFiltered.principalId,
          principalType: awsAssignmentFiltered.principalType,
        })
      );
    });
  }

  const createAccountAssignmentsPromises: Promise<void>[] = [];
  for (let i = 0; i < dbAssignments.length; i++) {
    const dbAssignment = dbAssignments[i];
    const permissionSetArns = dbAssignment.permissionSets.map(
      (ps) => (ps as { arn: string }).arn!
    );

    permissionSetArns.forEach((psa) => {
      const key = `${dbAssignment.principalType}-${dbAssignment.principalId}-${psa}`;
      if (notDeletedMemo.has(key)) {
        return;
      }
      createAccountAssignmentsPromises.push(
        createAccountAssignment({
          permissionSetArn: psa,
          principalId: dbAssignment.principalId,
          principalType: dbAssignment.principalType,
        })
      );
    });
  }

  await Promise.all([
    ...deleteAccountAssignmentsPromises,
    ...createAccountAssignmentsPromises,
  ]);
};
