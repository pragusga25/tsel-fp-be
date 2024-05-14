import { describePrincipal } from '../../aws-identity/helper';
import { db } from '../../db';
import { UpdateUserPrincipalData } from '../validations';

export const updateUserPrincipalService = async (
  data: UpdateUserPrincipalData
) => {
  const { principalId, principalType, userId } = data;

  const principal = await describePrincipal(principalId, principalType);

  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      principalType: principalType,
      principalId: principalId,
      principalDisplayName: principal.displayName,
    },
  });
};
