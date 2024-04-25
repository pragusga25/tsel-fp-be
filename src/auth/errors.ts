import { HttpError } from '../__shared__/errors';

export class WrongCredentialsError extends HttpError {
  constructor() {
    super(404, 'auth/wrong-credentials', ['Username or password is incorrect']);
  }
}

export class UsernameTakenError extends HttpError {
  constructor() {
    super(404, 'auth/username-taken', ['Username already taken']);
  }
}
