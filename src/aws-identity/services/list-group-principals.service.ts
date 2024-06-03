import { listGroups, listUsersInGroups } from '../helper';

export const listGroupPrincipalsService = async () => {
  const [groups, groupMemberships] = await Promise.all([
    listGroups(),
    listUsersInGroups(),
  ]);

  groups.sort((a, b) => {
    if (a.displayName && b.displayName) {
      return a.displayName.localeCompare(b.displayName);
    }

    return 0;
  });

  return {
    result: groups.map((group) => {
      const memberships = groupMemberships.get(group.id) || [];
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
