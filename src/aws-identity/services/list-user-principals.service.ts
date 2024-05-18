import { listUsers } from '../helper';

export const listUserPrincipalsService = async () => {
  const result = await listUsers();

  result.sort((a, b) => {
    if (a.displayName && b.displayName) {
      return a.displayName.localeCompare(b.displayName);
    }

    return 0;
  });

  return { result };
};
