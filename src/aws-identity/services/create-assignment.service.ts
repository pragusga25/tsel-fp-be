import { Prisma } from '@prisma/client';
import { db } from '../../db';
import { AccountAssignmentAlreadyExistsError } from '../errors';
import { CreateAccountAssignmentData } from '../validations';

export const createAssignmentService = async (
  data: CreateAccountAssignmentData
) => {
  try {
    const result = await db.accountAssignment.create({
      data,
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
