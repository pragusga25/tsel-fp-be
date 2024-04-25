import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

import { Role } from '@prisma/client';

export interface IJwtPayload extends JwtPayload {
  id: string;
  username: string;
  role: Role;
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
