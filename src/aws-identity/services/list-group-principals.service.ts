import { db } from '../../db';
import { listGroups, listUsersInGroups } from '../helper';
import { ListGroupPrincipalsData } from '../validations';

export const listGroupPrincipalsService = async ({
  mode,
}: ListGroupPrincipalsData) => {
  const identity = await db.identityInstance.findFirst();
  const [groups, groupMemberships] = await Promise.all([
    listGroups(identity?.identityStoreId),
    mode === 'withMemberships'
      ? listUsersInGroups(identity?.identityStoreId)
      : null,
  ]);

  groups.sort((a, b) => {
    if (a.displayName && b.displayName) {
      return a.displayName.localeCompare(b.displayName);
    }

    return 0;
  });

  return {
    result: groups.map((group) => {
      const memberships = groupMemberships
        ? groupMemberships.get(group.id) || []
        : [];
      memberships.sort((a, b) => {
        if (a.userDisplayName && b.userDisplayName) {
          return a.userDisplayName.localeCompare(b.userDisplayName);
        }

        return 0;
      });

      return {
        ...group,
        memberships,
      };
    }),
  };
};
