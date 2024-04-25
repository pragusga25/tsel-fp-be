import { describeAllPermissionSets } from '../helper';

export const listPermissionSetsService = async () => {
  const permissionSets = await describeAllPermissionSets();
  const result = permissionSets.map((permissionSet) => ({
    arn: permissionSet.permissionSetArn,
    name: permissionSet.name,
    description: permissionSet.description,
  }));

  return { result };
};
