import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../__shared__/errors';

export const errorMiddleware = (
  err: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.info({
    path: req.path,
    method: req.method,
    status: err.status,
    error: err,
  });

  const status = err.status || 500;

  const response = err.response ?? {
    ok: false,
    error: {
      code: 'internal-server-error',
    },
  };

  res.status(status).send(response);
};

export const asyncErrorHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => unknown
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
