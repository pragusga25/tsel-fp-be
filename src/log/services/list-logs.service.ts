import { db } from '../../db';
import { ListLogsData } from '../validations';

export const listLogsService = async ({ cursor, from, to }: ListLogsData) => {
  const resultPromise = db.log.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    skip: cursor * 50,
    take: 50,
    where: {
      createdAt: {
        gte: from,
        lte: to,
      },
    },
  });

  const countAllPromise = db.log.count();

  const [result, countAll] = await Promise.all([
    resultPromise,
    countAllPromise,
  ]);

  const hasNextCursor = countAll > cursor * 50 + 50;

  return { result, nextCursor: hasNextCursor ? cursor + 1 : undefined };
};
