import { db } from '../../db';
import { CreateFreezeTimeData } from '../validations';

export const createFreezeTimeService = async (data: CreateFreezeTimeData) => {
  const result = await db.freezeTime.create({ data, select: { id: true } });

  return { result };
};
