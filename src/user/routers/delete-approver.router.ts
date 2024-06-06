import { Router } from 'express';
import {
  adminOnlyMiddleware,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { DeleteApproverSchema } from '../validations';
import { deleteApproverService } from '../services';

export const deleteApproverRouter = Router();
deleteApproverRouter.post(
  '/approvers.delete',
  adminOnlyMiddleware,
  validationBodyMiddleware(DeleteApproverSchema),
  async (req: IAuthRequest, res) => {
    await deleteApproverService(req.body, req.user);
    res.status(200).send({
      ok: true,
    });
  }
);
