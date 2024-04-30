import { loginRouter } from './login.router';
import { logoutRouter } from './logout.router';
import { meRouter } from './me.router';
import { refreshAccessTokenRouter } from './refresh-access-token.router';
import { registerRouter } from './register.router';

export const authRouters = [
  loginRouter,
  registerRouter,
  meRouter,
  logoutRouter,
  refreshAccessTokenRouter,
];
