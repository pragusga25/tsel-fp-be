import { ConflictException } from '@aws-sdk/client-identitystore';
import { createUserPrincipal } from '../helper';
import { CreateUserPrincipalData } from '../validations';
import { PrincipalConflictError } from '../errors';
import { createLog } from '../../__shared__/utils';
import { IJwtPayload } from '../../__shared__/interfaces';

export const createUserPrincipalService = async (
  data: CreateUserPrincipalData,
  currentUser?: IJwtPayload
) => {
  try {
    const result = await createUserPrincipal(data);
    await createLog(
      `${currentUser?.name} menambahkan principal group dengan nama ${data.displayName}`
    );
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
