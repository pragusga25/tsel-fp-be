import { loginRouter } from './login.router';
import { logoutRouter } from './logout.router';
import { refreshAccessTokenRouter } from './refresh-access-token.router';

export const authRouters = [
  loginRouter,
  logoutRouter,
  refreshAccessTokenRouter,
];
