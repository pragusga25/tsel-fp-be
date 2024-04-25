import { IHttpErrorResponse } from './interfaces';

export class HttpError extends Error {
  status: number;
  response: IHttpErrorResponse;

  constructor(status: number, code: string, details?: string[]) {
    super(details?.join(', '));
    this.status = status;
    this.response = {
      ok: false,
      error: {
        code,
        details,
      },
    };
  }
}

export class TokenInvalidError extends HttpError {
  constructor() {
    super(401, 'auth/token-invalid');
  }
}

export class TokenExpiredError extends HttpError {
  constructor() {
    super(401, 'auth/token-expired');
  }
}

export class MissingAccessTokenError extends HttpError {
  constructor() {
    super(401, 'auth/missing-access-token');
  }
}
