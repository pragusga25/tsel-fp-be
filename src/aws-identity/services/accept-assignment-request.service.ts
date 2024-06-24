import { AssignmentOperation, AssignmentRequestStatus } from '@prisma/client';
import {
  createAccountAssignment,
  deleteAccountAssignment,
  listPermissionSetArnsInSet,
} from '../helper';
import { changeAssignmentStatusService } from './change-assignment-status.service';

export const acceptAssignmentRequestService = async (
  responderId: string,
  id: string
) => {
  await changeAssignmentStatusService(
    responderId,
    id,
    AssignmentRequestStatus.ACCEPTED,
    async ({ permissionSetArns: psa, ...rest }, trx) => {
      const permissionSetArnssSet = await listPermissionSetArnsInSet();
      const permissionSetArns = psa.filter((permissionSetArn) =>
        permissionSetArnssSet.has(permissionSetArn)
      );
      const { operation } = await trx.assignmentRequest.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          operation: true,
        },
      });

      const accountAssignmentPromises = permissionSetArns.map(
        (permissionSetArn) => {
          if (operation === AssignmentOperation.ATTACH) {
            return createAccountAssignment({
              permissionSetArn,
              ...rest,
            });
          }

          deleteAccountAssignment({
            permissionSetArn,
            ...rest,
          });
        }
      );

      await Promise.all(accountAssignmentPromises);
    }
  );
};
