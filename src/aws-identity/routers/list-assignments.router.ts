import { Router } from 'express';
import { listAssignmentsService } from '../services';
import { adminOnlyMiddleware, asyncErrorHandler } from '../../__middlewares__';

export const listAssignmentsRouter = Router();
listAssignmentsRouter.get(
  '/assignments.list',
  adminOnlyMiddleware,
  asyncErrorHandler(async (_req, res) => {
    const result = await listAssignmentsService();

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
