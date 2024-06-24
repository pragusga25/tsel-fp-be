import { db } from '../../db';
import { deleteAccountAssignment } from '../helper';

export const schedulerDetachAssignmentUserRequestService = async (
  id: string
) => {
  const d = await db.assignmentUserRequest.findUnique({
    where: {
      id,
    },
  });

  if (!d) return;

  await deleteAccountAssignment({
    permissionSetArn: d.permissionSetArn,
    principalId: d.principalId,
    principalType: d.principalType,
    awsAccountId: d.awsAccountId,
  });

  await db.assignmentUserRequest.update({
    where: {
      id,
    },
    data: { isExecutedAtEnd: true },
  });
};
