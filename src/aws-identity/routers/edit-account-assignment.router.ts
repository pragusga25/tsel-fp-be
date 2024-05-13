import { Router } from 'express';
import { editAccountAssignmentService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { EditAccountAssignmentSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const editAccountAssignmentRouter = Router();
editAccountAssignmentRouter.post(
  '/assignments.edit',
  adminOnlyMiddleware,
  validationBodyMiddleware(EditAccountAssignmentSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    editAccountAssignmentService(payload);

    res.status(200).send({
      ok: true,
    });
  })
);
