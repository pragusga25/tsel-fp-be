import { Router } from 'express';
import {
  adminOnlyMiddleware,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { DeleteAccountsSchema } from '../validations';
import { deleteAccountsService } from '../services';

export const deleteAccountsRouter = Router();
deleteAccountsRouter.post(
  '/accounts.delete',
  adminOnlyMiddleware,
  validationBodyMiddleware(DeleteAccountsSchema),
  async (req: IAuthRequest, res) => {
    await deleteAccountsService(req.body);
    res.status(200).send({
      ok: true,
    });
  }
);
