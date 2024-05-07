import { deleteUsersRouter } from './delete-users.router';
import { listUsersRouter } from './list-users.router';
import { updateUserPasswordRouter } from './update-user-password.router';

export const userRouters = [
  listUsersRouter,
  deleteUsersRouter,
  updateUserPasswordRouter,
];
