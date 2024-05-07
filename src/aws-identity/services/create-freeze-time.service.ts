import { db } from '../../db';
import { FreezeTimeConflictError } from '../errors';
import { CreateFreezeTimeData } from '../validations';

export const createFreezeTimeService = async (data: CreateFreezeTimeData) => {
  const { startTime, endTime } = data;
  const isIntersecting = await db.freezeTime.findMany({
    where: {
      AND: [{ startTime: { lte: endTime } }, { endTime: { gte: startTime } }],
    },
  });

  if (isIntersecting.length) {
    throw new FreezeTimeConflictError([
      'Freeze time is intersecting with existing freeze time',
    ]);
  }

  const result = await db.freezeTime.create({ data, select: { id: true } });

  return { result };
};

// data = s => 1 e => 5
// input = s => 2 e => 4
