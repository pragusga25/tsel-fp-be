import { AssignmentRequestStatus, PrincipalType } from '@prisma/client';
import { db } from '../../db';
import {
  AssignmentRequestNotFoundError,
  AssignmentRequestNotPendingError,
} from '../errors';
import {
  describeAllPermissionSetsInMap,
  describeAwsAccount,
  describeGroup,
  sendEmailToRequester,
} from '../helper';
import { createLog } from '../../__shared__/utils';
import { Trx } from '../../__shared__/interfaces';

type Data = {
  permissionSetArns: string[];
  principalId: string;
  principalType: PrincipalType;
  awsAccountId: string;
};

export const changeAssignmentStatusService = async (
  responderId: string,
  id: string,
  status: AssignmentRequestStatus,
  cb?: (data: Data, trx: Trx) => unknown
) => {
  await db.$transaction(async (trx) => {
    const currentData = await db.assignmentRequest.findUnique({
      where: {
        id,
      },
      select: {
        status: true,
        principalId: true,
        awsAccountId: true,
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

    const permissionSetsInMapPromise = describeAllPermissionSetsInMap();
    const detailGroupPromise = describeGroup(currentData.principalId);
    const awsAccountPromise = describeAwsAccount(currentData.awsAccountId);

    const [permissionSetsInMap, detailGroup, awsAccount] = await Promise.all([
      permissionSetsInMapPromise,
      detailGroupPromise,
      awsAccountPromise,
    ]);

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
        permissionSetArns: true,
        principalId: true,
        principalType: true,
        awsAccountId: true,
        status: true,
        operation: true,
        responder: {
          select: {
            name: true,
          },
        },
        requester: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    cb?.(res, trx);

    const permissionSetsName = res.permissionSetArns.map((ps) => {
      const detail = permissionSetsInMap.get(ps)?.name ?? ps;

      return detail;
    });

    const responderName = res.responder?.name ?? 'System';
    const requesterName = res.requester?.name ?? 'Unknown';
    const permissionSetsStr = permissionSetsName.join(', ');
    const groupName = detailGroup.displayName ?? 'Unknown Group';
    const awsAccountName = awsAccount?.name ?? 'Unknown';
    const opsText = res.operation === 'ATTACH' ? 'pemberian' : 'penghapusan';

    let aksi = status === 'ACCEPTED' ? 'menyetujui' : 'menolak';

    const logMessage = `
      ${responderName} ${aksi} ${opsText} akses ${permissionSetsStr} pada grup ${groupName} di AWS akun ${awsAccountName} oleh ${requesterName}
    `;

    await createLog(logMessage, trx);

    await sendEmailToRequester({
      approverName: responderName,
      groupName,
      operation: res.operation,
      permissionSetNames: permissionSetsName,
      requesterEmail: res.requester.email ?? '',
      requesterName,
      status,
    }).catch(console.error);

    return res;
  });
};
