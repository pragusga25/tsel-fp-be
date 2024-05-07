import { db } from '../../db';
import { DeleteFreezeTimesData } from '../validations';

export const deleteFreezeTimesService = async (data: DeleteFreezeTimesData) => {
  const { ids } = data;
  await db.freezeTime.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
};
