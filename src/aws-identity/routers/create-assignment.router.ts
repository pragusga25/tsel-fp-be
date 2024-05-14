import { Router } from 'express';
import { createAssignmentService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { CreateAccountAssignmentSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const createAssignmentRouter = Router();
createAssignmentRouter.post(
  '/assignments.create',
  adminOnlyMiddleware,
  validationBodyMiddleware(CreateAccountAssignmentSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    const result = await createAssignmentService(payload);

    res.status(201).send({
      ok: true,
      ...result,
    });
  })
);
