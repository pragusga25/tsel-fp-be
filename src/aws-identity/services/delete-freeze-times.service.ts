import { db } from '../../db';
import { deleteSchedule } from '../helper';
import { DeleteFreezeTimesData } from '../validations';

export const deleteFreezeTimesService = async (data: DeleteFreezeTimesData) => {
  const { ids } = data;
  await db.$transaction(async (trx) => {
    const fz = await trx.freezeTime.delete({
      where: {
        id: ids[0],
      },
      select: {
        name: true,
      },
    });

    await deleteSchedule(fz.name);
  });
};
