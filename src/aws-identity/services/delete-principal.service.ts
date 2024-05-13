import { deletePrincipal } from '../helper';
import { DeletePrincipalData } from '../validations';

export const deletePrincipalService = async (data: DeletePrincipalData) => {
  await deletePrincipal(data);
};
