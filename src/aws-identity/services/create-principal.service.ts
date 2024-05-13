import { ConflictException } from '@aws-sdk/client-identitystore';
import { createPrincipal } from '../helper';
import { CreatePrincipalData } from '../validations';
import { PrincipalConflictError } from '../errors';

export const createPrincipalService = async (data: CreatePrincipalData) => {
  try {
    const result = await createPrincipal(data);
    return { result };
  } catch (err) {
    if (err instanceof ConflictException) {
      throw new PrincipalConflictError([
        'Principal already exists. Please use a different name.',
      ]);
    }
    throw err;
  }
};
