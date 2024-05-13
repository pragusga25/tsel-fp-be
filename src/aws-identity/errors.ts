import { HttpError } from '../__shared__/errors';

export class OperationFailedError extends HttpError {
  constructor(details: string[]) {
    super(500, 'aws-identity/operation-failed', [
      'Operation failed',
      ...details,
    ]);
  }
}

export class AccountIdNotFoundError extends HttpError {
  constructor() {
    super(404, 'aws-identity/account-id-not-found', [
      'Account id not found. Make sure the credentials are correct.',
    ]);
  }
}

export class IdentityInstanceNotFoundError extends HttpError {
  constructor() {
    super(404, 'aws-identity/identity-instance-not-found', [
      'Identity instance data not found or not set yet',
    ]);
  }
}

export class AccountAssignmentAlreadyExistsError extends HttpError {
  constructor() {
    super(409, 'aws-identity/account-assignment-already-exists', [
      'Account assignment already exists',
    ]);
  }
}

export class AccountAssignmentNotFoundError extends HttpError {
  constructor() {
    super(404, 'aws-identity/account-assignment-not-found', [
      'Account assignment not found. Make sure the assignment exists.',
    ]);
  }
}

export class PermissionSetNotFoundError extends HttpError {
  constructor() {
    super(404, 'aws-identity/permission-set-not-found', [
      'Permission set not found. Make sure the permission set exists in the AWS SSO instance',
    ]);
  }
}

export class AssignmentRequestNotFoundError extends HttpError {
  constructor() {
    super(404, 'aws-identity/assignment-request-not-found', [
      'Assignment request not found. Make sure the request exists.',
    ]);
  }
}

export class AssignmentRequestNotPendingError extends HttpError {
  constructor(details: string[] = []) {
    super(404, 'aws-identity/assignment-request-not-pending', [
      'Assignment request is not pending. Make sure the request is pending.',
      ...details,
    ]);
  }
}

export class PullFailedError extends HttpError {
  constructor(details: string[] = []) {
    super(500, 'aws-identity/assignment-pull-failed', details);
  }
}

export class FreezeTimeConflictError extends HttpError {
  constructor(details: string[] = []) {
    super(400, 'aws-identity/freeze-time-conflict', details);
  }
}

export class PrincipalConflictError extends HttpError {
  constructor(details: string[] = []) {
    super(400, 'aws-identity/principal-conflict', details);
  }
}
