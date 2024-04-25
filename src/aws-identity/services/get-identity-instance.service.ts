import { db } from '../../db';

export const getIdentityInstanceService = async () => {
  const result = await db.identityInstance.findFirst({});

  return { result };
};
