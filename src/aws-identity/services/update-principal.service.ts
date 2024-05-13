import { ConflictException } from '@aws-sdk/client-identitystore';
import { updatePrincipal } from '../helper';
import { UpdatePrincipalData } from '../validations';
import { PrincipalConflictError } from '../errors';

export const updatePrincipalService = async (data: UpdatePrincipalData) => {
  try {
    await updatePrincipal(data);
  } catch (err) {
    if (err instanceof ConflictException) {
      throw new PrincipalConflictError([
        'Principal already exists. Please use a different name.',
      ]);
    }
    throw err;
  }
};
