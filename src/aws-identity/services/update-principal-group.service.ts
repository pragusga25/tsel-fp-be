import { ConflictException } from '@aws-sdk/client-identitystore';
import { updatePrincipalGroup } from '../helper';
import { UpdatePrincipalGroupData } from '../validations';
import { PrincipalConflictError } from '../errors';

export const updatePrincipalGroupService = async (
  data: UpdatePrincipalGroupData
) => {
  try {
    await updatePrincipalGroup(data);
  } catch (err) {
    if (err instanceof ConflictException) {
      throw new PrincipalConflictError([
        'Group already exists. Please use a different name.',
      ]);
    }
    throw err;
  }
};
