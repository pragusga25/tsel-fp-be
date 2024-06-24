import { Prisma } from '@prisma/client';
import { db } from '../../db';
import { CreateTimeInHourData } from '../validations';
import { ConflictTimeInHourError } from '../errors';

export const createTimeInHourService = async (
  data: CreateTimeInHourData,
  creatorId: string
) => {
  try {
    await db.timeInHour.create({
      data: {
        timeInHour: data.timeInHour,
        creatorId,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        throw new ConflictTimeInHourError([
          'Time in hour already exists. Make sure the time in hour is unique.',
        ]);
      }
    }

    throw e;
  }
};
