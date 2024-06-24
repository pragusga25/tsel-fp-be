import { PrincipalType } from '@prisma/client';

export type ExcludedPrincipal = {
  id: string;
  type: PrincipalType;
};

export type ExcludedPrincipals = ExcludedPrincipal[];

export enum SchedulerAction {
  FREEZE = 'FREEZE',
  ROLLBACK = 'ROLLBACK',

  ATTACH_PROD = 'ATTACH_PROD',
  DETACH_PROD = 'DETACH_PROD',
}
