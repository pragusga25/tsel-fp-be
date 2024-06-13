import { ConflictException } from '@aws-sdk/client-identitystore';
import { createGroupPrincipal } from '../helper';
import { CreateGroupPrincipalData } from '../validations';
import { PrincipalConflictError } from '../errors';
import { IJwtPayload } from '../../__shared__/interfaces';
import { createLog } from '../../__shared__/utils';

export const createGroupPrincipalService = async (
  data: CreateGroupPrincipalData,
  currentUser?: IJwtPayload
) => {
  try {
    const result = await createGroupPrincipal(data);
    await createLog(
      `${currentUser?.name} menambahkan principal group dengan nama ${data.displayName}`
    );
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
