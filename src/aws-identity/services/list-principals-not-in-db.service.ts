import { db } from '../../db';
import { listPrincipals } from '../helper';

export const listPrincipalsNotInDbService = async () => {
  const principalsFromAwsPromise = listPrincipals();
  const principalsFromDbPromise = db.accountAssignment.findMany({
    select: {
      principalId: true,
      principalType: true,
    },
  });

  const [principalsFromAws, principalsFromDb] = await Promise.all([
    principalsFromAwsPromise,
    principalsFromDbPromise,
  ]);

  const principalsFromDbMap = new Map(
    principalsFromDb.map((p) => [p.principalId, p.principalType])
  );

  const principalsNotInDb = principalsFromAws.filter(
    (p) => !principalsFromDbMap.has(p.id)
  );

  return {
    result: principalsNotInDb.map((p) => ({
      id: p.id,
      type: p.principalType,
      displayName: p.displayName,
    })),
  };
};
