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
    console.log('refreshToken', req.cookies.refreshToken);
    if (err instanceof UserNotFoundError) {
      console.error('ERR: ', err);
      HttpUtil.deleteCookie(res);
    }
    res.status(404).send({
      ok: true,
    });
  }
});
