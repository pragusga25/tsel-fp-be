import { db } from '../../db';
import { listGroupsInUsers, listUsers } from '../helper';

export const listUserPrincipalsService = async () => {
  const identity = await db.identityInstance.findFirst();
  const [users, userMemberships] = await Promise.all([
    listUsers(identity?.identityStoreId),
    listGroupsInUsers(identity?.identityStoreId),
  ]);

  users.sort((a, b) => {
    if (a.displayName && b.displayName) {
      return a.displayName.localeCompare(b.displayName);
    }

    return 0;
  });

  const result = users.map((user) => {
    const memberships = userMemberships.get(user.id) || [];
    memberships.sort((a, b) => {
      if (a.groupDisplayName && b.groupDisplayName) {
        return a.groupDisplayName.localeCompare(b.groupDisplayName);
      }

      return 0;
    });

    return {
      ...user,
      memberships,
    };
  });

  return { result };
};
