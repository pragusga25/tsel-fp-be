import { db } from '../../db';

export const listTimeInHoursService = async () => {
  const result = await db.timeInHour.findMany({
    select: {
      timeInHour: true,
      creator: {
        select: {
          name: true,
        },
      },
    },
  });

  return { result };
};
