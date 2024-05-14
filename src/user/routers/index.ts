import { deleteUsersRouter } from './delete-users.router';
import { listUsersRouter } from './list-users.router';
import { updateUserPasswordRouter } from './update-user-password.router';
import { updateUserPrincipalRouter } from './update-user-principal.router';

export const userRouters = [
  listUsersRouter,
  deleteUsersRouter,
  updateUserPasswordRouter,
  updateUserPrincipalRouter,
];
