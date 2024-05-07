import { HttpError } from '../__shared__/errors';

export class UserNotFoundError extends HttpError {
  constructor() {
    super(404, 'user/user-not-found', ['User not found.']);
  }
}

export class UserPasswordIncorrectError extends HttpError {
  constructor() {
    super(401, 'user/user-password-incorrect', ['Password is incorrect.']);
  }
}
