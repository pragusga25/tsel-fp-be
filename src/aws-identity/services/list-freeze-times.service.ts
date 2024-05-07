import { db } from '../../db';

export const listFreezeTimesService = async () => {
  const result = await db.freezeTime.findMany({
    select: {
      id: true,
      startTime: true,
      endTime: true,
      permissionSets: true,
      target: true,
      createdAt: true,
      updatedAt: true,
      note: true,
      creator: {
        select: {
          name: true,
        },
      },
    },
  });

  return { result };
};
