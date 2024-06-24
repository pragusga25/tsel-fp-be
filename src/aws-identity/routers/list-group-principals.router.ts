import { Router } from 'express';
import { listGroupPrincipalsService } from '../services';
import {
  asyncErrorHandler,
  authMiddleware,
  validationQueryMiddleware,
} from '../../__middlewares__';
import {
  ListGroupPrincipalsData,
  ListGroupPrincipalsSchema,
} from '../validations';

export const listGroupPrincipalsRouter = Router();
listGroupPrincipalsRouter.get(
  '/principals.groups.list',
  authMiddleware,
  validationQueryMiddleware(ListGroupPrincipalsSchema),
  asyncErrorHandler(async (req, res) => {
    const result = await listGroupPrincipalsService(
      req.query as unknown as ListGroupPrincipalsData
    );

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
