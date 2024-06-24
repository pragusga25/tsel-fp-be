import { db } from '../../db';
import { DeleteTimeInHourData } from '../validations';

export const deleteTimeInHourService = async (data: DeleteTimeInHourData) => {
  await db.timeInHour.delete({
    where: {
      timeInHour: data.timeInHour,
    },
  });
};
