import { db } from '../../db';
import {
  createAccountAssignment,
  deleteAccountAssignment,
  listAccountAssignments,
} from '../helper';

export const pushAssignmentsService = async () => {
  const dbAssignmentsPromise = db.accountAssignment.findMany();
  const awsAssignmentsPromise = listAccountAssignments();

  const [dbAssignments, awsAssignments] = await Promise.all([
    dbAssignmentsPromise,
    awsAssignmentsPromise,
  ]);

  const dbPrincipalIds = dbAssignments.map(
    (assignment) => assignment.principalId
  );
  const awsAssignmentsFiltered = awsAssignments.filter(
    (assignment) => !dbPrincipalIds.includes(assignment.principalId)
  );

  const deleteAccountAssignmentsPromises = awsAssignmentsFiltered.map((aaf) => {
    const permissionSetArns = aaf.permissionSets.map((ps) => ps.arn);
    return permissionSetArns.map((psa) => {
      return deleteAccountAssignment({
        permissionSetArn: psa,
        principalId: aaf.principalId,
        principalType: aaf.principalType,
      });
    });
  });

  const createAccountAssignmentsPromises = dbAssignments.map((da) => {
    const permissionSetArns = da.permissionSets.map(
      (ps) => (ps as { arn: string }).arn!
    );

    return permissionSetArns.map((psa) => {
      return createAccountAssignment({
        permissionSetArn: psa,
        principalId: da.principalId,
        principalType: da.principalType,
      });
    });
  });

  await Promise.all([
    ...deleteAccountAssignmentsPromises.flat(),
    ...createAccountAssignmentsPromises.flat(),
  ]);
};
