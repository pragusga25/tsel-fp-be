import { db } from '../../db';
import { AccountIdNotFoundError, OperationFailedError } from '../errors';
import { getAccountId, ssoAdmin } from '../helper';
import { AccountAssignmentData } from '../validations';
import {
  StatusValues,
  DeleteAccountAssignmentCommand,
} from '@aws-sdk/client-sso-admin';

export const deleteAssignmentService = async (data: AccountAssignmentData) => {
  // const targetId = await getAccountId();
  // if (!targetId) throw new AccountIdNotFoundError();
  // const { instanceArn, permissionSetArn, principalId, principalType } = data;
  // const input = {
  //   TargetId: targetId,
  //   TargetType: 'AWS_ACCOUNT' as const,
  //   InstanceArn: instanceArn,
  //   PermissionSetArn: permissionSetArn,
  //   PrincipalId: principalId,
  //   PrincipalType: principalType,
  // };
  // const command = new DeleteAccountAssignmentCommand(input);
  // const response = await ssoAdmin.send(command);
  // if (response.AccountAssignmentDeletionStatus?.Status == StatusValues.FAILED) {
  //   throw new OperationFailedError();
  // }
  // const result = await db.accountAssignment.delete({
  //   where: {
  //     instanceArn_permissionSetArn_principalId: {
  //       instanceArn,
  //       permissionSetArn,
  //       principalId,
  //     },
  //   },
  //   select: {
  //     id: true,
  //   },
  // });
  // return result;
};
