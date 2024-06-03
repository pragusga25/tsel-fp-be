import { PrincipalType } from '@prisma/client';

export type ExcludedPrincipal = {
  id: string;
  type: PrincipalType;
};

export type ExcludedPrincipals = ExcludedPrincipal[];
