import { Role } from '@prisma/client';
import { IJwtPayload } from '../../__shared__/interfaces';
import { describeAllPermissionSets, getPsTagsInfo } from '../helper';

export const listPermissionSetsService = async (currentUser: IJwtPayload) => {
  const isUser = currentUser.role === Role.USER;
  const username = currentUser.username;

  let permissionSets = await describeAllPermissionSets(true);
  if (isUser) {
    permissionSets = permissionSets.filter(({ tags }) => {
      const { isAll, isShow, showHideValue } = getPsTagsInfo(tags);

      if (isAll && isShow) {
        return true;
      }

      if (isAll && !isShow) {
        return false;
      }

      if (!isAll && isShow) {
        return showHideValue.includes(username);
      }

      if (!isAll && !isShow) {
        return !showHideValue.includes(username);
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
