import { Prisma } from '@prisma/client';
import { db } from '../../db';
import { AccountAssignmentAlreadyExistsError } from '../errors';
import { CreateAccountAssignmentData } from '../validations';
import { describePrincipal } from '../helper';

export const createAssignmentService = async (
  data: CreateAccountAssignmentData
) => {
  try {
    const { principalId, principalType } = data;

    const principal = await describePrincipal(principalId, principalType);
    const result = await db.accountAssignment.create({
      data: {
        ...data,
        principalDisplayName: principal.displayName,
      },
      select: { id: true },
    });
    return { result };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new AccountAssignmentAlreadyExistsError();
      }
    }

    throw err;
  }
};
