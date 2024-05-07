import { AssignmentOperation, AssignmentRequestStatus } from '@prisma/client';
import { createAccountAssignment, deleteAccountAssignment } from '../helper';
import { changeAssignmentStatusService } from './change-assignment-status.service';

export const acceptAssignmentRequestService = async (
  responderId: string,
  id: string,
  operation: AssignmentOperation
) => {
  await changeAssignmentStatusService(
    responderId,
    id,
    AssignmentRequestStatus.ACCEPTED,
    async (data) => {
      const accountAssignmentPromises = data.permissionSets.map(
        (permissionSet) => {
          if (operation === AssignmentOperation.ATTACH) {
            return createAccountAssignment({
              permissionSetArn: permissionSet.arn,
              principalId: data.principalId,
              principalType: data.principalType,
            });
          }

          deleteAccountAssignment({
            permissionSetArn: permissionSet.arn,
            principalId: data.principalId,
            principalType: data.principalType,
          });
        }
      );

      await Promise.all(accountAssignmentPromises);
    }
  );
};
