import { PrincipalType, Role } from '@prisma/client';
import { db } from '../../db';
import { PrincipalRequiredError, UsernameTakenError } from '../errors';
import { RegisterData } from '../validations';
import bcrypt from 'bcrypt';
import { describeGroup, describeUser } from '../../aws-identity/helper';

export const registerService = async (data: RegisterData) => {
  const { username, password } = data;

  const usernameTaken = await db.user.findUnique({
    where: { username },
  });

  if (usernameTaken) {
    throw new UsernameTakenError();
  }

  const { principalId, principalType, role } = data;

  if (role === Role.USER && (!principalId || !principalType)) {
    throw new PrincipalRequiredError();
  }

  let principalDisplayName: string | null = null;

  if (role === Role.USER && principalId && principalType) {
    const describePrincipals = {
      [PrincipalType.GROUP]: describeGroup,
      [PrincipalType.USER]: describeUser,
    };

    const describePrincipal = describePrincipals[principalType];

    const { displayName } = await describePrincipal(principalId);
    principalDisplayName = displayName;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await db.user.create({
    data: {
      ...data,
      password: hashedPassword,
      principalDisplayName,
    },
    select: { id: true },
  });

  return { result };
};
