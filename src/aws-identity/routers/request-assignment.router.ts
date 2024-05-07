import { asyncErrorHandler } from './../../__middlewares__/error.middleware';
import { Router } from 'express';
import { requestAssignmentService } from '../services';
import {
  userOnlyMiddleware,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { RequestAssignmentSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const requestAssignmentRouter = Router();
requestAssignmentRouter.post(
  '/assignments.request',
  userOnlyMiddleware,
  validationBodyMiddleware(RequestAssignmentSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    const result = await requestAssignmentService(
      req.user!.id,
      req.user!.principalId!,
      payload
    );
    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
