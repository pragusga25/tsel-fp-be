import { Role } from '@prisma/client';
import { IJwtPayload } from '../../__shared__/interfaces';
import {
  describeAllPermissionSets,
  getPsTagsInfo,
  getUserMemberships,
} from '../helper';
import { db } from '../../db';

export const listPermissionSetsService = async (currentUser: IJwtPayload) => {
  const isUser = currentUser.role === Role.USER;
  // const username = currentUser.username;

  let permissionSets = await describeAllPermissionSets(true);

  if (isUser) {
    const user = await db.user.findUniqueOrThrow({
      where: {
        id: currentUser.id,
      },
    });

    const memberships = user.principalUserId
      ? await getUserMemberships(user.principalUserId)
      : [];

    const groupNames = memberships.map(
      ({ groupDisplayName }) => groupDisplayName
    );

    permissionSets = permissionSets.filter(({ tags }) => {
      const { isAll, isShow, showHideValue } = getPsTagsInfo(tags);

      if (isAll && isShow) {
        return true;
      }

      if (isAll && !isShow) {
        return false;
      }

      if (!isAll && isShow) {
        // return showHideValue.includes(username);
        return groupNames.some((groupName) =>
          showHideValue.includes(groupName)
        );
      }

      if (!isAll && !isShow) {
        // return !showHideValue.includes(username);
        return !groupNames.some((groupName) =>
          showHideValue.includes(groupName)
        );
      }
    });
  }

  const result = permissionSets.map((permissionSet) => ({
    arn: permissionSet.permissionSetArn,
    name: permissionSet.name,
    description: permissionSet.description,
    tags: isUser ? undefined : permissionSet.tags,
  }));

  return { result };
};
