import { db } from '../../db';
import { describeAllPermissionSetsInMap } from '../helper';

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
      note: true,
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

  const permissionSetsMap = await describeAllPermissionSetsInMap();

  let result = freezes.map(({ permissionSetArns, ...rest }) => {
    let permissionSets = permissionSetArns.map((arn) => {
      const detail = permissionSetsMap.get(arn);

      return {
        arn,
        name: detail?.name,
      };
    });

    permissionSets = permissionSets.filter((ps) => ps.name);

    return {
      ...rest,
      permissionSets,
    };
  });

  result = result.filter((freeze) => freeze.permissionSets.length > 0);
  result.sort((a, b) => {
    return a.startTime.getTime() - b.startTime.getTime();
  });

  return { result };
};
