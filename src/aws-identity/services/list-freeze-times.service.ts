import { db } from '../../db';
import { describeAllPermissionSetsInMap, listPrincipalsInMap } from '../helper';
import { ExcludedPrincipal } from '../types';

export const listFreezeTimesService = async () => {
  const freezes = await db.freezeTime.findMany({
    select: {
      id: true,
      startTime: true,
      endTime: true,
      permissionSetArns: true,
      target: true,
      createdAt: true,
      updatedAt: true,
      name: true,
      excludedPrincipals: true,
      creator: {
        select: {
          name: true,
        },
      },
    },
  });

  if (freezes.length === 0) {
    return { result: [] };
  }

  const identity = await db.identityInstance.findFirst();

  const [permissionSetsMap, principals] = await Promise.all([
    describeAllPermissionSetsInMap(identity?.instanceArn),
    listPrincipalsInMap(identity?.identityStoreId),
  ]);

  let result = freezes.map(
    ({ permissionSetArns, excludedPrincipals, ...rest }) => {
      let permissionSets = permissionSetArns.map((arn) => {
        const detail = permissionSetsMap.get(arn);

        return {
          arn,
          name: detail?.name,
        };
      });

      permissionSets = permissionSets.filter((ps) => ps.name);
      const excs = excludedPrincipals as ExcludedPrincipal[];

      let excPrins = excs?.map((excluded) => {
        const detailPrincipal = principals.get(excluded.id);

        return {
          id: excluded.id,
          displayName: detailPrincipal?.displayName,
          type: excluded.type,
        };
      });

      excPrins = excPrins.filter((excluded) => !!excluded.displayName);

      return {
        ...rest,
        permissionSets,
        excludedPrincipals: excPrins,
      };
    }
  );

  result = result.filter((freeze) => freeze.permissionSets.length > 0);
  result.sort((a, b) => {
    return a.startTime.getTime() - b.startTime.getTime();
  });

  return { result };
};
