import { Router } from 'express';
import { config } from '../../__shared__/config';
import { HttpUtil } from '../../__shared__/utils';

const logoutRouter = Router();

logoutRouter.get('/auth.logout', async (req, res) => {
  const { refreshToken } = req.cookies;
  console.log('refreshToken', refreshToken);

  if (!refreshToken) {
    res.status(200).send({ ok: true });
    return;
  }

  HttpUtil.deleteCookie(res);

  res.status(200).send({ ok: true });
});

export { logoutRouter };
