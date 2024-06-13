import { IJwtPayload } from '../../__shared__/interfaces';
import { createLog } from '../../__shared__/utils';
import { db } from '../../db';
import { deleteSchedule } from '../helper';
import { DeleteFreezeTimesData } from '../validations';

export const deleteFreezeTimesService = async (
  data: DeleteFreezeTimesData,
  currentUser?: IJwtPayload
) => {
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
    let logMessage = `${currentUser?.name} menghapus freeze time dengan nama ${fz.name}`;
    await createLog(logMessage, trx);
  });
};
