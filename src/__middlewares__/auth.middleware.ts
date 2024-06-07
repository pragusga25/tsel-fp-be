import { NextFunction, Request, Response } from 'express';

import { IAuthRequest } from '../__shared__/interfaces';
import { JwtUtil } from '../__shared__/utils';
import {
  MissingAccessTokenError,
  MissingRefreshTokenError,
  UnauthorizedError,
} from '../__shared__/errors';
import { Role } from '@prisma/client';
import { config } from '../__shared__/config';
import { db } from '../db';

const auth =
  (roles: Role[]) =>
  (req: IAuthRequest, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new MissingAccessTokenError();
    }

    const result = JwtUtil.verifyToken(token, true);

    if (!roles.includes(result.role)) {
      throw new UnauthorizedError();
    }

    req.user = {
      id: result.id,
      username: result.username,
      role: result.role,
      name: result.name,
      principalId: result.principalId,
      principalType: result.principalType,
      isRoot: result.isRoot,
      isApprover: result.isApprover,
      email: result.email,
    };
    next();
  };

export const apiKeyMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    throw new UnauthorizedError();
  }

  if (apiKey !== config.API_KEY) {
    throw new UnauthorizedError();
  }

  next();
};

export const rootOrApproverMiddleware =
  (throwErr = true) =>
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new MissingAccessTokenError();
    }

    const result = JwtUtil.verifyToken(token, true);
    const { id } = result;

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedError();
    }

    const grantAccess = !!user?.isApprover || !!user?.isRoot;

    if (!grantAccess) {
      if (throwErr) throw new UnauthorizedError();
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      principalId: result.principalId,
      principalType: result.principalType,
      isApprover: user.isApprover,
      isRoot: user.isRoot,
      email: user.email,
    };

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

  const result = JwtUtil.verifyToken(refreshToken, false);
  req.user = result;

  next();
};
