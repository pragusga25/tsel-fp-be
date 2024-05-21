import { db } from '../../db';
import {
  deletePrincipal,
  detachAllPermissionSetsFromPrincipal,
} from '../helper';
import { DeletePrincipalData } from '../validations';

export const deletePrincipalService = async (data: DeletePrincipalData) => {
  try {
    await detachAllPermissionSetsFromPrincipal(data.id, data.type).catch();
    await deletePrincipal(data).catch();
    await db.accountAssignment
      .deleteMany({
        where: {
          principalId: data.id,
          principalType: data.type,
        },
      })
      .catch();
    await db.principalAwsAccountUser
      .deleteMany({
        where: {
          principalId: data.id,
          principalType: data.type,
        },
      })
      .catch();
    await db.assignmentRequest
      .deleteMany({
        where: {
          principalId: data.id,
          principalType: data.type,
        },
      })
      .catch();
  } catch (err) {
    console.log(err);
  }
};
