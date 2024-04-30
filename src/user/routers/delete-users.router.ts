import { Router } from 'express';
import { adminOnlyMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { deleteUsersService } from '../services';

export const deleteUsersRouter = Router();
deleteUsersRouter.post(
  '/users.delete',
  adminOnlyMiddleware,
  async (req: IAuthRequest, res) => {
    await deleteUsersService(req.body);
    res.status(200).send({
      ok: true,
    });
  }
);
