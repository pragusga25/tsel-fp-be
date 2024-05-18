import { listPrincipals } from '../helper';

export const listPrincipalsService = async () => {
  const result = await listPrincipals();

  result.sort((a, b) => {
    if (a.displayName && b.displayName) {
      return a.displayName.localeCompare(b.displayName);
    }

    return 0;
  });

  return { result };
};
