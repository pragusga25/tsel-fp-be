import { db } from '../../db';
import {
  describeAllPermissionSetsInMap,
  listAccountsInMap,
  listGroupsInMap,
} from '../helper';

export const listAssignmentsService = async () => {
  const accountAssignments = await db.accountAssignment.findMany({});

  if (accountAssignments.length === 0) {
    return { result: [] };
  }
  const identity = await db.identityInstance.findFirst();
  const awsAccountsPromise = listAccountsInMap();
  const groupsPromise = listGroupsInMap(identity?.identityStoreId);
  const permissionSetsPromise = describeAllPermissionSetsInMap(
    identity?.instanceArn
  );

  const [awsAccountsMap, groupsMap, permissionSetsMap] = await Promise.all([
    awsAccountsPromise,
    groupsPromise,
    permissionSetsPromise,
  ]);

  let result = accountAssignments.map(
    ({ permissionSetArns, awsAccountId, ...rest }) => {
      const { principalId } = rest;

      const group = groupsMap.get(principalId);
      let permissionSets = permissionSetArns.map((arn) => {
        const detail = permissionSetsMap.get(arn);

        return {
          arn,
          name: detail?.name,
        };
      });

      const awsAccountName = awsAccountsMap.get(awsAccountId)?.name;

      permissionSets = permissionSets.filter((ps) => ps.name);

      return {
        ...rest,
        awsAccountId,
        awsAccountName,
        permissionSets,
        principalDisplayName: group?.displayName,
      };
    }
  );

  result = result.filter(
    (assignment) =>
      assignment.permissionSets.length > 0 &&
      assignment.principalDisplayName &&
      assignment.awsAccountName
  );

  result.sort((a, b) => {
    const aName = a.principalDisplayName?.toLowerCase();
    const bName = b.principalDisplayName?.toLowerCase();

    if (aName && bName) {
      return aName.localeCompare(bName);
    }

    return 0;
  });

  return { result };
};
