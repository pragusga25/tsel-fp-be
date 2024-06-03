import { Response } from 'express';
import { db } from '../../db';
import { FreezeTimeConflictError } from '../errors';
import { CreateFreezeTimeData } from '../validations';
// import { directFreezeAssignmentsService } from './direct-freeze-assignment.service';
import { createOneTimeSchedule } from '../helper';

export const createFreezeTimeService = async (
  data: CreateFreezeTimeData,
  res?: Response
) => {
  const { startTime, endTime } = data;

  const isIntersecting = await db.freezeTime.findMany({
    where: {
      AND: [{ startTime: { lte: endTime } }, { endTime: { gt: startTime } }],
    },
  });

  if (isIntersecting.length) {
    throw new FreezeTimeConflictError([
      'Freeze time is intersecting with existing freeze time',
    ]);
  }

  const result = await db.$transaction(async (trx) => {
    const result = await trx.freezeTime.create({ data, select: { id: true } });
    await createOneTimeSchedule({
      name: data.name,
      startTime,
      endTime,
    });

    return result;
  });

  return { result };
};
