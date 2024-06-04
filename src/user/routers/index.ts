import { createAccountAdminRouter } from './create-account-admin.router';
import { createAccountUserRouter } from './create-account-user.router';
import { deleteAccountsRouter } from './delete-accounts.router';
import { listAccountAdminsRouter } from './list-account-admins.router';
import { listAccountUsersRouter } from './list-account-users.router';
import { meRouter } from './me.router';
import { resetAccountUserPasswordRouter } from './reset-account-user-password.router';
import { synchronizeAccountUserRouter } from './synchronize-account-user.router';
import { updateAccountPasswordRouter } from './update-account-password.router';
import { updateAccountUserRouter } from './update-account-user.router';

export const userRouters = [
  createAccountAdminRouter,
  createAccountUserRouter,
  deleteAccountsRouter,
  listAccountAdminsRouter,
  listAccountUsersRouter,
  updateAccountPasswordRouter,
  updateAccountUserRouter,
  meRouter,
  synchronizeAccountUserRouter,
  resetAccountUserPasswordRouter,
];
