import { AssignmentOperation } from '@prisma/client';
import { db } from '../../db';
import { describePermissionSet, sendEmailToRequester } from '../helper';
import { RejectAssignmentUserRequestData } from '../validations';

export const rejectAssignmentUserRequestService = async (
  data: RejectAssignmentUserRequestData,
  responderId: string
) => {
  await db.assignmentUserRequest.update({
    where: {
      id: data.id,
    },
    data: {
      status: 'REJECTED',
      responderId,
    },
  });

  const res = await db.assignmentUserRequest.findUnique({
    where: {
      id: data.id,
    },
    select: {
      permissionSetArn: true,
      requester: {
        select: {
          email: true,
          name: true,
        },
      },

      responder: {
        select: {
          name: true,
        },
      },
      status: true,
    },
  });

  const ps = await describePermissionSet(res?.permissionSetArn ?? '');

  if (res && ps) {
    await sendEmailToRequester({
      approverName: res.responder?.name ?? '',
      groupName: res.requester?.name ?? '',
      operation: AssignmentOperation.ATTACH,
      permissionSetNames: [ps.name ?? ''],
      requesterEmail: res.requester.email ?? '',
      status: res.status,
      requesterName: res.requester.name ?? '',
    }).catch(console.error);
  }
};
