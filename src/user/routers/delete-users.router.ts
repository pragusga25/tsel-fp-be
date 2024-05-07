import { Router } from 'express';
import {
  adminOnlyMiddleware,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { deleteUsersService } from '../services';
import { DeleteUsersSchema } from '../validations';

export const deleteUsersRouter = Router();
deleteUsersRouter.post(
  '/users.delete',
  adminOnlyMiddleware,
  validationBodyMiddleware(DeleteUsersSchema),
  async (req: IAuthRequest, res) => {
    await deleteUsersService(req.body);
    res.status(200).send({
      ok: true,
    });
  }
);
