import { AssignmentOperation } from '@prisma/client';
import { db } from '../../db';
import {
  createAccountAssignment,
  createOneTimeSchedulev1,
  describePermissionSet,
  sendEmailToRequester,
} from '../helper';
import { SchedulerAction } from '../types';
import { AcceptAssignmentUserRequestData } from '../validations';

export const acceptAssignmentUserRequestService = async (
  data: AcceptAssignmentUserRequestData,
  responderId: string
) => {
  const d = await db.assignmentUserRequest.findUniqueOrThrow({
    where: {
      id: data.id,
    },
    select: {
      principalId: true,
      awsAccountId: true,
      permissionSetArn: true,
      principalType: true,
      timeInHour: true,
      id: true,
    },
  });

  const endAt = new Date();
  endAt.setHours(endAt.getHours() + d.timeInHour);
  // endAt.setMinutes(endAt.getMinutes() + 10);

  await createOneTimeSchedulev1({
    name: `detach_prod_${d.id}`,
    input: {
      name: `detach_prod_${d.id}`,
      action: SchedulerAction.DETACH_PROD,
      id: d.id,
    },
    time: endAt,
  });

  await createAccountAssignment(d);

  await db.assignmentUserRequest.update({
    where: {
      id: data.id,
    },
    data: {
      status: 'ACCEPTED',
      responderId,
      endAt,
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
