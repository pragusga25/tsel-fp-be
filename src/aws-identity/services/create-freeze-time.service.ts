import { db } from '../../db';
import {
  FreezeTimeConflictError,
  IdentityInstanceUnsetError,
  SchedulerUnsetError,
} from '../errors';
import { CreateFreezeTimeData } from '../validations';
// import { directFreezeAssignmentsService } from './direct-freeze-assignment.service';
import { createOneTimeSchedule } from '../helper';
import { IJwtPayload } from '../../__shared__/interfaces';
import { createLog, formatDateId } from '../../__shared__/utils';

export const createFreezeTimeService = async (
  data: CreateFreezeTimeData,
  currentUser?: IJwtPayload
) => {
  const { startTime, endTime } = data;
  const schedulerPromise = db.identityInstance.findFirst({});

  const isIntersectingPromise = db.freezeTime.findMany({
    where: {
      AND: [{ startTime: { lte: endTime } }, { endTime: { gt: startTime } }],
    },
  });

  const [scheduler, isIntersecting] = await Promise.all([
    schedulerPromise,
    isIntersectingPromise,
  ]);

  if (!scheduler) {
    throw new IdentityInstanceUnsetError([
      'Identity instance not found. Make sure to set the identity instance.',
    ]);
  }

  if (!scheduler.schedulerRoleArn || !scheduler.schedulerTargetArn) {
    throw new SchedulerUnsetError([
      'Scheduler not found. Make sure to set the scheduler.',
    ]);
  }

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

    const startTimeStr = formatDateId(startTime, true);
    const endTimeStr = formatDateId(endTime, true);

    const logMessage = `${currentUser?.name} membuat freeze time dengan nama ${data.name} dari ${startTimeStr} sampai ${endTimeStr}`;
    await createLog(logMessage, trx);

    return result;
  });

  return { result };
};
