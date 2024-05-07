import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';
import { PrincipalType, Role } from '@prisma/client';

export interface IJwtPayload extends JwtPayload {
  id: string;
  username: string;
  role: Role;
  name: string;
  principalId?: string | null;
  principalType?: PrincipalType | null;
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
