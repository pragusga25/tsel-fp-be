import { NextFunction, Response } from 'express';

import { IAuthRequest } from '../__shared__/interfaces';
import { JwtUtil } from '../__shared__/utils';
import {
  MissingAccessTokenError,
  MissingRefreshTokenError,
  UnauthorizedError,
} from '../__shared__/errors';
import { Role } from '@prisma/client';

const auth =
  (roles: Role[]) =>
  (req: IAuthRequest, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('TOKEN: ', token);
    console.log(typeof token);
    if (!token) {
      throw new MissingAccessTokenError();
    }
    console.log('HIII');

    const result = JwtUtil.verifyToken(token);

    if (!roles.includes(result.role)) {
      throw new UnauthorizedError();
    }
    req.user = result;
    next();
  };

export const adminOnlyMiddleware = auth([Role.ADMIN]);
export const userOnlyMiddleware = auth([Role.USER]);
export const authMiddleware = auth([Role.ADMIN, Role.USER]);

export const refreshTokenMiddleware = (
  req: IAuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new MissingRefreshTokenError();
  }

  const result = JwtUtil.verifyToken(refreshToken);
  req.user = result;

  next();
};
