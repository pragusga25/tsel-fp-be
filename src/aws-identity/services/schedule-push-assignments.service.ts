import { db } from '../../db';
import { OperationFailedError } from '../errors';
import { createAccountAssignment, deleteAccountAssignment } from '../helper';

export const schedulePushAssignmentsService = async () => {
  const currentDate = new Date().toISOString().split('T')[0];
  const now = new Date(currentDate);

  const assignmentsPromise = db.accountAssignment.findMany();

  const freezeTimePromise = db.freezeTime.findFirst({
    where: {
      AND: [{ startTime: { lte: now } }, { endTime: { gt: now } }],
    },
  });

  const [assignments, freezeTime] = await Promise.all([
    assignmentsPromise,
    freezeTimePromise,
  ]);

  if (assignments.length === 0) {
    throw new OperationFailedError([
      'No account assignments found. Please pull account assignments first.',
    ]);
  }

  if (freezeTime) {
    throw new OperationFailedError([
      'There is an active freeze time. Please wait until the freeze time ends.',
    ]);
  }

  const createAccountAssignmentPromise: Promise<unknown>[] = [];
  const deleteAccountAssignmentPromise: Promise<unknown>[] = [];
  assignments.forEach((assignment) => {
    const permissionSetArns: string[] = assignment.permissionSets.map(
      (permissionSet) => (permissionSet as any).arn
    );
    permissionSetArns.forEach((permissionSet) => {
      createAccountAssignmentPromise.push(
        createAccountAssignment({
          principalId: assignment.principalId,
          principalType: assignment.principalType,
          permissionSetArn: permissionSet,
        })
      );

      deleteAccountAssignmentPromise.push(
        deleteAccountAssignment({
          principalId: assignment.principalId,
          principalType: assignment.principalType,
          permissionSetArn: permissionSet,
        })
      );
    });
  });

  await Promise.all(deleteAccountAssignmentPromise);
  await Promise.all(createAccountAssignmentPromise);
  // await Promise.all([
  //   ...deleteAccountAssignmentPromise,
  //   ...createAccountAssignmentPromise,
  // ]);
};
