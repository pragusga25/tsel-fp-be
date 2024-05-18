import { Router } from 'express';
import { config } from '../../__shared__/config';

const logoutRouter = Router();

logoutRouter.get('/auth.logout', async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.status(200).send({ ok: true });
    return;
  }

  // res.clearCookie('refreshToken');
  res.cookie('refreshToken', '', {
    httpOnly: true,
    sameSite: 'none',
    secure: config.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
  res.status(200).send({ ok: true });
});

export { logoutRouter };
