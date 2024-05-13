import { db } from '../../db';

export const listAssignmentsService = async () => {
  const result = await db.accountAssignment.findMany({
    orderBy: {
      principalDisplayName: 'asc',
    },
  });

  return { result };
};
