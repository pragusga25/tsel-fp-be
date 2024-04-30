import { Router } from 'express';
import { authMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';

export const meRouter = Router();
meRouter.get('/auth.me', authMiddleware, async (req: IAuthRequest, res) => {
  res.status(200).send({
    ok: true,
    result: req.user,
  });
});
