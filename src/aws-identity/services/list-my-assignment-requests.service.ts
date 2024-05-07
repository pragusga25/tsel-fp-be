import { db } from '../../db';

export const listMyAssignmentRequestsService = async (userId: string) => {
  const result = await db.assignmentRequest.findMany({
    select: {
      id: true,
      status: true,
      requestedAt: true,
      note: true,
      operation: true,
      permissionSets: true,
      responder: {
        select: {
          name: true,
          username: true,
        },
      },
      respondedAt: true,
    },
    where: {
      requesterId: userId,
    },
    orderBy: {
      requestedAt: 'desc',
    },
  });

  return { result };
};
