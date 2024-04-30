import { Router } from 'express';

const logoutRouter = Router();

logoutRouter.get('/auth.logout', async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.status(200).send({ ok: true });
    return;
  }

  res.clearCookie('refreshToken');
  res.status(200).send({ ok: true });
});

export { logoutRouter };
