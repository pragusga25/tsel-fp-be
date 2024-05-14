import { Router } from 'express';
import { authMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { meService } from '../services';

export const meRouter = Router();
meRouter.get('/auth.me', authMiddleware, async (req: IAuthRequest, res) => {
  const result = await meService(req.user!.id);
  res.status(200).send({
    ok: true,
    ...result,
  });
});
