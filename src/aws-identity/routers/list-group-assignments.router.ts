import { Router } from 'express';
import { listGroupAssignmentsService } from '../services';
import { adminOnlyMiddleware, asyncErrorHandler } from '../../__middlewares__';

export const listGroupAssignmentsRouter = Router();
listGroupAssignmentsRouter.get(
  '/assignments.groups.list',
  adminOnlyMiddleware,
  asyncErrorHandler(async (_req, res) => {
    const result = await listGroupAssignmentsService();

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
