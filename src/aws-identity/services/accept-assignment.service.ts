import { AssignmentRequestStatus } from '@prisma/client';
import { createAccountAssignment } from '../helper';
import { changeAssignmentStatusService } from './change-assignment-status.service';

export const acceptAssignmentService = async (
  responderId: string,
  id: string
) => {
  await changeAssignmentStatusService(
    responderId,
    id,
    AssignmentRequestStatus.ACCEPTED,
    async (data) => {
      const accountAssignmentPromises = data.permissionSetArns.map(
        (permissionSetArn) =>
          createAccountAssignment({
            permissionSetArn,
            principalId: data.principalId,
            principalType: data.principalType,
          })
      );

      await Promise.all(accountAssignmentPromises);
    }
  );
};
