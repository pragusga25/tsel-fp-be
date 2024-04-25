import { listInstances } from '../helper';

export const listInstancesService = async () => {
  const result = await listInstances();
  return { result };
};
