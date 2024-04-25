import { db } from '../../db';
import {
  AccountAssignmentAlreadyExistsError,
  AccountIdNotFoundError,
  OperationFailedError,
} from '../errors';
import { getAccountId, ssoAdmin } from '../helper';
import { AccountAssignmentData } from '../validations';
import {
  StatusValues,
  CreateAccountAssignmentCommand,
} from '@aws-sdk/client-sso-admin';

export const createAssignmentService = async (data: AccountAssignmentData) => {
  // const { instanceArn, permissionSetArn, principalId, principalType } = data;
  // const doesExist = await db.accountAssignment.findUnique({
  //   where: {
  //     instanceArn_permissionSetArn_principalId: {
  //       instanceArn,
  //       permissionSetArn,
  //       principalId,
  //     },
  //   },
  // });
  // if (doesExist) throw new AccountAssignmentAlreadyExistsError();
  // const targetId = await getAccountId();
  // if (!targetId) throw new AccountIdNotFoundError();
  // const input = {
  //   TargetId: targetId,
  //   TargetType: 'AWS_ACCOUNT' as const,
  //   InstanceArn: instanceArn,
  //   PermissionSetArn: permissionSetArn,
  //   PrincipalId: principalId,
  //   PrincipalType: principalType,
  // };
  // const command = new CreateAccountAssignmentCommand(input);
  // const response = await ssoAdmin.send(command);
  // if (response.AccountAssignmentCreationStatus?.Status == StatusValues.FAILED) {
  //   throw new OperationFailedError();
  // }
  // const result = await db.accountAssignment.create({
  //   data,
  //   select: {
  //     id: true,
  //   },
  // });
  // return result;
};
