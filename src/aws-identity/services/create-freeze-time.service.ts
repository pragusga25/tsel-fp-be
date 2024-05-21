import { db } from '../../db';
import { FreezeTimeConflictError } from '../errors';
import { CreateFreezeTimeData } from '../validations';
import { directFreezeAssignmentsService } from './direct-freeze-assignment.service';

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

  const todayDate = new Date().toISOString().split('T')[0];
  const startTimeDate = new Date(startTime).toISOString().split('T')[0];

  const result = await db.$transaction(async (trx) => {
    const result = await trx.freezeTime.create({ data, select: { id: true } });

    if (todayDate === startTimeDate) {
      // await directFreezeAssignmentsService(data);
    }

    return result;
  });

  return { result };
};
