import { ConflictException } from '@aws-sdk/client-identitystore';
import { createUserPrincipal } from '../helper';
import { CreateUserPrincipalData } from '../validations';
import { PrincipalConflictError } from '../errors';

export const createUserPrincipalService = async (
  data: CreateUserPrincipalData
) => {
  try {
    const result = await createUserPrincipal(data);
    return { result };
  } catch (err) {
    if (err instanceof ConflictException) {
      throw new PrincipalConflictError([
        'Principal user already exists. Please use a different name.',
      ]);
    }
    throw err;
  }
};
