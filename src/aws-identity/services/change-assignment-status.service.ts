import { AssignmentRequestStatus, PrincipalType } from '@prisma/client';
import { db } from '../../db';
import {
  AssignmentRequestNotFoundError,
  AssignmentRequestNotPendingError,
} from '../errors';
import { PermissionSetsData } from '../validations';

type Data = {
  permissionSets: PermissionSetsData;
  principalId: string;
  principalType: PrincipalType;
};

export const changeAssignmentStatusService = async (
  responderId: string,
  id: string,
  status: AssignmentRequestStatus,
  cb?: (data: Data) => unknown
) => {
  await db.$transaction(async (trx) => {
    const currentData = await db.assignmentRequest.findUnique({
      where: {
        id,
      },
      select: {
        status: true,
      },
    });

    if (!currentData) {
      throw new AssignmentRequestNotFoundError();
    }

    if (currentData.status !== 'PENDING') {
      throw new AssignmentRequestNotPendingError([
        `The assignment request is in ${currentData.status} status.`,
      ]);
    }

    const res = await trx.assignmentRequest.update({
      where: {
        id,
      },
      data: {
        responderId,
        status: status,
        respondedAt: new Date(),
      },
      select: {
        permissionSets: true,
        requester: {
          select: {
            principalId: true,
            principalType: true,
          },
        },
      },
    });

    const data = {
      permissionSets: res.permissionSets,
      principalId: res.requester.principalId,
      principalType: res.requester.principalType,
    };

    cb?.(data as Data);
  });
};
