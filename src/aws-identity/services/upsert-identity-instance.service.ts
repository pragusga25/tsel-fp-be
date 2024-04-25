import { db } from '../../db';
import { IdentityInstanceData } from '../validations';

export const upsertIdentityInstanceService = async (
  data: IdentityInstanceData
) => {
  await db.$transaction(async (trx) => {
    const doesExist = await trx.identityInstance.findMany({});

    if (doesExist.length > 0) {
      await trx.identityInstance.deleteMany({});
    }

    await trx.identityInstance.create({
      data,
    });
  });
};
