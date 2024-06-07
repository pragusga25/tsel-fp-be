import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';
import { Prisma, PrismaClient, Role } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

export interface IJwtPayload extends JwtPayload {
  id: string;
  username: string;
  role: Role;
  name: string;
  isRoot: boolean;
  isApprover: boolean;
  email?: string | null;
}

export interface IHttpErrorResponse {
  ok: false;
  error: {
    code: string;
    details?: string[];
  };
}

export interface IAuthRequest extends Request {
  user?: IJwtPayload;
}

export type Trx = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
