import { db } from '../../db';

export const listAssignmentRequestsService = async () => {
  const resDb = await db.assignmentRequest.findMany({
    select: {
      id: true,
      status: true,
      requestedAt: true,
      note: true,
      operation: true,
      permissionSets: true,
      requester: {
        select: {
          name: true,
          username: true,
        },
      },
      responder: {
        select: {
          name: true,
          username: true,
        },
      },
      respondedAt: true,
    },
    orderBy: {
      requestedAt: 'desc',
    },
  });

  const pendingData = resDb.filter((x) => x.status === 'PENDING');
  const notPendingData = resDb.filter((x) => x.status !== 'PENDING');

  return { result: [...pendingData, ...notPendingData] };
};
