import { Router } from 'express';
import { authMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { meService } from '../services';
import { UserNotFoundError } from '../errors';
import { HttpUtil } from '../../__shared__/utils';

export const meRouter = Router();
meRouter.get('/me', authMiddleware, async (req: IAuthRequest, res) => {
  try {
    const result = await meService(req.user!.id);

    res.status(200).send({
      ok: true,
      ...result,
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      HttpUtil.deleteCookie(res);
    }
    throw err;
  }
});
