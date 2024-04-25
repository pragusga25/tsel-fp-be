import { RequestHandler } from 'express';
import { BaseSchema } from 'valibot';
import { HttpError } from '../__shared__/errors';
type Args = 'body' | 'params' | 'query';

const validationMiddleware =
  (args: Args) =>
  (schema: BaseSchema): RequestHandler => {
    return (req, _res, next) => {
      const data = req[args];
      const { issues, output } = schema._parse(data);
      if (!issues) {
        req[args] = output;

        return next();
      }

      const messages = issues.map((issue) => issue.message);
      next(new HttpError(400, `request/invalid-${args}`, messages));
    };
  };

export const validationBodyMiddleware = validationMiddleware('body');
export const validationQueryMiddleware = validationMiddleware('query');
export const validationParamsMiddleware = validationMiddleware('params');
