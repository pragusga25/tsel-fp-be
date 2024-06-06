import { db } from '../../db';

export const listLogsService = async () => {
  const result = await db.log.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { result };
};
