import { listPrincipals } from '../helper';

export const listPrincipalsService = async () => {
  const result = await listPrincipals();

  return { result };
};
