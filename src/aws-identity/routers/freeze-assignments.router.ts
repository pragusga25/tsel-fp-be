import { Router } from 'express';
import { freezeAssignmentsService } from '../services';
import { apiKeyMiddleware, asyncErrorHandler } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';

export const freezeAssignmentsRouter = Router();
freezeAssignmentsRouter.post(
  '/assignments.freeze',
  apiKeyMiddleware,
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    // await freezeAssignmentsService();
    res.status(200).send({
      ok: true,
    });
  })
);
