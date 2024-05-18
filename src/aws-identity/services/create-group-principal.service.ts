import { ConflictException } from '@aws-sdk/client-identitystore';
import { createGroupPrincipal } from '../helper';
import { CreateGroupPrincipalData } from '../validations';
import { PrincipalConflictError } from '../errors';

export const createGroupPrincipalService = async (
  data: CreateGroupPrincipalData
) => {
  try {
    const result = await createGroupPrincipal(data);
    return { result };
  } catch (err) {
    if (err instanceof ConflictException) {
      throw new PrincipalConflictError([
        'Principal group already exists. Please use a different name.',
      ]);
    }
    throw err;
  }
};
