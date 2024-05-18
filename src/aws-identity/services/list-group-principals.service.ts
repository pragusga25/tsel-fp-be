import { listGroups } from '../helper';

export const listGroupPrincipalsService = async () => {
  const result = await listGroups();

  result.sort((a, b) => {
    if (a.displayName && b.displayName) {
      return a.displayName.localeCompare(b.displayName);
    }

    return 0;
  });

  return { result };
};
