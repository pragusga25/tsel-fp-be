import { ConflictException } from '@aws-sdk/client-identitystore';
import { updatePrincipalUser } from '../helper';
import { UpdatePrincipalUserData } from '../validations';
import { PrincipalConflictError } from '../errors';

export const updatePrincipalUserService = async (
  data: UpdatePrincipalUserData
) => {
  try {
    await updatePrincipalUser(data);
  } catch (err) {
    if (err instanceof ConflictException) {
      throw new PrincipalConflictError([
        'User already exists. Please use a different name.',
      ]);
    }
    throw err;
  }
};
