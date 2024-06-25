import { db } from '../../db';
import { listPrincipals } from '../helper';

export const listPrincipalsService = async () => {
  const identity = await db.identityInstance.findFirst();
  const result = await listPrincipals(identity?.identityStoreId);

  result.sort((a, b) => {
    if (a.displayName && b.displayName) {
      return a.displayName.localeCompare(b.displayName);
    }

    return 0;
  });

  return { result };
};
