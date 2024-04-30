import express, { Request, Response } from 'express';
import { refreshTokenMiddleware } from '../../__middlewares__';
import { refreshAccessTokenService } from '../services';

export const refreshAccessTokenRouter = express.Router();

refreshAccessTokenRouter.get(
  '/auth.refresh',
  refreshTokenMiddleware,
  async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    const { accessToken, user } = await refreshAccessTokenService(refreshToken);

    res.status(200).json({
      ok: true,
      result: {
        accessToken,
        user,
      },
    });
  }
);
