import express, { Request, Response } from 'express';
import { refreshTokenMiddleware } from '../../__middlewares__';
import { refreshAccessTokenService } from '../services';
import { HttpUtil } from '../../__shared__/utils';

export const refreshAccessTokenRouter = express.Router();

refreshAccessTokenRouter.get(
  '/auth.refresh',
  refreshTokenMiddleware,
  async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    try {
      const { accessToken, user } = await refreshAccessTokenService(
        refreshToken
      );

      res.status(200).json({
        ok: true,
        result: {
          accessToken,
          user,
        },
      });
    } catch (e) {
      console.error(e);
      HttpUtil.deleteCookie(res);
      throw e;
    }
  }
);
