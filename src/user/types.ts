import { PrincipalType } from '@prisma/client';

export type PrincipalAwsAccountUserDetail = {
  id: string;
  principalId: string;
  principalType: PrincipalType;
  awsAccountId: string;
  principalDisplayName: string;
  awsAccountName: string;
};
