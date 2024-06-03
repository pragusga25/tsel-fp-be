import { Router } from 'express';
import { pushAssignmentsService } from '../services';
import { adminOnlyMiddleware, asyncErrorHandler } from '../../__middlewares__';

export const pushAssignmentsRouter = Router();
pushAssignmentsRouter.post(
  '/assignments.push',
  adminOnlyMiddleware,
  asyncErrorHandler(async (_req, res) => {
    // await pushAssignmentsService();
    res.on('finish', async () => {
      await pushAssignmentsService();
    });

    res.status(200).send({
      ok: true,
    });
  })
);
